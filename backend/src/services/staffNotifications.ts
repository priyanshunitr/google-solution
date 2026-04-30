import pool from "../lib/dbConnect.js";
import { emitToRoles } from "../realtime/socketEmitter.js";
import { SOCKET_EVENTS } from "../realtime/socketEvents.js";
import { notifyExternalEmergencyServices } from "./externalEmergency.js";

// Fetch paginated staff notifications, with optional unseen-only filtering.__________________________________
export async function listStaffNotifications(
  userId: string,
  params: {
    limit: number;
    offset: number;
    unseenOnly: boolean;
  },
) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        emergency_session_id,
        incident_id,
        channel,
        status,
        title,
        body,
        data,
        queued_at,
        sent_at,
        delivered_at,
        seen_at,
        created_at
      FROM notification_deliveries
      WHERE user_id = $1
        AND ($2 = false OR seen_at IS NULL)
      ORDER BY created_at DESC
      LIMIT $3
      OFFSET $4
    `,
    [userId, params.unseenOnly, params.limit, params.offset],
  );

  return result.rows;
}

// Mark a specific staff notification as seen for the owning user_______________________________________________________________________________________
export async function markStaffNotificationSeen(
  notificationId: string,
  userId: string,
) {
  const result = await pool.query(
    `
      UPDATE notification_deliveries
      SET
        seen_at = COALESCE(seen_at, now()),
        status = CASE WHEN status IN ('queued', 'sent', 'delivered') THEN 'seen' ELSE status END,
        updated_at = now()
      WHERE id = $1
        AND user_id = $2
      RETURNING id, user_id, status, seen_at, updated_at
    `,
    [notificationId, userId],
  );

  return result.rows[0] ?? null;
}

// Mark a specific staff notification as false alarm/invalidated for the owning user.________________________
export async function markStaffNotificationFalse(
  notificationId: string,
  userId: string,
) {
  const result = await pool.query(
    `
      UPDATE notification_deliveries
      SET
        status = 'invalidated',
        seen_at = COALESCE(seen_at, now()),
        data = data || jsonb_build_object('staff_action', 'false', 'staff_action_at', now()),
        updated_at = now()
      WHERE id = $1
        AND user_id = $2
      RETURNING id, user_id, status, seen_at, updated_at, data
    `,
    [notificationId, userId],
  );

  return result.rows[0] ?? null;
}

// Verify/escalate a notification into an incident and log escalation metadata atomically.____________________________________________________________
export async function sendStaffNotificationToEmergencyServices(
  notificationId: string,
  userId: string,
  issueText: string,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const notificationResult = await client.query<{
      id: string;
      user_id: string;
      data: Record<string, unknown>;
    }>(
      `
        SELECT id, user_id, data
        FROM notification_deliveries
        WHERE id = $1
          AND user_id = $2
        FOR UPDATE
      `,
      [notificationId, userId],
    );

    const notification = notificationResult.rows[0];

    if (!notification) {
      await client.query("ROLLBACK");
      return { kind: "not_found" as const };
    }

    const sourceTypeRaw = notification.data?.source_type;
    const sourceIdRaw = notification.data?.source_id;

    const sourceType =
      typeof sourceTypeRaw === "string" &&
      (sourceTypeRaw === "alert" || sourceTypeRaw === "sos")
        ? sourceTypeRaw
        : "alert";

    const sourceId =
      typeof sourceIdRaw === "string" && sourceIdRaw.length > 0
        ? sourceIdRaw
        : typeof notification.data?.alert_id === "string"
          ? String(notification.data.alert_id)
          : null;

    if (!sourceId) {
      await client.query("ROLLBACK");
      return { kind: "invalid_source" as const };
    }

    const incidentMatchColumn =
      sourceType === "sos" ? "sos_request_id" : "alert_id";

    const existingIncidentResult = await client.query<{
      id: string;
      status: string;
    }>(
      `
        SELECT id, status
        FROM incidents
        WHERE ${incidentMatchColumn} = $1
        LIMIT 1
        FOR UPDATE
      `,
      [sourceId],
    );

    let incidentId: string;
    let previousStatus: string | null = null;

    if (existingIncidentResult.rows[0]) {
      incidentId = existingIncidentResult.rows[0].id;
      previousStatus = existingIncidentResult.rows[0].status;

      await client.query(
        `
          UPDATE incidents
          SET status = 'escalated',
              assigned_staff_user_id = COALESCE(assigned_staff_user_id, $2),
              escalated_at = COALESCE(escalated_at, now()),
              updated_at = now()
          WHERE id = $1
        `,
        [incidentId, userId],
      );
    } else if (sourceType === "alert") {
      const insertIncidentResult = await client.query<{ id: string }>(
        `
          INSERT INTO incidents (
            emergency_session_id,
            incident_type,
            status,
            priority,
            alert_id,
            assigned_staff_user_id,
            escalated_at
          )
          SELECT
            a.emergency_session_id,
            'alert',
            'escalated',
            a.severity,
            a.id,
            $1,
            now()
          FROM alerts a
          WHERE a.id = $2
          RETURNING id
        `,
        [userId, sourceId],
      );

      if (!insertIncidentResult.rows[0]) {
        await client.query("ROLLBACK");
        return { kind: "source_not_found" as const, sourceType };
      }

      incidentId = insertIncidentResult.rows[0].id;
    } else {
      const insertIncidentResult = await client.query<{ id: string }>(
        `
          INSERT INTO incidents (
            emergency_session_id,
            incident_type,
            status,
            priority,
            sos_request_id,
            assigned_staff_user_id,
            escalated_at
          )
          SELECT
            s.emergency_session_id,
            'sos',
            'escalated',
            'critical',
            s.id,
            $1,
            now()
          FROM sos_requests s
          WHERE s.id = $2
          RETURNING id
        `,
        [userId, sourceId],
      );

      if (!insertIncidentResult.rows[0]) {
        await client.query("ROLLBACK");
        return { kind: "source_not_found" as const, sourceType };
      }

      incidentId = insertIncidentResult.rows[0].id;
    }

    await client.query(
      `
        INSERT INTO incident_status_history (
          incident_id,
          from_status,
          to_status,
          changed_by,
          reason
        )
        VALUES ($1, $2::incident_status, 'escalated', $3, $4)
      `,
      [incidentId, previousStatus, userId, issueText],
    );

    await client.query(
      `
        UPDATE notification_deliveries
        SET
          status = 'seen',
          seen_at = COALESCE(seen_at, now()),
          incident_id = COALESCE(incident_id, $2),
          data = data || jsonb_build_object(
            'staff_action', 'verified',
            'staff_issue_text', $3,
            'staff_escalated_at', now(),
            'incident_id', $2
          ),
          updated_at = now()
        WHERE id = $1
      `,
      [notificationId, incidentId, issueText],
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
          $1,
          'staff_send_to_emergency_services',
          'incident',
          $2,
          jsonb_build_object('issue_text', $3, 'source_type', $4, 'source_id', $5)
        )
      `,
      [userId, incidentId, issueText, sourceType, sourceId],
    );

    await client.query("COMMIT");

    const incidentMetaResult = await pool.query<{
      priority: "low" | "medium" | "high" | "critical";
      emergency_session_id: string | null;
    }>(
      `
        SELECT priority, emergency_session_id
        FROM incidents
        WHERE id = $1
        LIMIT 1
      `,
      [incidentId],
    );

    const incidentMeta = incidentMetaResult.rows[0];

    emitToRoles(["staff", "responder"], SOCKET_EVENTS.INCIDENT_UPDATED, {
      incident_id: incidentId,
      status: "escalated",
      reason: issueText,
      emergency_session_id: incidentMeta?.emergency_session_id ?? null,
    });

    try {
      await notifyExternalEmergencyServices({
        incidentId,
        emergencySessionId: incidentMeta?.emergency_session_id ?? null,
        issueText,
        escalatedByUserId: userId,
        sourceType,
        sourceId,
        priority: incidentMeta?.priority ?? "high",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown external emergency notification error";
      console.error("[staffNotifications] External escalation failed", {
        notificationId,
        incidentId,
        message,
      });
    }

    return {
      kind: "ok" as const,
      incidentId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
