import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ResumeResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Extract and validate JWT token from Authorization header
 * Format: Bearer <token>
 */
function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Decode JWT without verification (token is already verified by backend)
    const decoded = jwt.decode(token) as any;

    if (!decoded) {
      console.error("Invalid JWT token structure");
      return null;
    }

    // Support both standard JWT format (sub) and our custom format (userId)
    const userId = decoded.sub || decoded.userId;

    if (!userId) {
      console.error("JWT token missing user ID (sub or userId field)");
      return null;
    }

    return userId;
  } catch (error) {
    console.error("Token extraction error:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResumeResponse>
) {
  try {
    // Extract user ID from JWT Authorization header
    const userId = extractUserIdFromToken(req);

    console.log("🔍 Resume API - Extracted userId from token:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "Unauthorized. Please provide valid authentication token in Authorization header.",
      });
    }

    // Verify user exists in database
    const { data: userCheck, error: userCheckError } = await supabase
      .from("users")
      .select("id, email, plan")
      .eq("id", userId)
      .single();

    if (userCheckError || !userCheck) {
      console.error("❌ User not found in database:", {
        userId,
        error: userCheckError,
        errorCode: userCheckError?.code,
        errorMessage: userCheckError?.message,
      });

      // User doesn't exist - token is invalid or stale
      // Client should clear tokens and redirect to login
      return res.status(401).json({
        success: false,
        error: "User not found. Your session has expired. Please log in again.",
        code: "USER_NOT_FOUND",
      });
    }

    console.log("✅ User verified in database:", {
      userId: userCheck.id,
      email: userCheck.email,
      plan: userCheck.plan,
    });

    if (req.method === "GET") {
      // GET /api/resumes - List all resumes
      const { data, error } = await supabase
        .from("resumes")
        .select("*, sections:resume_sections(id, section_type, section_data)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const consolidatedData = data.map((r) => ({
        ...r,
        settings: {
          template_id: r.settings?.template_id || r.template_id || "ats",
          theme_color: r.settings?.theme_color || r.theme_color || "#3b82f6",
          section_order: r.settings?.section_order || [],
          hidden_sections: r.settings?.hidden_sections || [],
          font: r.settings?.font || "inter",
          ...(r.settings || {}),
        },
      }));

      return res.status(200).json({ success: true, data: consolidatedData });
    }

    if (req.method === "POST") {
      // POST /api/resumes - Create new resume
      const { title, job_title, template_id } = req.body;

      if (!title) {
        return res
          .status(400)
          .json({ success: false, error: "Title is required" });
      }

      // Check resume limit based on plan
      // Try user_profiles table first, then fallback to users table
      let userPlan = null;

      const { data: profileData, error: planError } = await supabase
        .from("user_profiles")
        .select("plan")
        .eq("id", userId)
        .single();

      if (planError) {
        console.log("ℹ️ user_profiles not found, checking users table...");

        // Fallback: Check users table instead
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("plan")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("❌ Failed to fetch user plan:", userError);
          throw new Error("Failed to fetch user plan");
        }

        userPlan = userData;
        console.log("✅ Found user plan from users table:", userData?.plan);
      } else {
        userPlan = profileData;
        console.log(
          "✅ Found user plan from user_profiles table:",
          profileData?.plan
        );
      }

      const limits: Record<string, number> = {
        free: 1,
        starter: 3,
        pro: 10,
        pro_plus: 100,
      };
      const limit = limits[userPlan?.plan || "free"] || 1;

      const { count, error: countError } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "draft");

      if (countError) throw countError;

      if (count && count >= limit) {
        return res.status(400).json({
          success: false,
          error: `Resume limit reached. Upgrade your plan to create more resumes.`,
        });
      }

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: userId,
          title,
          job_title,
          template_id,
          status: "draft",
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Failed to create resume:", error);
        throw error;
      }

      console.log("✅ Resume created successfully:", data);
      return res
        .status(201)
        .json({ success: true, data, message: "Resume created successfully" });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Resume API error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
