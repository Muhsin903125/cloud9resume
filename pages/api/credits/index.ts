import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreditsResponse {
  success: boolean;
  data?: {
    stats: {
      current: number;
      used: number;
      plan: string;
      resetDate: string;
    };
    subscription: {
      plan: string;
      status: string;
      startedAt: string | null;
      updatedAt: string | null;
    } | null;
    history: any[];
  };
  error?: string;
}

async function extractUserId(req: NextApiRequest): Promise<string | null> {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) return null;

    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) return data.user.id;

    const decoded = jwt.decode(token) as any;
    return decoded?.sub || decoded?.userId || null;
  } catch (e) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreditsResponse>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const userId = await extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1. Get Profile Stats
    let credits = 0;
    let plan = "free";
    let subscriptionData: any = null;

    // Try 'profiles' first
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, plan, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (profile) {
      credits = profile.credits || 0;
      plan = profile.plan || "free";
      subscriptionData = {
        plan: plan,
        status: plan !== "free" ? "active" : "inactive",
        startedAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    } else {
      // Fallback: Check 'users' table
      const { data: userProfile } = await supabase
        .from("users")
        .select("credits, plan, created_at, updated_at")
        .eq("id", userId)
        .single();

      if (userProfile) {
        credits = userProfile.credits || 0;
        plan = userProfile.plan || "free";
        subscriptionData = {
          plan: plan,
          status: plan !== "free" ? "active" : "inactive",
          startedAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        };
      }
    }

    // 2. Get History
    const { data: history, error: historyError } = await supabase
      .from("credit_usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to last 50 transactions

    if (historyError) {
      console.error("History fetch error:", historyError);
    }

    // Calculate "Used This Month"
    // Filter history for current month where credits_used > 0
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const usedThisMonth = (history || [])
      .filter((h: any) => h.created_at >= startOfMonth && h.credits_used > 0)
      .reduce((sum: number, h: any) => sum + h.credits_used, 0);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          current: credits,
          used: usedThisMonth,
          plan: plan,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
            .toISOString()
            .split("T")[0], // Next month 1st
        },
        subscription: subscriptionData,
        history: history || [],
      },
    });
  } catch (error: any) {
    console.error("Credits API Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
