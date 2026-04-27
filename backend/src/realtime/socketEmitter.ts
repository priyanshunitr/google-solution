import { getIO } from "./socketServer.js";

export function emitToStaff(event: string, payload: any) {
  const io = getIO();
  if (!io) return;

  io.to("role:staff").emit(event, payload);
}

export function emitToRole(role: string, event: string, payload: any) {
  const io = getIO();
  if (!io) return;

  io.to(`role:${role}`).emit(event, payload);
}

export function emitToRoles(roles: string[], event: string, payload: any) {
  const uniqueRoles = Array.from(new Set(roles));

  uniqueRoles.forEach((role) => {
    emitToRole(role, event, payload);
  });
}

export function emitToUser(userId: string, event: string, payload: any) {
  const io = getIO();
  if (!io) return;

  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToUsers(userIds: string[], event: string, payload: any) {
  const uniqueUsers = Array.from(new Set(userIds));

  uniqueUsers.forEach((userId) => {
    emitToUser(userId, event, payload);
  });
}
