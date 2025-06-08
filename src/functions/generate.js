import { GoogleGenAI } from "@google/genai";
import JSON5 from "json5";

async function generate(input) {
  const apiKey = "AIzaSyDp7tmz_51cVkCNW0dh3ey3KBAxwCGPB8M";

  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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

    console.log(jsonStr);

    const finalAnswer = JSON5.parse(jsonStr);
    return finalAnswer.caloriesBurned;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

console.log(
  await generate(`Generate a weekly workout plan (Monday-Sunday) as a JSON object.

**Constraints:**
- 4 training days, rest days for the others.
- 12-18 working sets per week per muscle group. Legs count as one muscle.
- include cardio
- Use common gym exercises and light cardio types.

return a json format only with pure values do not add unneeded text. if you have an estimation of something just write one average number do not add extra information.

**JSON Format:**
{
  "caloriesBurned": "Estimate based on workout intensity and duration.",
  "workouts": [
    { "monday": { "day_type": "workout", "focus_muscles": ["Muscle1", "Muscle2"], "exercises": [{"name": "Exercise", "sets": N, "reps": "X-Y"}], "cardio": {"type": "CardioType", "duration_minutes": N} } },
    { "tuesday": { "day_type": "rest", "activity": "Rest activity" } },
    // ... continue for all 7 days with similar structure
  ]
}`)
);

export default generate;

/*`Generate a weekly workout plan (Monday-Sunday) as a JSON object.

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
