import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { joinRooms } from "./socketRooms.js";
import { SOCKET_EVENTS } from "./socketEvents.js";

let io: Server;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // auto join from query
    const { role, userId } = socket.handshake.query;
    joinRooms(socket, role as string, userId as string);

    // manual subscribe
    socket.on(SOCKET_EVENTS.STAFF_SUBSCRIBE, ({ role, userId }) => {
      joinRooms(socket, role, userId);
    });

    console.log("User connected:", socket.id);
  });

  return io;
}

export function getIO() {
  return io;
}