import pool from "../lib/dbConnect.js";
import { emitToRoles } from "../realtime/socketEmitter.js";
import { SOCKET_EVENTS } from "../realtime/socketEvents.js";
import { notifyExternalEmergencyServices } from "./externalEmergency.js";

type DueIncidentRow = {
  id: string;
  emergency_session_id: string | null;
  status: "active" | "acknowledged";
  priority: "low" | "medium" | "high" | "critical";
  alert_id: string | null;
  sos_request_id: string | null;
};

const DEFAULT_POLL_MS = 30000;
const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_SLA_MINUTES = 5;

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function claimDueIncidents(
  slaMinutes: number,
  batchSize: number,
): Promise<DueIncidentRow[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const dueResult = await client.query<DueIncidentRow>(
      `
        SELECT
          id,
          emergency_session_id,
          status,
          priority,
          alert_id,
          sos_request_id
        FROM incidents
        WHERE status IN ('active', 'acknowledged')
          AND escalated_at IS NULL
          AND created_at <= now() - ($1 || ' minutes')::interval
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $2
      `,
      [String(slaMinutes), batchSize],
    );

    for (const incident of dueResult.rows) {
      await client.query(
        `
          UPDATE incidents
          SET
            status = 'escalated',
            escalated_at = COALESCE(escalated_at, now()),
            updated_at = now()
          WHERE id = $1
        `,
        [incident.id],
      );

      await client.query(
        `
          INSERT INTO incident_status_history (
            incident_id,
            from_status,
            to_status,
            changed_by,
            reason
          )
          VALUES ($1, $2::incident_status, 'escalated', NULL, 'SLA breach auto-escalation')
        `,
        [incident.id, incident.status],
      );

      await client.query(
        `
          INSERT INTO audit_log (
            actor_user_id,
            action,
            entity_type,
            entity_id,
            meta
          )
          VALUES (
            NULL,
            'incident_auto_escalated',
            'incident',
            $1,
            jsonb_build_object('from_status', $2, 'reason', 'sla_breach')
          )
        `,
        [incident.id, incident.status],
      );

      await client.query(
        `
          INSERT INTO notification_deliveries (
            user_id,
            emergency_session_id,
            incident_id,
            channel,
            status,
            title,
            body,
            data
          )
          SELECT
            u.id,
            $1,
            $2,
            'websocket',
            'queued',
            'Incident Auto-Escalated',
            'Incident breached SLA and was escalated to emergency services.',
            jsonb_build_object('incident_id', $2, 'event_type', 'incident_auto_escalated')
          FROM users u
          WHERE u.is_active = true
            AND u.role IN ('staff', 'responder')
        `,
        [incident.emergency_session_id, incident.id],
      );

      await client.query(
        `
          INSERT INTO notification_deliveries (
            user_id,
            emergency_session_id,
            incident_id,
            channel,
            status,
            title,
            body,
            data
          )
          SELECT
            u.id,
            $1,
            $2,
            'fcm',
            'queued',
            'Incident Auto-Escalated',
            'Incident breached SLA and was escalated to emergency services.',
            jsonb_build_object('incident_id', $2, 'event_type', 'incident_auto_escalated')
          FROM users u
          INNER JOIN device_push_tokens dpt
            ON dpt.user_id = u.id
           AND dpt.is_active = true
          WHERE u.is_active = true
            AND u.role IN ('staff', 'responder')
        `,
        [incident.emergency_session_id, incident.id],
      );

      await client.query(
        `
          UPDATE notification_deliveries
          SET
            status = 'sent',
            sent_at = COALESCE(sent_at, now()),
            updated_at = now()
          WHERE incident_id = $1
            AND channel = 'websocket'
            AND status = 'queued'
        `,
        [incident.id],
      );
    }

    await client.query("COMMIT");
    return dueResult.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function fanOutEscalationEvents(dueRows: DueIncidentRow[]) {
  for (const incident of dueRows) {
    emitToRoles(["staff", "responder"], SOCKET_EVENTS.INCIDENT_UPDATED, {
      incident_id: incident.id,
      status: "escalated",
      reason: "sla_breach_auto_escalation",
      emergency_session_id: incident.emergency_session_id,
    });

    const sourceType = incident.sos_request_id ? "sos" : "alert";
    const sourceId =
      incident.sos_request_id ?? incident.alert_id ?? incident.id;

    try {
      await notifyExternalEmergencyServices({
        incidentId: incident.id,
        emergencySessionId: incident.emergency_session_id,
        issueText: "SLA breached. Incident auto-escalated.",
        escalatedByUserId: null,
        sourceType,
        sourceId,
        priority: incident.priority,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown external escalation error";
      console.error("[incidentSlaWorker] External escalation failed", {
        incidentId: incident.id,
        message,
      });
    }
  }
}

export function startIncidentSlaWorker(): () => void {
  const pollMs = toNumber(process.env.INCIDENT_SLA_POLL_MS, DEFAULT_POLL_MS);
  const batchSize = toNumber(
    process.env.INCIDENT_SLA_BATCH_SIZE,
    DEFAULT_BATCH_SIZE,
  );
  const slaMinutes = toNumber(
    process.env.INCIDENT_SLA_MINUTES,
    DEFAULT_SLA_MINUTES,
  );

  let isRunning = false;

  const tick = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const dueRows = await claimDueIncidents(slaMinutes, batchSize);

      if (dueRows.length > 0) {
        await fanOutEscalationEvents(dueRows);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown SLA worker polling error";
      console.error("[incidentSlaWorker] Polling error", message);
    } finally {
      isRunning = false;
    }
  };

  const intervalId = setInterval(() => {
    void tick();
  }, pollMs);

  void tick();
  console.log(
    `[incidentSlaWorker] started with poll=${pollMs}ms batch=${batchSize} sla=${slaMinutes}m`,
  );

  return () => {
    clearInterval(intervalId);
    console.log("[incidentSlaWorker] stopped");
  };
}
