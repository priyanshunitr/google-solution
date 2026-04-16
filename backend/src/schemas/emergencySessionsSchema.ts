import { z } from "zod";
import {
  emergencyStatusSchema,
  severityLevelSchema,
} from "./sharedEnumsSchema.js";

// Database row shape for the emergency_sessions table.
export const emergencySessionSchema = z.object({
  id: z.string().uuid(),
  status: emergencyStatusSchema,
  severity: severityLevelSchema,
  title: z.string().min(1).max(180),
  message: z.string().min(1),
  instructions: z.string().nullable(),
  activated_by: z.string().uuid().nullable(),
  activated_at: z.string().datetime({ offset: true }).nullable(),
  resolved_by: z.string().uuid().nullable(),
  resolved_at: z.string().datetime({ offset: true }).nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// Payload expected when creating a new emergency session.
export const createEmergencySessionSchema = z.object({
  status: emergencyStatusSchema.optional().default("draft"),
  severity: severityLevelSchema,
  title: z.string().min(1).max(180),
  message: z.string().min(1),
  instructions: z.string().optional(),
  activated_by: z.string().uuid().optional(),
  activated_at: z.string().datetime({ offset: true }).optional(),
});

// Allowed patch fields for emergency-session updates.
export const updateEmergencySessionSchema = z
  .object({
    status: emergencyStatusSchema.optional(),
    severity: severityLevelSchema.optional(),
    title: z.string().min(1).max(180).optional(),
    message: z.string().min(1).optional(),
    instructions: z.string().nullable().optional(),
    activated_by: z.string().uuid().nullable().optional(),
    activated_at: z.string().datetime({ offset: true }).nullable().optional(),
    resolved_by: z.string().uuid().nullable().optional(),
    resolved_at: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

// Optional filters for listing emergency sessions.
export const emergencySessionQuerySchema = z.object({
  status: emergencyStatusSchema.optional(),
  severity: severityLevelSchema.optional(),
  activated_by: z.string().uuid().optional(),
  resolved_by: z.string().uuid().optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type EmergencySession = z.infer<typeof emergencySessionSchema>;
export type CreateEmergencySessionInput = z.infer<
  typeof createEmergencySessionSchema
>;
export type UpdateEmergencySessionInput = z.infer<
  typeof updateEmergencySessionSchema
>;
export type EmergencySessionQuery = z.infer<typeof emergencySessionQuerySchema>;
