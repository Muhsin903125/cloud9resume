import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { geminiFlashModel } from "@/lib/ai/client";
import { CREDIT_COSTS } from "@/lib/subscription";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const COST = CREDIT_COSTS.cover_letter_generation || 5;

function extractUserId(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.decode(token);
    return decoded?.sub || decoded?.userId || null;
  } catch (e) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { resumeText, jobDescription, companyName, jobTitle } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({
      success: false,
      error: "Missing resume text or job description",
    });
  }

  try {
    // 1. Check Credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (profile.credits < COST) {
      return res.status(403).json({
        success: false,
        error: "Insufficient credits",
        required: COST,
        current: profile.credits,
      });
    }

    // 2. Generate Content
    const prompt = `
You are an expert career coach and professional resume writer.
Write TWO versions of a cover letter based on the following Resume and Job Description.

Target Company: ${companyName || "the company"}
Target Role: ${jobTitle || "the position"}

RESUME CONTENT:
${resumeText.substring(0, 10000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}

INSTRUCTIONS:
1. "full": a formal cover letter (300-400 words). Professional tone. No placeholders at the top.
2. "short": a concise version (100-150 words) suitable for a LinkedIn InMail or Email body. Friendly but professional.

OUTPUT FORMAT:
Return ONLY a valid JSON object with the following structure:
{
  "full": "markdown string...",
  "short": "markdown string..."
}
Do NOT include "\`\`\`json" or markdown formatting around the JSON. Just the raw JSON string.
    `;

    const result = await geminiFlashModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting if model messes up
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Fallback if JSON fails
      data = { full: text, short: "" };
    }

    // 3. Deduct Credits
    const { error: rpcError } = await supabase.rpc("deduct_credits_and_log", {
      p_user_id: userId,
      p_credits: COST,
      p_action: "cover_letter_generation",
      p_details: { company: companyName, role: jobTitle },
    });

    if (rpcError) {
      // Fallback
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - COST })
        .eq("id", userId);

      await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        action_type: "cover_letter_generation",
        credits_used: COST,
        details: { company: companyName, role: jobTitle },
      });
    }

    return res.status(200).json({
      success: true,
      data: data, // Now returning object { full, short }
      creditsDeducted: COST,
      remainingCredits: profile.credits - COST,
    });
  } catch (error: any) {
    console.error("Cover Letter AI Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
