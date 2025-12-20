import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DashboardResponse {
  success: boolean;
  data?: {
    stats: {
      resumesCreated: number;
      portfoliosCreated: number;
      atsScores: number;
      templatesUsed: number;
      creditsRemaining: number;
    };
    recentActivities: any[];
  };
  error?: string;
}

async function extractUserIdFromToken(
  req: NextApiRequest
): Promise<string | null> {
  try {
    let token = "";
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.query.access_token) {
      token = req.query.access_token as string;
    }

    console.log("[Dashboard API] Token found:", !!token);

    if (!token || token === "null" || token === "undefined") {
      return null;
    }

    // Attempt Supabase verification first
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      console.log("[Dashboard API] User verified via Supabase:", data.user.id);
      return data.user.id;
    }

    // Manual fallback
    const decoded = jwt.decode(token) as any;
    if (!decoded) {
      console.log("[Dashboard API] Failed to decode token manually");
      return null;
    }

    const userId = decoded.sub || decoded.userId;
    console.log("[Dashboard API] Extracted UserID from decode:", userId);
    return userId;
  } catch (error) {
    console.error("[Dashboard API] Token extraction error:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardResponse>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const userId = await extractUserIdFromToken(req);
    console.log("[Dashboard API] Final userId used for queries:", userId);

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1. Fetch Credits - Try user_profiles first, then fallback to profiles
    let credits = 0;
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();

    if (profileData) {
      credits = profileData.credits || 0;
      console.log("[Dashboard API] Credits from user_profiles:", credits);
    } else {
      const { data: altProfile, error: altError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .maybeSingle();

      if (altProfile) {
        credits = altProfile.credits || 0;
        console.log("[Dashboard API] Credits from profiles fallback:", credits);
      }
    }

    // 2. Fetch Resumes
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, title, status, ats_score, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (resumesError)
      console.error("[Dashboard API] Resumes fetch error:", resumesError);
    console.log("[Dashboard API] Resumes found:", resumes?.length || 0);

    // 3. Fetch Portfolios
    const { data: portfolios, error: portError } = await supabase
      .from("portfolios")
      .select("id, title, is_active, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (portError)
      console.error("[Dashboard API] Portfolios fetch error:", portError);
    console.log("[Dashboard API] Portfolios found:", portfolios?.length || 0);

    const fetchedResumes = resumes || [];
    const fetchedPortfolios = portfolios || [];

    // Combine Activities
    const activities = [
      ...fetchedResumes.map((r: any) => ({
        id: `r-${r.id}`,
        type: "resume",
        title: r.title,
        action: "Updated",
        timestamp: r.updated_at || r.created_at,
      })),
      ...fetchedPortfolios.map((p: any) => ({
        id: `p-${p.id}`,
        type: "portfolio",
        title: p.title,
        action: p.updated_at ? "Updated" : "Created",
        timestamp: p.updated_at || p.created_at,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          resumesCreated: fetchedResumes.length,
          portfoliosCreated: fetchedPortfolios.length,
          atsScores: fetchedResumes.filter((r: any) => (r.ats_score || 0) > 0)
            .length,
          templatesUsed: 8,
          creditsRemaining: credits,
        },
        recentActivities: activities,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
