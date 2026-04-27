import pool from "../lib/dbConnect.js";
import { IncidentQuery } from "../schemas/incidentSchema.js";
import { IncidentStatus } from "../schemas/sharedEnumsSchema.js";

type IncidentRole = "staff" | "responder" | "admin";

type ListUserNotificationsParams = {
  limit: number;
  offset: number;
  unseenOnly: boolean;
};

export async function getIncidentById(incidentId: string) {
  const result = await pool.query(
    `
      SELECT *
      FROM incidents
      WHERE id = $1
      LIMIT 1
    `,
    [incidentId],
  );

  return result.rows[0] ?? null;
}

export async function listIncidents(
  query: IncidentQuery,
  role: IncidentRole,
  userId: string,
) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  const add = (clause: string, value?: unknown) => {
    if (value === undefined) {
      clauses.push(clause);
      return;
    }

    values.push(value);
    clauses.push(clause.replace("?", `$${values.length}`));
  };

  if (role === "responder") {
    values.push(userId);
    clauses.push(
      `(assigned_responder_user_id = $${values.length} OR status = 'escalated')`,
    );
  } else if (role === "staff") {
    values.push(userId);
    clauses.push(
      `(assigned_staff_user_id = $${values.length} OR status = 'active')`,
    );
  }

  if (query.emergency_session_id) {
    add("emergency_session_id = ?", query.emergency_session_id);
  }

  if (query.incident_type) {
    add("incident_type = ?", query.incident_type);
  }

  if (query.status) {
    add("status = ?", query.status);
  }

  if (query.priority) {
    add("priority = ?", query.priority);
  }

  if (query.assigned_staff_user_id) {
    add("assigned_staff_user_id = ?", query.assigned_staff_user_id);
  }

  if (query.assigned_responder_user_id) {
    add("assigned_responder_user_id = ?", query.assigned_responder_user_id);
  }

  if (query.created_from) {
    add("created_at >= ?", query.created_from);
  }

  if (query.created_to) {
    add("created_at <= ?", query.created_to);
  }

  values.push(query.limit, query.offset);

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT *
      FROM incidents
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  return result.rows;
}

export async function updateIncidentStatus(params: {
  incidentId: string;
  actorUserId: string;
  actorRole: IncidentRole;
  toStatus: IncidentStatus;
  reason?: string;
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query<{
      id: string;
      status: IncidentStatus;
    }>(
      `
        SELECT id, status
        FROM incidents
        WHERE id = $1
        FOR UPDATE
      `,
      [params.incidentId],
    );

    const currentIncident = currentResult.rows[0];

    if (!currentIncident) {
      await client.query("ROLLBACK");
      return null;
    }

    const fromStatus = currentIncident.status;

    const updateResult = await client.query(
      `
        UPDATE incidents
        SET
          status = $2,
          acknowledged_at = CASE WHEN $2 = 'acknowledged' THEN COALESCE(acknowledged_at, now()) ELSE acknowledged_at END,
          responding_at = CASE WHEN $2 = 'responding' THEN COALESCE(responding_at, now()) ELSE responding_at END,
          escalated_at = CASE WHEN $2 = 'escalated' THEN COALESCE(escalated_at, now()) ELSE escalated_at END,
          resolved_at = CASE WHEN $2 = 'resolved' THEN COALESCE(resolved_at, now()) ELSE resolved_at END,
          assigned_staff_user_id = CASE
            WHEN $3 = 'staff' AND assigned_staff_user_id IS NULL THEN $4
            ELSE assigned_staff_user_id
          END,
          assigned_responder_user_id = CASE
            WHEN $3 = 'responder' AND assigned_responder_user_id IS NULL THEN $4
            ELSE assigned_responder_user_id
          END,
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [
        params.incidentId,
        params.toStatus,
        params.actorRole,
        params.actorUserId,
      ],
    );

    const incident = updateResult.rows[0];

    await client.query(
      `
        INSERT INTO incident_status_history (
          incident_id,
          from_status,
          to_status,
          changed_by,
          reason
        )
        VALUES ($1, $2::incident_status, $3::incident_status, $4, $5)
      `,
      [
        params.incidentId,
        fromStatus,
        params.toStatus,
        params.actorUserId,
        params.reason ?? null,
      ],
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
          'incident_status_updated',
          'incident',
          $2,
          $3::jsonb
        )
      `,
      [
        params.actorUserId,
        params.incidentId,
        JSON.stringify({
          from_status: fromStatus,
          to_status: params.toStatus,
          reason: params.reason ?? null,
        }),
      ],
    );

    await client.query("COMMIT");
    return incident;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listUserNotifications(
  userId: string,
  params: ListUserNotificationsParams,
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

export async function markUserNotificationSeen(
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
