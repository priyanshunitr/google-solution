import pool from "../lib/dbConnect.js";
import {CreateAlertInput} from "../schemas/alertsSchema.js";

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
  } = {...payload,
    created_by: userId,
    is_broadcast: false}

  const result = await pool.query(
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

  return result.rows[0];
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

export async function myAlerts(userID: string){
  const result = await pool.query(
    `SELECT * from alerts WHERE created_by = $1`,
    [userID]
  )
  return result.rows;
}