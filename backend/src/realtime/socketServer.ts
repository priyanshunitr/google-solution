import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export type StaffNotificationEvent = {
  notificationId: string;
  title: string;
  body: string;
  channel: "websocket";
  createdAt: string;
  data: Record<string, unknown>;
};

let io: Server | null = null;

function joinRoomsFromHandshake(socket: Socket): void {
  const role = socket.handshake.query.role;
  const userId = socket.handshake.query.userId;

  if (typeof role === "string" && role.length > 0) {
    socket.join(`role:${role}`);
  }

  if (typeof userId === "string" && userId.length > 0) {
    socket.join(`user:${userId}`);
  }
}

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    joinRoomsFromHandshake(socket);

    socket.on(
      "staff:subscribe",
      (payload: { role?: string; userId?: string }) => {
        if (payload?.role) {
          socket.join(`role:${payload.role}`);
        }
        if (payload?.userId) {
          socket.join(`user:${payload.userId}`);
        }
      },
    );
  });

  return io;
}

export function emitStaffNotification(payload: StaffNotificationEvent): void {
  if (!io) {
    return;
  }

  io.to("role:staff").emit("staff:new-notification", payload);
}

export function getSocketServer(): Server | null {
  return io;
}
