import { getIO } from "./socketServer.js";

export function emitToStaff(event: string, payload: any) {
  const io = getIO();
  if (!io) return;

  io.to("role:staff").emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: any) {
  const io = getIO();
  if (!io) return;

  io.to(`user:${userId}`).emit(event, payload);
}