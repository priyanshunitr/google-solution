import pool from "../lib/dbConnect.js";
import {
  DevicePushTokenQuery,
  RegisterDevicePushTokenInput,
  UpdateDevicePushTokenInput,
} from "../schemas/devicePushTokenSchema.js";

export async function registerDevicePushToken(
  actorUserId: string,
  payload: Omit<RegisterDevicePushTokenInput, "user_id">,
) {
  const result = await pool.query(
    `
      INSERT INTO device_push_tokens (
        user_id,
        platform,
        push_token,
        device_label,
        app_version,
        is_active,
        last_seen_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (push_token)
      DO UPDATE
      SET
        user_id = EXCLUDED.user_id,
        platform = EXCLUDED.platform,
        device_label = EXCLUDED.device_label,
        app_version = EXCLUDED.app_version,
        is_active = EXCLUDED.is_active,
        last_seen_at = EXCLUDED.last_seen_at,
        updated_at = now()
      RETURNING *
    `,
    [
      actorUserId,
      payload.platform,
      payload.push_token,
      payload.device_label ?? null,
      payload.app_version ?? null,
      payload.is_active,
      payload.last_seen_at ?? new Date().toISOString(),
    ],
  );

  return result.rows[0];
}

export async function listDevicePushTokens(query: DevicePushTokenQuery) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (query.user_id) {
    values.push(query.user_id);
    clauses.push(`user_id = $${values.length}`);
  }

  if (query.platform) {
    values.push(query.platform);
    clauses.push(`platform = $${values.length}`);
  }

  if (query.is_active !== undefined) {
    values.push(query.is_active);
    clauses.push(`is_active = $${values.length}`);
  }

  values.push(query.limit, query.offset);
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT *
      FROM device_push_tokens
      ${where}
      ORDER BY updated_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  return result.rows;
}

export async function updateDevicePushToken(
  tokenId: string,
  userId: string,
  isAdmin: boolean,
  payload: UpdateDevicePushTokenInput,
) {
  const setParts: string[] = [];
  const values: unknown[] = [];

  const append = (column: string, value: unknown) => {
    values.push(value);
    setParts.push(`${column} = $${values.length}`);
  };

  if (payload.device_label !== undefined) {
    append("device_label", payload.device_label);
  }

  if (payload.app_version !== undefined) {
    append("app_version", payload.app_version);
  }

  if (payload.is_active !== undefined) {
    append("is_active", payload.is_active);
  }

  if (payload.last_seen_at !== undefined) {
    append("last_seen_at", payload.last_seen_at);
  }

  append("updated_at", new Date().toISOString());

  values.push(tokenId);

  const ownershipClause = isAdmin ? "" : `AND user_id = $${values.length + 1}`;
  if (!isAdmin) {
    values.push(userId);
  }

  const result = await pool.query(
    `
      UPDATE device_push_tokens
      SET ${setParts.join(", ")}
      WHERE id = $${values.length - (isAdmin ? 0 : 1)}
      ${ownershipClause}
      RETURNING *
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deactivateDevicePushToken(
  tokenId: string,
  userId: string,
  isAdmin: boolean,
) {
  const result = await pool.query(
    `
      UPDATE device_push_tokens
      SET
        is_active = false,
        updated_at = now()
      WHERE id = $1
        AND ($2::boolean = true OR user_id = $3)
      RETURNING *
    `,
    [tokenId, isAdmin, userId],
  );

  return result.rows[0] ?? null;
}
