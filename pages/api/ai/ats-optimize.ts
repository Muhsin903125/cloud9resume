import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { atsOptimizerService } from "@/lib/ai/atsOptimizer";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ATS_CHECK_COST = 5;

// Helper to extract user ID (duplicating utils for isolation/speed,
// normally we'd export this from a middleware)
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

  const { resumeData, jobDescription, resumeId } = req.body;

  if (!resumeData || !jobDescription) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Missing resume data or job description",
      });
  }

  try {
    // 1. Check User & Credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res
        .status(404)
        .json({ success: false, error: "User profile not found" });
    }

    if (profile.credits < ATS_CHECK_COST) {
      return res.status(403).json({
        success: false,
        error: "Insufficient credits",
        required: ATS_CHECK_COST,
        current: profile.credits,
      });
    }

    // 2. Perform AI Analysis
    const result = await atsOptimizerService.analyzeResume(
      resumeData,
      jobDescription
    );

    // 3. Deduct Credits & Log
    // We use the RPC if available, or manual transaction
    const { error: rpcError } = await supabase.rpc("deduct_credits_and_log", {
      p_user_id: userId,
      p_credits: ATS_CHECK_COST,
      p_action: "ats_analysis",
      p_details: { resume_id: resumeId, score: result.score },
    });

    if (rpcError) {
      // Fallback manual deduction
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - ATS_CHECK_COST })
        .eq("id", userId);
      await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        action_type: "ats_analysis",
        credits_used: ATS_CHECK_COST,
        details: { resume_id: resumeId, score: result.score },
      });
    }

    // 4. Update Resume with latest score (if resumeId provided)
    if (resumeId) {
      await supabase
        .from("resumes")
        .update({ ats_score: result.score })
        .eq("id", resumeId);
    }

    return res.status(200).json({
      success: true,
      data: result,
      creditsDeducted: ATS_CHECK_COST,
      remainingCredits: profile.credits - ATS_CHECK_COST,
    });
  } catch (error: any) {
    console.error("ATS API Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        error: error.message || "Internal server error",
      });
  }
}
