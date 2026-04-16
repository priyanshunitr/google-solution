import { z } from "zod";

// Flexible metadata payload attached to each audit entry.
export const auditMetaSchema = z.record(z.string(), z.unknown());

// Database row shape for the audit_log table.
export const auditLogSchema = z.object({
  id: z.number().int().nonnegative(),
  actor_user_id: z.string().uuid().nullable(),
  action: z.string().min(1).max(80),
  entity_type: z.string().min(1).max(80),
  entity_id: z.string().uuid().nullable(),
  meta: auditMetaSchema,
  created_at: z.string().datetime({ offset: true }),
});

// Payload expected when creating an audit log entry.
export const createAuditLogSchema = z.object({
  actor_user_id: z.string().uuid().optional(),
  action: z.string().min(1).max(80),
  entity_type: z.string().min(1).max(80),
  entity_id: z.string().uuid().optional(),
  meta: auditMetaSchema.optional().default({}),
});

// Optional filters for audit-log query endpoints.
export const auditLogQuerySchema = z.object({
  actor_user_id: z.string().uuid().optional(),
  action: z.string().min(1).max(80).optional(),
  entity_type: z.string().min(1).max(80).optional(),
  entity_id: z.string().uuid().optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
