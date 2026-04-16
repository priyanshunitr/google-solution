import { z } from "zod";
import { severityLevelSchema } from "./sharedEnumsSchema.js";

// Database row shape for the alerts table.
export const alertSchema = z.object({
  id: z.string().uuid(),
  emergency_session_id: z.string().uuid().nullable(),
  created_by: z.string().uuid().nullable(),
  severity: severityLevelSchema,
  title: z.string().min(1).max(180),
  description: z.string().min(1),
  location_text: z.string().max(240).nullable(),
  is_broadcast: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
});

// Payload expected when creating a new alert.
export const createAlertSchema = z.object({
  emergency_session_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  severity: severityLevelSchema,
  title: z.string().min(1).max(180),
  description: z.string().min(1),
  location_text: z.string().max(240).optional(),
  is_broadcast: z.boolean().optional().default(false),
});

// Allowed patch fields for alert updates.
export const updateAlertSchema = z
  .object({
    severity: severityLevelSchema.optional(),
    title: z.string().min(1).max(180).optional(),
    description: z.string().min(1).optional(),
    location_text: z.string().max(240).nullable().optional(),
    is_broadcast: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

export type Alert = z.infer<typeof alertSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
