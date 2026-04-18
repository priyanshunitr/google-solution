import pool from "../lib/dbConnect.js";
import { emitStaffNotification } from "../realtime/socketServer.js";

type AlertOutboxRow = {
  id: string;
  alert_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "processed" | "failed";
  attempts: number;
};

type IncidentLookup = {
  id: string;
  emergency_session_id: string | null;
};

const DEFAULT_POLL_MS = 5000;
const DEFAULT_BATCH_SIZE = 25;
//________________________________________________________________________________________________________

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

//________________________________________________________________________________________________________

function getRetryDelayMs(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  const delayMinutes = Math.min(60, 2 ** exponent);
  return delayMinutes * 60 * 1000;
}
//________________________________________________________________________________________________________

async function claimOutboxBatch(limit: number): Promise<AlertOutboxRow[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<AlertOutboxRow>(
      `
				WITH candidate_rows AS (
					SELECT id
					FROM alert_outbox
					WHERE status = 'pending'
						 OR (status = 'failed' AND next_retry_at IS NOT NULL AND next_retry_at <= now())
					ORDER BY created_at ASC
					FOR UPDATE SKIP LOCKED
					LIMIT $1
				)
				UPDATE alert_outbox ao
				SET status = 'processing',
						updated_at = now()
				FROM candidate_rows cr
				WHERE ao.id = cr.id
				RETURNING ao.id, ao.alert_id, ao.event_type, ao.payload, ao.status, ao.attempts
			`,
      [limit],
    );

    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

//________________________________________________________________________________________________________

async function findIncidentByAlertId(alertId: string): Promise<IncidentLookup | null> {
  const result = await pool.query<IncidentLookup>(
    `
			SELECT id, emergency_session_id
			FROM incidents
			WHERE alert_id = $1
			LIMIT 1
		`,
    [alertId],
  );

  return result.rows[0] ?? null;
}
//________________________________________________________________________________________________________

async function enqueueWebsocketDeliveries(params: {
  outboxId: string;
  alertId: string;
  incidentId: string | null;
  emergencySessionId: string | null;
  title: string;
  body: string;
}): Promise<number> {
  const result = await pool.query<{ inserted_count: string }>(
    `
			WITH staff_users AS (
				SELECT id
				FROM users
				WHERE role = 'staff' AND is_active = true
			), inserted AS (
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
					su.id,
					$1,
					$2,
					'websocket',
					'queued',
					$3,
					$4,
					jsonb_build_object(
						'alert_id', $5,
						'outbox_id', $6,
						'event_type', 'alert_created'
					)
				FROM staff_users su
				WHERE NOT EXISTS (
					SELECT 1
					FROM notification_deliveries nd
					WHERE nd.user_id = su.id
						AND nd.channel = 'websocket'
						AND nd.data ->> 'outbox_id' = $6
				)
				RETURNING 1
			)
			SELECT COUNT(*)::text AS inserted_count
			FROM inserted
		`,
    [
      params.emergencySessionId,
      params.incidentId,
      params.title,
      params.body,
      params.alertId,
      params.outboxId,
    ],
  );

  return Number(result.rows[0]?.inserted_count ?? 0);
}
//________________________________________________________________________________________________________

async function enqueueFcmDeliveries(params: {
  outboxId: string;
  alertId: string;
  incidentId: string | null;
  emergencySessionId: string | null;
  title: string;
  body: string;
}): Promise<number> {
  const result = await pool.query<{ inserted_count: string }>(
    `
			WITH staff_with_active_tokens AS (
				SELECT DISTINCT u.id
				FROM users u
				INNER JOIN device_push_tokens dpt
					ON dpt.user_id = u.id
				 AND dpt.is_active = true
				WHERE u.role = 'staff'
					AND u.is_active = true
			), inserted AS (
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
					sut.id,
					$1,
					$2,
					'fcm',
					'queued',
					$3,
					$4,
					jsonb_build_object(
						'alert_id', $5,
						'outbox_id', $6,
						'event_type', 'alert_created'
					)
				FROM staff_with_active_tokens sut
				WHERE NOT EXISTS (
					SELECT 1
					FROM notification_deliveries nd
					WHERE nd.user_id = sut.id
						AND nd.channel = 'fcm'
						AND nd.data ->> 'outbox_id' = $6
				)
				RETURNING 1
			)
			SELECT COUNT(*)::text AS inserted_count
			FROM inserted
		`,
    [
      params.emergencySessionId,
      params.incidentId,
      params.title,
      params.body,
      params.alertId,
      params.outboxId,
    ],
  );

  return Number(result.rows[0]?.inserted_count ?? 0);
}

//________________________________________________________________________________________________________

async function emitQueuedWebsocketDeliveries(params: {
  outboxId: string;
  title: string;
  body: string;
  alertId: string;
  sourceType: "alert" | "sos";
  sourceId: string;
  guestMessage: string;
}): Promise<void> {
  const queuedResult = await pool.query<{
    id: string;
    data: Record<string, unknown>;
    created_at: string;
  }>(
    `
      SELECT id, data, created_at
      FROM notification_deliveries
      WHERE channel = 'websocket'
        AND status = 'queued'
        AND data ->> 'outbox_id' = $1
      ORDER BY created_at ASC
    `,
    [params.outboxId],
  );

  if (queuedResult.rows.length === 0) {
    return;
  }

  const firstRow = queuedResult.rows[0];

  emitStaffNotification({
    notificationId: firstRow.id,
    title: params.title,
    body: params.body,
    channel: "websocket",
    createdAt: firstRow.created_at,
    data: {
      ...(firstRow.data ?? {}),
      alert_id: params.alertId,
      outbox_id: params.outboxId,
      event_type: "alert_created",
      source_type: params.sourceType,
      source_id: params.sourceId,
      guest_message: params.guestMessage,
    },
  });

  await pool.query(
    `
      UPDATE notification_deliveries
      SET status = 'sent',
          sent_at = COALESCE(sent_at, now()),
          updated_at = now()
      WHERE channel = 'websocket'
        AND status = 'queued'
        AND data ->> 'outbox_id' = $1
    `,
    [params.outboxId],
  );
}
//________________________________________________________________________________________________________

async function markProcessed(outboxId: string): Promise<void> {
  await pool.query(
    `
			UPDATE alert_outbox
			SET status = 'processed',
					processed_at = now(),
					next_retry_at = NULL,
					last_error = NULL,
					updated_at = now()
			WHERE id = $1
		`,
    [outboxId],
  );
}

//________________________________________________________________________________________________________

async function markFailed(
  outboxId: string,
  attempts: number,
  errorMessage: string,
): Promise<void> {
  const nextRetryAt = new Date(Date.now() + getRetryDelayMs(attempts));

  await pool.query(
    `
			UPDATE alert_outbox
			SET status = 'failed',
					attempts = $2,
					last_error = $3,
					next_retry_at = $4,
					updated_at = now()
			WHERE id = $1
		`,
    [
      outboxId,
      attempts,
      errorMessage.slice(0, 2000),
      nextRetryAt.toISOString(),
    ],
  );
}
//________________________________________________________________________________________________________

async function processOutboxRow(row: AlertOutboxRow): Promise<void> {
  const payload = row.payload ?? {};
  const title = String(payload.title ?? "New alert");
  const body = String(
    payload.description ?? "A new alert requires staff attention.",
  );
  const payloadSourceType = payload.source_type;
  const sourceType: "alert" | "sos" =
    payloadSourceType === "sos" ? "sos" : "alert";
  const payloadSourceId = payload.source_id;
  const sourceId =
    typeof payloadSourceId === "string" && payloadSourceId.length > 0
      ? payloadSourceId
      : row.alert_id;
  const payloadGuestMessage = payload.guest_message;
  const guestMessage =
    typeof payloadGuestMessage === "string" && payloadGuestMessage.length > 0
      ? payloadGuestMessage
      : body;

  const incident = await findIncidentByAlertId(row.alert_id);
  const incidentId = incident?.id ?? null;
  const emergencySessionId =
    (typeof payload.emergency_session_id === "string" &&
      payload.emergency_session_id) ||
    incident?.emergency_session_id ||
    null;

  if (!incidentId && !emergencySessionId) {
    throw new Error(
      "Cannot create notification delivery: both incident_id and emergency_session_id are missing.",
    );
  }

  await enqueueWebsocketDeliveries({
    outboxId: row.id,
    alertId: row.alert_id,
    incidentId,
    emergencySessionId,
    title,
    body,
  });

  await enqueueFcmDeliveries({
    outboxId: row.id,
    alertId: row.alert_id,
    incidentId,
    emergencySessionId,
    title,
    body,
  });

  await emitQueuedWebsocketDeliveries({
    outboxId: row.id,
    title,
    body,
    alertId: row.alert_id,
    sourceType,
    sourceId,
    guestMessage,
  });

  await markProcessed(row.id);
}

//________________________________________________________________________________________________________

export function startAlertOutboxWorker(): () => void {
  const pollMs = toNumber(process.env.ALERT_OUTBOX_POLL_MS, DEFAULT_POLL_MS);
  const batchSize = toNumber(
    process.env.ALERT_OUTBOX_BATCH_SIZE,
    DEFAULT_BATCH_SIZE,
  );

  let isRunning = false;

  const tick = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const rows = await claimOutboxBatch(batchSize);

      for (const row of rows) {
        try {
          await processOutboxRow(row);
        } catch (error: unknown) {
          const attempts = row.attempts + 1;
          const message =
            error instanceof Error
              ? error.message
              : "Unknown outbox processing error";
          await markFailed(row.id, attempts, message);
          console.error("[alertOutboxWorker] Failed row", {
            outboxId: row.id,
            alertId: row.alert_id,
            attempts,
            message,
          });
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[alertOutboxWorker] Polling error", message);
    } finally {
      isRunning = false;
    }
  };

  const intervalId = setInterval(() => {
    void tick();
  }, pollMs);

  void tick();
  console.log(
    `[alertOutboxWorker] started with poll=${pollMs}ms batch=${batchSize}`,
  );

  return () => {
    clearInterval(intervalId);
    console.log("[alertOutboxWorker] stopped");
  };
}
