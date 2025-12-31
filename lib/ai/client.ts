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
  console.log(`💡 Current Preferred Model: gemini-1.5-flash-8b`);
  console.log(
    `💡 Note: If you get a 404, please visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com and ensure "Generative Language API" (NOT just "Gemini API") is enabled for the project matching this key.`
  );
}

// Explicitly use v1 API instead of v1beta
export const geminiClient = new GoogleGenerativeAI(apiKey || "dummy_key");
// Note: SDK usually defaults to v1 or v1beta. We will stick to the default but ensure the key is right.
// If the user is on a very new account, sometimes they need to wait 5-10 mins.

// Use stable, cost-effective models
export const geminiFlashModel = geminiClient.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
  generationConfig: {
    temperature: 0.2,
  },
});

export const geminiProModel = geminiClient.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 4096,
  },
});
