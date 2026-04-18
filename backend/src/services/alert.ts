import pool from "../lib/dbConnect.js";
import { CreateAlertInput } from "../schemas/alertsSchema.js";

export async function createAlert(
  userId: string,
  payload: Omit<CreateAlertInput, "created_by" | "is_broadcast">,
) {
  const {
    emergency_session_id,
    created_by,
    severity,
    title,
    description,
    location_text,
    is_broadcast,
  } = { ...payload, created_by: userId, is_broadcast: false };

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
          INSERT INTO alerts (
            emergency_session_id,
            created_by,
            severity,
            title,
            description,
            location_text,
            is_broadcast
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
      [
        emergency_session_id ?? null,
        created_by ?? null,
        severity,
        title,
        description,
        location_text ?? null,
        is_broadcast,
      ],
    );

    const alert = result.rows[0];

    const outboxPayload = {
      alert_id: alert.id,
      emergency_session_id: alert.emergency_session_id,
      created_by: alert.created_by,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      location_text: alert.location_text,
      is_broadcast: alert.is_broadcast,
      created_at: alert.created_at,
      source_type: "alert",
      source_id: alert.id,
      guest_message: alert.description,
    };

    await client.query(
      `
          INSERT INTO alert_outbox (
            alert_id,
            event_type,
            payload,
            status
          )
          VALUES ($1, 'alert_created', $2::jsonb, 'pending')
          ON CONFLICT (alert_id, event_type) DO NOTHING
        `,
      [alert.id, JSON.stringify(outboxPayload)],
    );

    await client.query("COMMIT");
    return alert;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getAlertById(alertId: string) {
  const result = await pool.query(
    `
        SELECT * FROM alerts WHERE id = $1
      `,
    [alertId],
  );
  return result.rows[0];
}

export async function myAlerts(userID: string) {
  const result = await pool.query(
    `SELECT * from alerts WHERE created_by = $1`,
    [userID],
  );
  return result.rows;
}
