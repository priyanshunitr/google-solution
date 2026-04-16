import { z } from "zod";
import { incidentStatusSchema } from "./sharedEnumsSchema.js";

// Database row shape for the incident_status_history table.
export const incidentStatusHistorySchema = z.object({
  id: z.number().int().nonnegative(),
  incident_id: z.string().uuid(),
  from_status: incidentStatusSchema.nullable(),
  to_status: incidentStatusSchema,
  changed_by: z.string().uuid().nullable(),
  reason: z.string().nullable(),
  changed_at: z.string().datetime({ offset: true }),
});

// Payload expected when creating an incident history entry.
export const createIncidentStatusHistorySchema = z.object({
  incident_id: z.string().uuid(),
  from_status: incidentStatusSchema.optional(),
  to_status: incidentStatusSchema,
  changed_by: z.string().uuid().optional(),
  reason: z.string().optional(),
});

// Optional filters for listing incident history entries.
export const incidentStatusHistoryQuerySchema = z.object({
  incident_id: z.string().uuid().optional(),
  changed_by: z.string().uuid().optional(),
  to_status: incidentStatusSchema.optional(),
  changed_from: z.string().datetime({ offset: true }).optional(),
  changed_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type IncidentStatusHistory = z.infer<typeof incidentStatusHistorySchema>;
export type CreateIncidentStatusHistoryInput = z.infer<
  typeof createIncidentStatusHistorySchema
>;
export type IncidentStatusHistoryQuery = z.infer<
  typeof incidentStatusHistoryQuerySchema
>;
