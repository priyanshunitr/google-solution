import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import guestRoutes from "./routes/guestRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
