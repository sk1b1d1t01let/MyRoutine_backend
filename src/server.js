import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors"; 
import job from "./lib/cron.js"


const app = express();
const PORT = process.env.PORT;

job.start()

app.use(cors({
  origin: 'http://localhost:8081',  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json());

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
