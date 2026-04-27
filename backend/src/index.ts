import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import guestRoutes from "./routes/guestRoutes.js";
import { startAlertOutboxWorker } from "./services/alertOutboxWorker.js";
import staffRoutes from "./routes/staffRoutes.js";
import { initSocketServer } from "./realtime/socketServer.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import communicationsRoutes from "./routes/communicationsRoutes.js";
import responderRoutes from "./routes/responderRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import { startIncidentSlaWorker } from "./services/incidentSlaWorker.js";
import { startPushDeliveryWorker } from "./services/pushDeliveryWorker.js";
import { connectDB } from "./lib/dbConnect.js";

dotenv.config();

const app = express();
const basePort = Number(process.env.PORT || 3001);
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/comms", communicationsRoutes);
app.use("/api/responders", responderRoutes);
app.use("/api/incidents", incidentRoutes);

initSocketServer(httpServer);

if (process.env.ENABLE_ALERT_OUTBOX_WORKER === "true") {
  startAlertOutboxWorker();
}

if (process.env.ENABLE_PUSH_DELIVERY_WORKER === "true") {
  startPushDeliveryWorker();
}

if (process.env.ENABLE_INCIDENT_SLA_WORKER === "true") {
  startIncidentSlaWorker();
}

function listenWithPortRetry(startPort: number, remainingRetries = 5) {
  const tryPort = startPort;

  httpServer.once("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && remainingRetries > 0) {
      const nextPort = tryPort + 1;
      console.warn(
        `Port ${tryPort} is already in use. Retrying on ${nextPort}...`,
      );
      listenWithPortRetry(nextPort, remainingRetries - 1);
      return;
    }

    console.error("Server failed to start:", err);
    process.exit(1);
  });

  httpServer.listen(tryPort, () => {
    console.log(`Server is running at http://localhost:${tryPort}`);
  });
}

async function start() {
  try {
    await connectDB(5);
    listenWithPortRetry(basePort);
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
