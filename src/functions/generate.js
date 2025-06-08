import { GoogleGenAI } from "@google/genai";
import JSON5 from "json5";

async function generation(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
  });

  const answer = response.text;
  const start = answer.indexOf("{");
  const end = answer.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found.");
  }

  const jsonStr = answer.slice(start, end + 1);

  console.log(jsonStr);

  const finalAnswer = JSON5.parse(jsonStr);
  return finalAnswer;
}

export default generation;
