import pool from "../lib/dbConnect.js";
import {
  CreateEmergencySessionInput,
  EmergencySessionQuery,
  UpdateEmergencySessionInput,
} from "../schemas/emergencySessionsSchema.js";

export async function createEmergencySession(
  actorUserId: string,
  payload: CreateEmergencySessionInput,
) {
  const isActivating = payload.status === "active";

  const result = await pool.query(
    `
      INSERT INTO emergency_sessions (
        status,
        severity,
        title,
        message,
        instructions,
        activated_by,
        activated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      payload.status,
      payload.severity,
      payload.title,
      payload.message,
      payload.instructions ?? null,
      isActivating ? actorUserId : null,
      isActivating ? new Date().toISOString() : null,
    ],
  );

  await pool.query(
    `
      INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
      VALUES ($1, 'emergency_session_created', 'emergency_session', $2, $3::jsonb)
    `,
    [
      actorUserId,
      result.rows[0].id,
      JSON.stringify({
        status: result.rows[0].status,
        severity: result.rows[0].severity,
      }),
    ],
  );

  return result.rows[0];
}

export async function listEmergencySessions(query: EmergencySessionQuery) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (query.status) {
    values.push(query.status);
    clauses.push(`status = $${values.length}`);
  }

  if (query.severity) {
    values.push(query.severity);
    clauses.push(`severity = $${values.length}`);
  }

  if (query.activated_by) {
    values.push(query.activated_by);
    clauses.push(`activated_by = $${values.length}`);
  }

  if (query.resolved_by) {
    values.push(query.resolved_by);
    clauses.push(`resolved_by = $${values.length}`);
  }

  if (query.created_from) {
    values.push(query.created_from);
    clauses.push(`created_at >= $${values.length}`);
  }

  if (query.created_to) {
    values.push(query.created_to);
    clauses.push(`created_at <= $${values.length}`);
  }

  values.push(query.limit, query.offset);

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT *
      FROM emergency_sessions
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  return result.rows;
}

export async function getEmergencySessionById(sessionId: string) {
  const result = await pool.query(
    `
      SELECT *
      FROM emergency_sessions
      WHERE id = $1
      LIMIT 1
    `,
    [sessionId],
  );

  return result.rows[0] ?? null;
}

export async function updateEmergencySession(
  sessionId: string,
  payload: UpdateEmergencySessionInput,
  actorUserId: string,
) {
  const setParts: string[] = [];
  const values: unknown[] = [];

  const append = (column: string, value: unknown) => {
    values.push(value);
    setParts.push(`${column} = $${values.length}`);
  };

  if (payload.status !== undefined) {
    append("status", payload.status);
  }

  if (payload.severity !== undefined) {
    append("severity", payload.severity);
  }

  if (payload.title !== undefined) {
    append("title", payload.title);
  }

  if (payload.message !== undefined) {
    append("message", payload.message);
  }

  if (payload.instructions !== undefined) {
    append("instructions", payload.instructions);
  }

  if (payload.activated_by !== undefined) {
    append("activated_by", payload.activated_by);
  }

  if (payload.activated_at !== undefined) {
    append("activated_at", payload.activated_at);
  }

  if (payload.resolved_by !== undefined) {
    append("resolved_by", payload.resolved_by);
  }

  if (payload.resolved_at !== undefined) {
    append("resolved_at", payload.resolved_at);
  }

  append("updated_at", new Date().toISOString());

  values.push(sessionId);

  const result = await pool.query(
    `
      UPDATE emergency_sessions
      SET ${setParts.join(", ")}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values,
  );

  const updated = result.rows[0] ?? null;

  if (updated) {
    await pool.query(
      `
        INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
        VALUES ($1, 'emergency_session_updated', 'emergency_session', $2, $3::jsonb)
      `,
      [actorUserId, updated.id, JSON.stringify(payload)],
    );
  }

  return updated;
}

export async function activateEmergencySession(
  sessionId: string,
  actorUserId: string,
) {
  const result = await pool.query(
    `
      UPDATE emergency_sessions
      SET
        status = 'active',
        activated_by = COALESCE(activated_by, $2),
        activated_at = COALESCE(activated_at, now()),
        updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [sessionId, actorUserId],
  );

  const session = result.rows[0] ?? null;

  if (session) {
    await pool.query(
      `
        INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
        VALUES ($1, 'emergency_session_activated', 'emergency_session', $2, '{}'::jsonb)
      `,
      [actorUserId, session.id],
    );
  }

  return session;
}

export async function resolveEmergencySession(
  sessionId: string,
  actorUserId: string,
) {
  const result = await pool.query(
    `
      UPDATE emergency_sessions
      SET
        status = 'resolved',
        resolved_by = $2,
        resolved_at = now(),
        updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [sessionId, actorUserId],
  );

  const session = result.rows[0] ?? null;

  if (session) {
    await pool.query(
      `
        INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
        VALUES ($1, 'emergency_session_resolved', 'emergency_session', $2, '{}'::jsonb)
      `,
      [actorUserId, session.id],
    );
  }

  return session;
}
