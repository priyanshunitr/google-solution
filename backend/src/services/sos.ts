import pool from "../lib/dbConnect.js";
import { CreateSosRequestInput } from "../schemas/sosRequestSchema.js";

export async function createSosRequest(userID:string, payload: Omit<CreateSosRequestInput, "guest_user_id">) {

    const {
        emergency_session_id,
        guest_user_id,
        message,
        latitude,
        longitude,
        location_accuracy_m,
        location_captured_at,
    } = {...payload, guest_user_id: userID };

    const result = await pool.query(
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

    return result.rows[0];
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

export async function mySosRequests(userID: string){
  const result = await pool.query(
    `SELECT * from sos_requests WHERE guest_user_id = $1`,
    [userID]
  )
  return result.rows;
}