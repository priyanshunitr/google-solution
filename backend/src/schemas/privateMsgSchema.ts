import { z } from "zod";
import { privateChannelKindSchema } from "./sharedEnumsSchema.js";

// Database row shape for the private_messages table.
export const privateMsgSchema = z
  .object({
    id: z.string().uuid(),
    emergency_session_id: z.string().uuid().nullable(),
    sender_user_id: z.string().uuid(),
    recipient_user_id: z.string().uuid().nullable(),
    channel: privateChannelKindSchema.nullable(),
    body: z.string().min(1),
    created_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (value) => value.recipient_user_id !== null || value.channel !== null,
    {
      message: "Either recipient_user_id or channel must be provided",
      path: ["recipient_user_id"],
    },
  );

// Payload expected when creating a private message.
export const createPrivateMsgSchema = z
  .object({
    emergency_session_id: z.string().uuid().optional(),
    sender_user_id: z.string().uuid(),
    recipient_user_id: z.string().uuid().optional(),
    channel: privateChannelKindSchema.optional(),
    body: z.string().min(1),
  })
  .refine((value) => !!value.recipient_user_id || !!value.channel, {
    message: "Either recipient_user_id or channel must be provided",
    path: ["recipient_user_id"],
  });

// Optional filters for listing private messages.
export const privateMsgQuerySchema = z.object({
  emergency_session_id: z.string().uuid().optional(),
  sender_user_id: z.string().uuid().optional(),
  recipient_user_id: z.string().uuid().optional(),
  channel: privateChannelKindSchema.optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type PrivateMsg = z.infer<typeof privateMsgSchema>;
export type CreatePrivateMsgInput = z.infer<typeof createPrivateMsgSchema>;
export type PrivateMsgQuery = z.infer<typeof privateMsgQuerySchema>;
