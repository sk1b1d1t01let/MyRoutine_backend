import express from "express";
import generation from "../functions/generate.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import getNutrition from "../functions/getNutrition.js";
import searchMeals from "../functions/searchMeal.js";

const router = express.Router();

router.post("/generation", async (req, res) => {
  const { prompt, type } = req.body;
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

    const generated = await generation(prompt, type);

    if (type === "diet") {
      user.diet = generated;
      await user.save();
    }
    if (type === "workout") {
      user.workoutPlan = generated;
      await user.save();
    }

    if (!generated) {
      return res
        .status(500)
        .json({ message: "Generation failed, please try again" });
    }
    console.log(generated);
    return res.status(200).json({ generated });
  } catch (error) {
    console.error("Error in generation route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/searchIngredient", async (req, res) => {
  try {
    const { food } = req.body;

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
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.monthlyRequests === 0) {
      return res.status(500).json({ message: "Exceeded request limit" });
    }

    user.monthlyRequests--;

    await user.save();

    const result = getNutrition(food);

    if (!result) {
      return res.status(404).json({ message: "food information not found" });
    }

    const finalResult = {
      nutrients: result.nutrients,
      caloricBreakdown: result.caloricBreakdown,
      weightPerServing: result.weightPerServing,
    };

    return res.status(200).json({ food: finalResult });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/searchMeal", async (req, res) => {
  try {
    const { meal } = req.body;
    if (!meal) {
      return res.status(400).json({ message: "No meal provided" });
    }

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
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.monthlyRequests === 0) {
      return res.status(500).json({ message: "Exceeded request limit" });
    }

    user.monthlyRequests--;

    await user.save();

    const answer = searchMeals(meal);

    return res.status(200).json({ meal: answer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
