import { GoogleGenAI } from "@google/genai";
import JSON5 from "json5";
import getNutrition from "./getNutrition.js";

async function generate(input, type) {
  const apiKey = "AIzaSyDp7tmz_51cVkCNW0dh3ey3KBAxwCGPB8M";

  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: input,
    });

    const result = response.candidates[0].content.parts[0];

    const answer = result.text;
    const start = answer.indexOf("{");
    const end = answer.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON object found.");
    }

    const jsonStr = answer.slice(start, end + 1);

    const generated = JSON5.parse(jsonStr);

async function addNutritionDataToMeals(finalAnswer) {
  const updatedMeals = await Promise.all(
    finalAnswer.meals.map(async (meal) => {
      const updatedIngredients = await Promise.all(
        meal.ingredients.map(async (ingredient) => {
          try {
            const nutritionData = await getNutrition(ingredient.name);
            return {
              ...ingredient, 
              nutrition: {
                nutrients: nutritionData.nutrients,
                caloricBreakdown: nutritionData.caloricBreakdown,
                weightPerServing: nutritionData.weightPerServing,
              },
            };
          } catch (error) {
            console.error(`Error fetching nutrition for ${ingredient.name}:`, error);
            return {
              ...ingredient, 
              nutrition: null, 
            };
          }
        })
      );
      return {
        ...meal, 
        ingredients: updatedIngredients,
      };
    })
  );
  return {
    ...finalAnswer,
    meals: updatedMeals
  };
}
    if(type === "workout") {
      return generated;}
      
    const finalAnswer = await addNutritionDataToMeals(generated);
    return finalAnswer;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

export default generate;




/*
`Generate a diet that has ${foodTimes} meals including snacks, ${calories} calories, and ${protein}g protein
    ${dessert ? " and include a healthy dessert" : "do not include a dessert"}.
   Give the name of each meal(make sure the name is clear because i am going to fetch information about each one from spoonacular api), each ingredient with its amount in grams, and ensure all ingredients are base items (e.g., chicken breast, rice, broccoli). Return the result as a JSON object in the following format:

{
  "meals": [
    {
      "name": "Meal Name",
      "ingredients": [
        { "name": "Ingredient 1", "amount_g": 100 },
        { "name": "Ingredient 2", "amount_g": 150 }
      ],
      "howToMake": "explain how to make",
    },
    ...
  ]
}
`

`Generate a weekly workout plan (Monday-Sunday) as a JSON object.

**Constraints:**
- {trainingDays} training days, rest days for the others.
- 12-18 working sets per week per muscle group. Legs count as one muscle.
- {cardioOption}
- Use common gym exercises and light cardio types.

**JSON Format:**
{
  "caloriesBurned": "Estimate based on workout intensity and duration.",
  "workouts": [
    { "monday": { "day_type": "workout", "focus_muscles": ["Muscle1", "Muscle2"], "exercises": [{"name": "Exercise", "sets": N, "reps": "X-Y"}], "cardio": {"type": "CardioType", "duration_minutes": N} } },
    { "tuesday": { "day_type": "rest", "activity": "Rest activity" } },
    // ... continue for all 7 days with similar structure
  ]
}`*/
