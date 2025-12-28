import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}

export const geminiClient = new GoogleGenerativeAI(apiKey || "");

export const geminiFlashModel = geminiClient.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.2, // Lower temperature for more deterministic output
    maxOutputTokens: 2048,
  },
});

export const geminiProModel = geminiClient.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 4096,
  },
});
