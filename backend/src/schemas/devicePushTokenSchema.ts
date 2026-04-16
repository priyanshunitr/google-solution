import { z } from "zod";
import { pushPlatformSchema } from "./sharedEnumsSchema.js";

// Database row shape for the device_push_tokens table.
export const devicePushTokenSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  platform: pushPlatformSchema,
  push_token: z.string().min(1),
  device_label: z.string().max(120).nullable(),
  app_version: z.string().max(40).nullable(),
  is_active: z.boolean(),
  last_seen_at: z.string().datetime({ offset: true }).nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// Payload expected when registering a new push token.
export const registerDevicePushTokenSchema = z.object({
  user_id: z.string().uuid(),
  platform: pushPlatformSchema,
  push_token: z.string().min(1),
  device_label: z.string().max(120).optional(),
  app_version: z.string().max(40).optional(),
  is_active: z.boolean().optional().default(true),
  last_seen_at: z.string().datetime({ offset: true }).optional(),
});

// Allowed patch fields for token updates (active state, app metadata).
export const updateDevicePushTokenSchema = z
  .object({
    device_label: z.string().max(120).nullable().optional(),
    app_version: z.string().max(40).nullable().optional(),
    is_active: z.boolean().optional(),
    last_seen_at: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

// Optional filters for listing push tokens.
export const devicePushTokenQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  platform: pushPlatformSchema.optional(),
  is_active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type DevicePushToken = z.infer<typeof devicePushTokenSchema>;
export type RegisterDevicePushTokenInput = z.infer<
  typeof registerDevicePushTokenSchema
>;
export type UpdateDevicePushTokenInput = z.infer<
  typeof updateDevicePushTokenSchema
>;
export type DevicePushTokenQuery = z.infer<typeof devicePushTokenQuerySchema>;
