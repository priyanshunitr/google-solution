import { z } from "zod";

// Database row shape for the broadcast_message_reads table.
export const broadcastMsgReadSchema = z.object({
  message_id: z.string().uuid(),
  user_id: z.string().uuid(),
  seen_at: z.string().datetime({ offset: true }),
});

// Payload expected when marking a broadcast as read.
export const markBroadcastReadSchema = z.object({
  message_id: z.string().uuid(),
  user_id: z.string().uuid(),
  seen_at: z.string().datetime({ offset: true }).optional(),
});

// Upsert payload for read receipts keyed by (message_id, user_id).
export const upsertBroadcastMsgReadSchema = markBroadcastReadSchema;

// Optional filters for listing broadcast read receipts.
export const broadcastMsgReadQuerySchema = z.object({
  message_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  seen_from: z.string().datetime({ offset: true }).optional(),
  seen_to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type BroadcastMsgRead = z.infer<typeof broadcastMsgReadSchema>;
export type MarkBroadcastReadInput = z.infer<typeof markBroadcastReadSchema>;
export type UpsertBroadcastMsgReadInput = z.infer<
  typeof upsertBroadcastMsgReadSchema
>;
export type BroadcastMsgReadQuery = z.infer<typeof broadcastMsgReadQuerySchema>;
