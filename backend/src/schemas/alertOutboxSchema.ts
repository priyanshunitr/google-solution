import { z } from "zod";

// Processing states used by the alert outbox worker.
export const alertOutboxStatusSchema = z.enum([
  "pending",
  "processing",
  "processed",
  "failed",
]);

// Event type for alert outbox records (reserved for future expansion).
export const alertOutboxEventTypeSchema = z.string().min(1).max(80);

// Flexible payload stored with each outbox event.
export const alertOutboxPayloadSchema = z.record(z.string(), z.unknown());

// Database row shape for the alert_outbox table.
export const alertOutboxSchema = z.object({
  id: z.string().uuid(),
  alert_id: z.string().uuid(),
  event_type: alertOutboxEventTypeSchema,
  payload: alertOutboxPayloadSchema,
  status: alertOutboxStatusSchema,
  attempts: z.number().int().min(0),
  last_error: z.string().nullable(),
  next_retry_at: z.string().datetime({ offset: true }).nullable(),
  processed_at: z.string().datetime({ offset: true }).nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// Payload expected when creating an outbox event record.
export const createAlertOutboxSchema = z.object({
  alert_id: z.string().uuid(),
  event_type: alertOutboxEventTypeSchema.optional().default("alert_created"),
  payload: alertOutboxPayloadSchema.optional().default({}),
  status: alertOutboxStatusSchema.optional().default("pending"),
  attempts: z.number().int().min(0).optional().default(0),
  last_error: z.string().optional(),
  next_retry_at: z.string().datetime({ offset: true }).optional(),
  processed_at: z.string().datetime({ offset: true }).optional(),
});

// Allowed patch fields for worker progress and retry updates.
export const updateAlertOutboxSchema = z
  .object({
    status: alertOutboxStatusSchema.optional(),
    attempts: z.number().int().min(0).optional(),
    last_error: z.string().nullable().optional(),
    next_retry_at: z.string().datetime({ offset: true }).nullable().optional(),
    processed_at: z.string().datetime({ offset: true }).nullable().optional(),
    payload: alertOutboxPayloadSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

// Optional filters for listing outbox records.
export const alertOutboxQuerySchema = z.object({
  alert_id: z.string().uuid().optional(),
  event_type: alertOutboxEventTypeSchema.optional(),
  status: alertOutboxStatusSchema.optional(),
  next_retry_before: z.string().datetime({ offset: true }).optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type AlertOutbox = z.infer<typeof alertOutboxSchema>;
export type AlertOutboxStatus = z.infer<typeof alertOutboxStatusSchema>;
export type CreateAlertOutboxInput = z.infer<typeof createAlertOutboxSchema>;
export type UpdateAlertOutboxInput = z.infer<typeof updateAlertOutboxSchema>;
export type AlertOutboxQuery = z.infer<typeof alertOutboxQuerySchema>;
