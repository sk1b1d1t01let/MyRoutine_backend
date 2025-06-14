import express from "express";
import generation from "../functions/generate.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/generation", async (req, res) => {
  const { prompt } = req.body;
  const authHeader = req.headers["authorization"];
  console.log("Received prompt:", prompt);
  console.log("Authorization header:", authHeader);

  if (!authHeader) {
    console.error("Missing authorization header");
    return res.status(401).json({ message: "Missing authorization header" });
  }
  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!prompt) {
    console.error("Prompt is required but not provided");
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      console.error("User not found for email:", decoded.email);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.hasPaid) {
      console.error("User has not paid for subscription");
      return res.status(403).json({
        message: "Please subscribe to access all features",
      });
    }
    
    const generated = await generation(prompt);

    if (!generated) {
      return res
        .status(500)
        .json({ message: "Generation failed, please try again" });
    }
    console.log(generated)
    return res.status(200).json({ generated });
  } catch (error) {
    console.error("Error in generation route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
