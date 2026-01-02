import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  console.error(
    "❌ CRITICAL: GEMINI_API_KEY is not set in environment variables!"
  );
} else {
  const maskedKey = `${apiKey.substring(0, 6)}...${apiKey.substring(
    apiKey.length - 4
  )}`;
  console.log(
    `✅ [${new Date().toISOString()}] GEMINI_API_KEY detected: ${maskedKey}`
  );
  console.log(`💡 Current Preferred Model: gemini-2.5-flash`);
  console.log(
    `💡 Note: If you get a 404, please visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com and ensure "Generative Language API" (NOT just "Gemini API") is enabled for the project matching this key.`
  );
}

// Initialize the Gemini client
export const geminiClient = new GoogleGenerativeAI(apiKey || "dummy_key");

// Use current stable models (as of Jan 2026)
export const geminiFlashModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
  },
});

export const geminiProModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 4096,
  },
});
