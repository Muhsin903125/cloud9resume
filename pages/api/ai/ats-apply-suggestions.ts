import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { atsOptimizerService } from "@/lib/ai/atsOptimizer";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

import { CREDIT_COSTS } from "../../../lib/subscription";

const AUTO_APPLY_COST = CREDIT_COSTS.ats_auto_apply; // Additional cost for auto-applying

// Helper to extract user ID
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

  const { resumeData, jobDescription, resumeId, analysis } = req.body;

  if (!resumeData || !jobDescription || !resumeId) {
    return res.status(400).json({
      success: false,
      error: "Missing required data",
    });
  }

  try {
    // 1. Check User & Credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, plan_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res
        .status(404)
        .json({ success: false, error: "User profile not found" });
    }

    if (profile.credits < AUTO_APPLY_COST) {
      return res.status(403).json({
        success: false,
        error: "Insufficient credits",
        required: AUTO_APPLY_COST,
        current: profile.credits,
      });
    }

    // 2. Use AI to apply suggestions and regenerate resume sections
    const optimizedResume = await atsOptimizerService.applyOptimizations(
      resumeData,
      jobDescription,
      analysis
    );

    // 3. Fetch existing resume sections
    const { data: existingSections, error: sectionsError } = await supabase
      .from("resume_sections")
      .select("*")
      .eq("resume_id", resumeId);

    if (sectionsError) {
      throw new Error("Failed to fetch resume sections");
    }

    // 4. Extract sections from AI response and update each one
    // The AI returns full resume object with sections array
    const optimizedSections = optimizedResume.sections || [];
    const updatePromises = [];

    for (const optimizedSection of optimizedSections) {
      const sectionType = optimizedSection.section_type;
      let sectionData = optimizedSection.section_data;

      // Normalize section data structure
      // AI sometimes returns summary as string instead of {text: "..."}
      if (sectionType === "summary" && typeof sectionData === "string") {
        sectionData = { text: sectionData };
      }

      const existingSection = existingSections?.find(
        (s) => s.section_type === sectionType
      );

      if (existingSection && sectionData) {
        // Update existing section with optimized data
        updatePromises.push(
          supabase
            .from("resume_sections")
            .update({
              section_data: sectionData,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSection.id)
        );
      }
    }

    await Promise.all(updatePromises);

    // 5. Update resume metadata
    await supabase
      .from("resumes")
      .update({
        ats_score: analysis?.score || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);

    // 6. Deduct Credits & Log
    const missingKeywords = analysis?.missing_keywords || {};
    const totalKeywords = Array.isArray(missingKeywords)
      ? missingKeywords.length
      : (missingKeywords.skills?.length || 0) +
        (missingKeywords.experience?.length || 0) +
        (missingKeywords.summary?.length || 0);

    const { error: rpcError } = await supabase.rpc("deduct_credits_and_log", {
      p_user_id: userId,
      p_credits: AUTO_APPLY_COST,
      p_action: "ats_auto_apply",
      p_details: {
        resume_id: resumeId,
        score: analysis?.score,
        keywords_added: totalKeywords,
      },
    });

    if (rpcError) {
      // Fallback manual deduction
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - AUTO_APPLY_COST })
        .eq("id", userId);
      await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        action_type: "ats_auto_apply",
        credits_used: AUTO_APPLY_COST,
        details: {
          resume_id: resumeId,
          score: analysis?.score,
          keywords_added: totalKeywords,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: optimizedSections,
      creditsDeducted: AUTO_APPLY_COST,
      remainingCredits: profile.credits - AUTO_APPLY_COST,
      message: "Resume optimized successfully",
    });
  } catch (error: any) {
    console.error("ATS Auto-Apply API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to apply optimizations",
    });
  }
}
