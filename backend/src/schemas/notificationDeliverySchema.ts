import { z } from "zod";
import {
  notificationChannelSchema,
  notificationStatusSchema,
} from "./sharedEnumsSchema.js";

// Flexible payload stored with each notification delivery attempt.
export const notificationDataSchema = z.record(z.string(), z.unknown());

// Database row shape for the notification_deliveries table.
export const notificationDeliverySchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    emergency_session_id: z.string().uuid().nullable(),
    incident_id: z.string().uuid().nullable(),
    broadcast_message_id: z.string().uuid().nullable(),
    private_message_id: z.string().uuid().nullable(),
    channel: notificationChannelSchema,
    status: notificationStatusSchema,
    title: z.string().max(180).nullable(),
    body: z.string().min(1),
    data: notificationDataSchema,
    provider_message_id: z.string().max(255).nullable(),
    error_message: z.string().nullable(),
    queued_at: z.string().datetime({ offset: true }),
    sent_at: z.string().datetime({ offset: true }).nullable(),
    delivered_at: z.string().datetime({ offset: true }).nullable(),
    seen_at: z.string().datetime({ offset: true }).nullable(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (value) =>
      value.incident_id !== null ||
      value.broadcast_message_id !== null ||
      value.private_message_id !== null ||
      value.emergency_session_id !== null,
    {
      message: "At least one related entity reference is required",
      path: ["incident_id"],
    },
  );

// Payload expected when creating a notification delivery record.
export const createNotificationDeliverySchema = z
  .object({
    user_id: z.string().uuid(),
    emergency_session_id: z.string().uuid().optional(),
    incident_id: z.string().uuid().optional(),
    broadcast_message_id: z.string().uuid().optional(),
    private_message_id: z.string().uuid().optional(),
    channel: notificationChannelSchema,
    status: notificationStatusSchema.optional().default("queued"),
    title: z.string().max(180).optional(),
    body: z.string().min(1),
    data: notificationDataSchema.optional().default({}),
    provider_message_id: z.string().max(255).optional(),
    error_message: z.string().optional(),
    queued_at: z.string().datetime({ offset: true }).optional(),
    sent_at: z.string().datetime({ offset: true }).optional(),
    delivered_at: z.string().datetime({ offset: true }).optional(),
    seen_at: z.string().datetime({ offset: true }).optional(),
  })
  .refine(
    (value) =>
      !!value.incident_id ||
      !!value.broadcast_message_id ||
      !!value.private_message_id ||
      !!value.emergency_session_id,
    {
      message: "At least one related entity reference is required",
      path: ["incident_id"],
    },
  );

// Allowed patch fields for delivery-status updates.
export const updateNotificationDeliverySchema = z
  .object({
    status: notificationStatusSchema.optional(),
    provider_message_id: z.string().max(255).nullable().optional(),
    error_message: z.string().nullable().optional(),
    sent_at: z.string().datetime({ offset: true }).nullable().optional(),
    delivered_at: z.string().datetime({ offset: true }).nullable().optional(),
    seen_at: z.string().datetime({ offset: true }).nullable().optional(),
    data: notificationDataSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

// Optional filters for listing notification deliveries.
export const notificationDeliveryQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  channel: notificationChannelSchema.optional(),
  status: notificationStatusSchema.optional(),
  incident_id: z.string().uuid().optional(),
  broadcast_message_id: z.string().uuid().optional(),
  private_message_id: z.string().uuid().optional(),
  queued_from: z.string().datetime({ offset: true }).optional(),
  queued_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type NotificationDelivery = z.infer<typeof notificationDeliverySchema>;
export type CreateNotificationDeliveryInput = z.infer<
  typeof createNotificationDeliverySchema
>;
export type UpdateNotificationDeliveryInput = z.infer<
  typeof updateNotificationDeliverySchema
>;
export type NotificationDeliveryQuery = z.infer<
  typeof notificationDeliveryQuerySchema
>;
