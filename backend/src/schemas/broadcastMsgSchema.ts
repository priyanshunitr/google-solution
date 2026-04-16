import { z } from "zod";
import { messageKindSchema } from "./sharedEnumsSchema.js";

// Database row shape for the broadcast_messages table.
export const broadcastMsgSchema = z.object({
  id: z.string().uuid(),
  emergency_session_id: z.string().uuid().nullable(),
  sender_user_id: z.string().uuid().nullable(),
  sender_kind: messageKindSchema,
  body: z.string().min(1),
  created_at: z.string().datetime({ offset: true }),
});

// Payload expected when creating a new broadcast message.
export const createBroadcastMsgSchema = z.object({
  emergency_session_id: z.string().uuid().optional(),
  sender_user_id: z.string().uuid().optional(),
  sender_kind: messageKindSchema,
  body: z.string().min(1),
});

// Optional filters for listing broadcast messages.
export const broadcastMsgQuerySchema = z.object({
  emergency_session_id: z.string().uuid().optional(),
  sender_user_id: z.string().uuid().optional(),
  sender_kind: messageKindSchema.optional(),
  created_from: z.string().datetime({ offset: true }).optional(),
  created_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type BroadcastMsg = z.infer<typeof broadcastMsgSchema>;
export type CreateBroadcastMsgInput = z.infer<typeof createBroadcastMsgSchema>;
export type BroadcastMsgQuery = z.infer<typeof broadcastMsgQuerySchema>;
