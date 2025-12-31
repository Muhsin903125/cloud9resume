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
      portfolioViews: number;
      creditsRemaining: number;
      plan: string;
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

    // Exclusively use manual JWT decode for our custom tokens
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded) {
        console.log("[Dashboard API] Failed to decode token manually");
        return null;
      }

      const userId = decoded.sub || decoded.userId;
      console.log("[Dashboard API] Extracted UserID from decode:", userId);
      return userId;
    } catch (err) {
      console.error("[Dashboard API] Decode error:", err);
      return null;
    }
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

    // 1. Fetch Credits & Plan
    let credits = 0;
    let plan = "free";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan_id, credits")
      .eq("id", userId)
      .single();

    if (profile) {
      credits = profile.credits || 0;

      const planMap: { [key: number]: string } = {
        1: "free",
        2: "starter",
        3: "pro",
        4: "pro_plus",
        5: "enterprise",
      };
      plan = planMap[profile.plan_id] || "free";

      console.log("[Dashboard API] Profile loaded:", {
        plan,
        credits,
        planId: profile.plan_id,
      });
    } else {
      console.error(
        "[Dashboard API] Profile fetch error:",
        profileError?.message
      );
      // Don't fallback to users. If profile missing here, something is wrong with migration
      // or user really doesn't exist.
    }

    // 2. Fetch Resumes
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, title, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    // Filter in JS to safely handle NULL statuses which .neq excludes
    const validResumes = (resumes || []).filter(
      (r) => r.status !== "deleted" && r.status !== "archived"
    );

    if (resumesError)
      console.error("[Dashboard API] Resumes fetch error:", resumesError);
    console.log("[Dashboard API] Resumes found (total):", resumes?.length || 0);
    console.log("[Dashboard API] Resumes found (valid):", validResumes.length);

    // 3. Fetch Portfolios
    const { data: portfolios, error: portError } = await supabase
      .from("portfolios")
      .select("id, title, is_active, created_at, updated_at, view_count")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (portError)
      console.error("[Dashboard API] Portfolios fetch error:", portError);
    console.log("[Dashboard API] Portfolios found:", portfolios?.length || 0);

    const fetchedResumes = validResumes || [];
    const fetchedPortfolios = portfolios || [];

    const totalViews = (portfolios as any[] | []).reduce(
      (acc, curr) => acc + (curr.view_count || 0),
      0
    );

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
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          resumesCreated: fetchedResumes.length,
          portfoliosCreated: fetchedPortfolios.length,
          atsScores: 0,
          portfolioViews: totalViews,
          creditsRemaining: credits,
          plan: plan,
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
