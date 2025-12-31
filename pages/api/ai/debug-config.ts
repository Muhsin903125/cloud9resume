import { NextApiRequest, NextApiResponse } from "next";
import { geminiFlashModel } from "@/lib/ai/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const modelInfo =
      (geminiFlashModel as any)._model || (geminiFlashModel as any).model;
    const apiKey = process.env.GEMINI_API_KEY || "NOT_FOUND";

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      activeModel: modelInfo,
      keyMasked:
        apiKey !== "NOT_FOUND"
          ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
          : "MISSING",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 25)}...`
        : "MISSING",
      modelsToTry: [
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
      ],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
