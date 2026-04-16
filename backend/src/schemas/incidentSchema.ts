import { z } from "zod";
import {
  incidentStatusSchema,
  incidentTypeSchema,
  severityLevelSchema,
} from "./sharedEnumsSchema.js";

// Database row shape for the incidents table.
export const incidentSchema = z
  .object({
    id: z.string().uuid(),
    emergency_session_id: z.string().uuid().nullable(),
    incident_type: incidentTypeSchema,
    status: incidentStatusSchema,
    priority: severityLevelSchema,
    alert_id: z.string().uuid().nullable(),
    sos_request_id: z.string().uuid().nullable(),
    assigned_staff_user_id: z.string().uuid().nullable(),
    assigned_responder_user_id: z.string().uuid().nullable(),
    acknowledged_at: z.string().datetime({ offset: true }).nullable(),
    responding_at: z.string().datetime({ offset: true }).nullable(),
    escalated_at: z.string().datetime({ offset: true }).nullable(),
    resolved_at: z.string().datetime({ offset: true }).nullable(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (value) =>
      (value.incident_type === "alert" &&
        value.alert_id !== null &&
        value.sos_request_id === null) ||
      (value.incident_type === "sos" &&
        value.alert_id === null &&
        value.sos_request_id !== null),
    {
      message: "incident source must match incident_type",
      path: ["incident_type"],
    },
  );

// Payload expected when creating a new incident.
export const createIncidentSchema = z
  .object({
    emergency_session_id: z.string().uuid().optional(),
    incident_type: incidentTypeSchema,
    status: incidentStatusSchema.optional().default("active"),
    priority: severityLevelSchema.optional().default("medium"),
    alert_id: z.string().uuid().optional(),
    sos_request_id: z.string().uuid().optional(),
    assigned_staff_user_id: z.string().uuid().optional(),
    assigned_responder_user_id: z.string().uuid().optional(),
    acknowledged_at: z.string().datetime({ offset: true }).optional(),
    responding_at: z.string().datetime({ offset: true }).optional(),
    escalated_at: z.string().datetime({ offset: true }).optional(),
    resolved_at: z.string().datetime({ offset: true }).optional(),
  })
  .refine(
    (value) =>
      (value.incident_type === "alert" &&
        !!value.alert_id &&
        !value.sos_request_id) ||
      (value.incident_type === "sos" &&
        !value.alert_id &&
        !!value.sos_request_id),
    {
      message: "incident source must match incident_type",
      path: ["incident_type"],
    },
  );

// Allowed patch fields for incident updates.
export const updateIncidentSchema = z
  .object({
    status: incidentStatusSchema.optional(),
    priority: severityLevelSchema.optional(),
    assigned_staff_user_id: z.string().uuid().nullable().optional(),
    assigned_responder_user_id: z.string().uuid().nullable().optional(),
    acknowledged_at: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional(),
    responding_at: z.string().datetime({ offset: true }).nullable().optional(),
    escalated_at: z.string().datetime({ offset: true }).nullable().optional(),
    resolved_at: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  });

// Optional filters for listing incidents.
export const incidentQuerySchema = z.object({
  emergency_session_id: z.string().uuid().optional(),
  incident_type: incidentTypeSchema.optional(),
  status: incidentStatusSchema.optional(),
  priority: severityLevelSchema.optional(),
  assigned_staff_user_id: z.string().uuid().optional(),
  assigned_responder_user_id: z.string().uuid().optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type Incident = z.infer<typeof incidentSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentQuery = z.infer<typeof incidentQuerySchema>;
