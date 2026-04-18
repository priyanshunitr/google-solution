import pool from "../lib/dbConnect.js";
import { CreateSosRequestInput } from "../schemas/sosRequestSchema.js";

export async function createSosRequest(
  userID: string,
  payload: Omit<CreateSosRequestInput, "guest_user_id">,
) {
  const {
    emergency_session_id,
    guest_user_id,
    message,
    latitude,
    longitude,
    location_accuracy_m,
    location_captured_at,
  } = { ...payload, guest_user_id: userID };

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
                INSERT INTO sos_requests (
                    emergency_session_id,
                    guest_user_id,
                    message,
                    latitude,
                    longitude,
                    location_accuracy_m,
                    location_captured_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `,
      [
        emergency_session_id ?? null,
        guest_user_id,
        message ?? null,
        latitude ?? null,
        longitude ?? null,
        location_accuracy_m ?? null,
        location_captured_at ?? null,
      ],
    );

    const sos = result.rows[0];

    const locationText =
      latitude !== undefined && longitude !== undefined
        ? `${latitude},${longitude}`
        : null;

    const alertResult = await client.query(
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
            VALUES ($1, $2, 'critical', $3, $4, $5, false)
            RETURNING *
          `,
      [
        emergency_session_id ?? null,
        guest_user_id,
        "SOS Request",
        message ?? "Guest raised SOS request",
        locationText,
      ],
    );

    const alert = alertResult.rows[0];

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
      source_type: "sos",
      source_id: sos.id,
      guest_message: sos.message ?? alert.description,
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
    return sos;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getSosById(sosId: string) {
  const result = await pool.query(
    `
        SELECT * FROM sos_requests WHERE id = $1
      `,
    [sosId],
  );
  return result.rows[0];
}

export async function mySosRequests(userID: string) {
  const result = await pool.query(
    `SELECT * from sos_requests WHERE guest_user_id = $1`,
    [userID],
  );
  return result.rows;
}
