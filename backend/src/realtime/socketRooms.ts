import { Socket } from "socket.io";

export function joinRooms(socket: Socket, role?: string, userId?: string) {
  if (role) socket.join(`role:${role}`);
  if (userId) socket.join(`user:${userId}`);
}