import pool from "../lib/dbConnect.js";
import {
  BroadcastMsgQuery,
  CreateBroadcastMsgInput,
} from "../schemas/broadcastMsgSchema.js";
import {
  CreatePrivateMsgInput,
  PrivateMsgQuery,
} from "../schemas/privateMsgSchema.js";
import { emitToRoles, emitToUsers } from "../realtime/socketEmitter.js";
import { SOCKET_EVENTS } from "../realtime/socketEvents.js";

type AppRole = "guest" | "staff" | "responder" | "admin";

export async function listBroadcastMessages(query: BroadcastMsgQuery) {
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

  if (query.emergency_session_id) {
    add("emergency_session_id = ?", query.emergency_session_id);
  }

  if (query.sender_user_id) {
    add("sender_user_id = ?", query.sender_user_id);
  }

  if (query.sender_kind) {
    add("sender_kind = ?", query.sender_kind);
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
      FROM broadcast_messages
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  return result.rows;
}

export async function createBroadcastMessage(params: {
  actorUserId: string;
  actorRole: AppRole;
  payload: CreateBroadcastMsgInput;
  targetRoles: AppRole[];
}) {
  const result = await pool.query(
    `
      INSERT INTO broadcast_messages (
        emergency_session_id,
        sender_user_id,
        sender_kind,
        body
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      params.payload.emergency_session_id ?? null,
      params.actorUserId,
      params.payload.sender_kind,
      params.payload.body,
    ],
  );

  const message = result.rows[0];
  const targetRoles = Array.from(new Set(params.targetRoles)).filter(
    (role) => role !== "admin",
  );

  if (targetRoles.length > 0) {
    await pool.query(
      `
        INSERT INTO notification_deliveries (
          user_id,
          emergency_session_id,
          broadcast_message_id,
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
          'Emergency Broadcast',
          $3,
          jsonb_build_object('broadcast_message_id', $2, 'event_type', 'broadcast_created')
        FROM users u
        WHERE u.is_active = true
          AND u.role::text = ANY($4::text[])
      `,
      [message.emergency_session_id, message.id, message.body, targetRoles],
    );

    await pool.query(
      `
        INSERT INTO notification_deliveries (
          user_id,
          emergency_session_id,
          broadcast_message_id,
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
          'Emergency Broadcast',
          $3,
          jsonb_build_object('broadcast_message_id', $2, 'event_type', 'broadcast_created')
        FROM users u
        INNER JOIN device_push_tokens dpt
          ON dpt.user_id = u.id
         AND dpt.is_active = true
        WHERE u.is_active = true
          AND u.role::text = ANY($4::text[])
      `,
      [message.emergency_session_id, message.id, message.body, targetRoles],
    );

    await pool.query(
      `
        UPDATE notification_deliveries
        SET
          status = 'sent',
          sent_at = COALESCE(sent_at, now()),
          updated_at = now()
        WHERE channel = 'websocket'
          AND broadcast_message_id = $1
          AND status = 'queued'
      `,
      [message.id],
    );

    emitToRoles(targetRoles, SOCKET_EVENTS.NEW_BROADCAST, {
      message,
      target_roles: targetRoles,
    });
  }

  await pool.query(
    `
      INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
      VALUES ($1, 'broadcast_message_created', 'broadcast_message', $2, $3::jsonb)
    `,
    [
      params.actorUserId,
      message.id,
      JSON.stringify({ target_roles: targetRoles }),
    ],
  );

  return message;
}

export async function markBroadcastMessageRead(
  messageId: string,
  userId: string,
) {
  const result = await pool.query(
    `
      INSERT INTO broadcast_message_reads (message_id, user_id, seen_at)
      VALUES ($1, $2, now())
      ON CONFLICT (message_id, user_id)
      DO UPDATE SET seen_at = EXCLUDED.seen_at
      RETURNING *
    `,
    [messageId, userId],
  );

  return result.rows[0] ?? null;
}

export async function createPrivateMessage(params: {
  actorUserId: string;
  actorRole: AppRole;
  payload: Omit<CreatePrivateMsgInput, "sender_user_id">;
}) {
  const result = await pool.query(
    `
      INSERT INTO private_messages (
        emergency_session_id,
        sender_user_id,
        recipient_user_id,
        channel,
        body
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      params.payload.emergency_session_id ?? null,
      params.actorUserId,
      params.payload.recipient_user_id ?? null,
      params.payload.channel ?? null,
      params.payload.body,
    ],
  );

  const message = result.rows[0];
  let recipientIds: string[] = [];

  if (message.recipient_user_id) {
    recipientIds = [message.recipient_user_id];
  } else if (message.channel === "staff_responder") {
    const recipientsResult = await pool.query<{ id: string }>(
      `
        SELECT id
        FROM users
        WHERE is_active = true
          AND role IN ('staff', 'responder')
          AND id <> $1
      `,
      [params.actorUserId],
    );

    recipientIds = recipientsResult.rows.map((row) => row.id);
  }

  if (recipientIds.length > 0) {
    await pool.query(
      `
        INSERT INTO notification_deliveries (
          user_id,
          emergency_session_id,
          private_message_id,
          channel,
          status,
          title,
          body,
          data
        )
        SELECT
          user_id,
          $2,
          $3,
          'websocket',
          'queued',
          'Emergency Chat',
          $4,
          jsonb_build_object('private_message_id', $3, 'event_type', 'private_message_created')
        FROM unnest($1::uuid[]) AS recipients(user_id)
      `,
      [recipientIds, message.emergency_session_id, message.id, message.body],
    );

    await pool.query(
      `
        INSERT INTO notification_deliveries (
          user_id,
          emergency_session_id,
          private_message_id,
          channel,
          status,
          title,
          body,
          data
        )
        SELECT
          recipients.user_id,
          $2,
          $3,
          'fcm',
          'queued',
          'Emergency Chat',
          $4,
          jsonb_build_object('private_message_id', $3, 'event_type', 'private_message_created')
        FROM unnest($1::uuid[]) AS recipients(user_id)
        INNER JOIN device_push_tokens dpt
          ON dpt.user_id = recipients.user_id
         AND dpt.is_active = true
      `,
      [recipientIds, message.emergency_session_id, message.id, message.body],
    );

    await pool.query(
      `
        UPDATE notification_deliveries
        SET
          status = 'sent',
          sent_at = COALESCE(sent_at, now()),
          updated_at = now()
        WHERE channel = 'websocket'
          AND private_message_id = $1
          AND status = 'queued'
      `,
      [message.id],
    );

    emitToUsers(recipientIds, SOCKET_EVENTS.NEW_PRIVATE_MESSAGE, {
      message,
    });
  }

  await pool.query(
    `
      INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, meta)
      VALUES ($1, 'private_message_created', 'private_message', $2, $3::jsonb)
    `,
    [
      params.actorUserId,
      message.id,
      JSON.stringify({ recipient_count: recipientIds.length }),
    ],
  );

  return message;
}

export async function listPrivateMessages(params: {
  userId: string;
  userRole: AppRole;
  query: PrivateMsgQuery;
}) {
  const values: unknown[] = [params.userId, params.userRole];
  const clauses: string[] = [
    `(
      (recipient_user_id IS NOT NULL AND (sender_user_id = $1 OR recipient_user_id = $1))
      OR
      (channel = 'staff_responder' AND $2 IN ('staff', 'responder'))
    )`,
  ];

  const add = (clause: string, value?: unknown) => {
    if (value === undefined) {
      clauses.push(clause);
      return;
    }

    values.push(value);
    clauses.push(clause.replace("?", `$${values.length}`));
  };

  if (params.query.emergency_session_id) {
    add("emergency_session_id = ?", params.query.emergency_session_id);
  }

  if (params.query.sender_user_id) {
    add("sender_user_id = ?", params.query.sender_user_id);
  }

  if (params.query.recipient_user_id) {
    add("recipient_user_id = ?", params.query.recipient_user_id);
  }

  if (params.query.channel) {
    add("channel = ?", params.query.channel);
  }

  if (params.query.created_from) {
    add("created_at >= ?", params.query.created_from);
  }

  if (params.query.created_to) {
    add("created_at <= ?", params.query.created_to);
  }

  values.push(params.query.limit, params.query.offset);

  const result = await pool.query(
    `
      SELECT *
      FROM private_messages
      WHERE ${clauses.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  return result.rows;
}
