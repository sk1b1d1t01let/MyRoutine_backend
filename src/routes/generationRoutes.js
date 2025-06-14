import express from "express";
import generation from "../functions/generate.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/generation", async (req, res) => {
  const { prompt } = req.body;
  const authHeader = req.headers["authorization"];
  console.log(prompt)
  const mut = null

  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }
  console.log(authHeader)
  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.hasPaid) {
      return res.status(403).json({
        message: "Please subscribe to access all features",
      });
    }
    
    const generated = await generation(prompt);
    console.log(generated)

    if (!generated) {
      return res
        .status(500)
        .json({ message: "Generation failed, please try again" });
    }

    return res.status(200).json({ generated });
  } catch (error) {
    console.error("Error in generation route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
