import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import generationRoutes from "./routes/generationRoutes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import job from "./lib/cron.js";
import startMonthlyResetJob from "./lib/monthlyReset.js";

const app = express();
const PORT = process.env.PORT;

job.start();
console.log("cron job started")

app.use(
  cors({
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/processing", generationRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
  console.log("database connected");
  startMonthlyResetJob.start();
  console.log("monthlyReset started");
});
