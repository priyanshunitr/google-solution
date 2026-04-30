import pool from "../lib/dbConnect.js";

type FcmDeliveryRow = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  data: Record<string, unknown>;
};

const DEFAULT_POLL_MS = 5000;
const DEFAULT_BATCH_SIZE = 50;

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function claimQueuedFcmDeliveries(
  limit: number,
): Promise<FcmDeliveryRow[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<FcmDeliveryRow>(
      `
        WITH candidate_rows AS (
          SELECT id
          FROM notification_deliveries
          WHERE channel = 'fcm'
            AND status = 'queued'
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT $1
        )
        UPDATE notification_deliveries nd
        SET
          status = 'sent',
          sent_at = COALESCE(sent_at, now()),
          updated_at = now()
        FROM candidate_rows cr
        WHERE nd.id = cr.id
        RETURNING nd.id, nd.user_id, nd.title, nd.body, nd.data
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

async function getActiveTokensForUser(userId: string): Promise<string[]> {
  const result = await pool.query<{ push_token: string }>(
    `
      SELECT push_token
      FROM device_push_tokens
      WHERE user_id = $1
        AND is_active = true
    `,
    [userId],
  );

  return result.rows.map((row) => row.push_token);
}

async function markDeliveryDelivered(
  deliveryId: string,
  providerMessageId?: string,
) {
  await pool.query(
    `
      UPDATE notification_deliveries
      SET
        status = 'delivered',
        delivered_at = COALESCE(delivered_at, now()),
        provider_message_id = COALESCE($2, provider_message_id),
        updated_at = now()
      WHERE id = $1
    `,
    [deliveryId, providerMessageId ?? null],
  );
}

async function markDeliveryFailed(deliveryId: string, errorMessage: string) {
  await pool.query(
    `
      UPDATE notification_deliveries
      SET
        status = 'failed',
        error_message = $2,
        updated_at = now()
      WHERE id = $1
    `,
    [deliveryId, errorMessage.slice(0, 2000)],
  );
}

async function sendToFcm(
  token: string,
  title: string,
  body: string,
  data: Record<string, unknown>,
) {
  const serverKey = process.env.FCM_SERVER_KEY;

  if (!serverKey) {
    throw new Error("FCM_SERVER_KEY is not configured");
  }

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title,
        body,
      },
      data,
      priority: "high",
    }),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`FCM request failed with status ${response.status}`);
  }

  if (!json || (typeof json.success === "number" && json.success < 1)) {
    throw new Error("FCM response does not contain a successful delivery");
  }

  return String(json?.results?.[0]?.message_id ?? "");
}

async function processDeliveryRow(row: FcmDeliveryRow) {
  const tokens = await getActiveTokensForUser(row.user_id);

  if (tokens.length === 0) {
    await markDeliveryFailed(row.id, "No active push tokens found for user");
    return;
  }

  const title = row.title ?? "Emergency Update";

  let delivered = false;
  let providerMessageId = "";
  let lastError = "";

  for (const token of tokens) {
    try {
      providerMessageId = await sendToFcm(
        token,
        title,
        row.body,
        row.data ?? {},
      );
      delivered = true;
      break;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error.message : "Unknown FCM error";
    }
  }

  if (!delivered) {
    await markDeliveryFailed(
      row.id,
      lastError || "All FCM token attempts failed",
    );
    return;
  }

  await markDeliveryDelivered(row.id, providerMessageId);
}

export function startPushDeliveryWorker(): () => void {
  const pollMs = toNumber(process.env.PUSH_DELIVERY_POLL_MS, DEFAULT_POLL_MS);
  const batchSize = toNumber(
    process.env.PUSH_DELIVERY_BATCH_SIZE,
    DEFAULT_BATCH_SIZE,
  );

  let isRunning = false;

  const tick = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const rows = await claimQueuedFcmDeliveries(batchSize);

      for (const row of rows) {
        try {
          await processDeliveryRow(row);
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown push delivery error";
          await markDeliveryFailed(row.id, message);
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown push worker polling error";
      console.error("[pushDeliveryWorker] Polling error", message);
    } finally {
      isRunning = false;
    }
  };

  const intervalId = setInterval(() => {
    void tick();
  }, pollMs);

  void tick();
  console.log(
    `[pushDeliveryWorker] started with poll=${pollMs}ms batch=${batchSize}`,
  );

  return () => {
    clearInterval(intervalId);
    console.log("[pushDeliveryWorker] stopped");
  };
}
