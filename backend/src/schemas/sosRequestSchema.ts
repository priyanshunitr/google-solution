import { z } from "zod";

// Database row shape for the sos_requests table.
export const sosRequestSchema = z
  .object({
    id: z.string().uuid(),
    emergency_session_id: z.string().uuid().nullable(),
    guest_user_id: z.string().uuid(),
    message: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    location_accuracy_m: z.number().nullable(),
    location_captured_at: z.string().datetime({ offset: true }).nullable(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine((value) => (value.latitude === null) === (value.longitude === null), {
    message: "latitude and longitude must both be present or both be null",
    path: ["latitude"],
  });

// Payload expected when creating an SOS request.
export const createSosRequestSchema = z
  .object({
    emergency_session_id: z.string().uuid().optional(),
    guest_user_id: z.string().uuid(),
    message: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    location_accuracy_m: z.number().optional(),
    location_captured_at: z.string().datetime({ offset: true }).optional(),
  })
  .refine(
    (value) =>
      (value.latitude === undefined) === (value.longitude === undefined),
    {
      message: "latitude and longitude must both be provided or omitted",
      path: ["latitude"],
    },
  );

// Allowed patch fields for SOS updates.
export const updateSosRequestSchema = z
  .object({
    message: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    location_accuracy_m: z.number().nullable().optional(),
    location_captured_at: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (value) => {
      if ("latitude" in value || "longitude" in value) {
        return (
          (value.latitude === null || value.latitude !== undefined) ===
          (value.longitude === null || value.longitude !== undefined)
        );
      }
      return true;
    },
    {
      message: "latitude and longitude must be updated together",
      path: ["latitude"],
    },
  );

// Optional filters for listing SOS requests.
export const sosRequestQuerySchema = z.object({
  emergency_session_id: z.string().uuid().optional(),
  guest_user_id: z.string().uuid().optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type SosRequest = z.infer<typeof sosRequestSchema>;
export type CreateSosRequestInput = z.infer<typeof createSosRequestSchema>;
export type UpdateSosRequestInput = z.infer<typeof updateSosRequestSchema>;
export type SosRequestQuery = z.infer<typeof sosRequestQuerySchema>;
