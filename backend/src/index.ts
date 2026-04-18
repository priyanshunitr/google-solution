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

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
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

initSocketServer(httpServer);

if (process.env.ENABLE_ALERT_OUTBOX_WORKER === "true") {
  startAlertOutboxWorker();
}

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
