import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { PLAN_LIMITS } from "../../../lib/subscription";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Extract and validate JWT token from Authorization header
 */
function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;

    if (!decoded) return null;

    const userId = decoded.sub || decoded.userId;
    return userId || null;
  } catch (error) {
    console.error("Token extraction error:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  try {
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Verify user exists and get plan
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("id, plan_id, plan, credits") // fetch plan string if available, or map plan_id
      .eq("id", userId)
      .single();

    if (userError || !userProfile) {
      // Fallback or error
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Map plan_id to plan string if needed, or stick to what subscription.ts expects
    // Assuming profiles table has a 'plan' column as per types.ts, or we map plan_id
    // Existing code in resumes/index.ts maps plan_id manually. Let's do similar or better.
    // types.ts says UserProfile has 'plan': "free" | "starter"...
    // Let's rely on that if possible, or fallback.

    // Map plan_id to plan string
    let userPlan = "free";

    // trust the plan string first if it matches our new types
    if (
      userProfile.plan &&
      ["free", "professional", "premium"].includes(userProfile.plan)
    ) {
      userPlan = userProfile.plan;
    } else {
      // fallback to legacy plan_id mapping
      const pid = userProfile.plan_id;
      if (pid === 2) userPlan = "professional";
      else if (pid === 3) userPlan = "professional";
      else if (pid === 4) userPlan = "premium";
      else if (pid === 5) userPlan = "enterprise";
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    }

    if (req.method === "POST") {
      const {
        title,
        content,
        content_short,
        resume_id,
        job_description,
        company_name,
        job_title,
      } = req.body;

      if (!title) {
        return res
          .status(400)
          .json({ success: false, error: "Title is required" });
      }

      // Check limits
      const { count, error: countError } = await supabase
        .from("cover_letters")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) throw countError;

      // Type cast to allow indexing if Typescript complains
      const limits = PLAN_LIMITS as any;
      const planLimit = limits[userPlan]?.cover_letters ?? 1;
      const hasCredits = (userProfile.credits || 0) > 0;

      // Allow if under limit OR has credits (paid usage)
      if ((count || 0) >= planLimit && !hasCredits) {
        return res.status(403).json({
          success: false,
          error: `Cover Letter limit reached for ${userPlan} plan. Upgrade to create more.`,
        });
      }

      const { data, error } = await supabase
        .from("cover_letters")
        .insert({
          user_id: userId,
          title,
          content,
          content_short,
          resume_id,
          job_description,
          company_name,
          job_title,
        })
        .select()
        .single();

      if (error) {
        console.error("Cover Letter Insert Error:", error);
        return res.status(500).json({
          success: false,
          error: error.message || "Database insert failed",
        });
      }

      return res.status(201).json({ success: true, data });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("Cover Letter API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
