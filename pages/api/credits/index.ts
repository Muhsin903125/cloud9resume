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
      isAdmin: boolean;
      onboarding_completed?: boolean;
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

async function extractUserInfo(
  req: NextApiRequest
): Promise<{ userId: string; email: string } | null> {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) return null;

    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      return { userId: data.user.id, email: data.user.email || "" };
    }

    const decoded = jwt.decode(token) as any;
    const userId = decoded?.sub || decoded?.userId || null;
    const email = decoded?.email || "";

    if (userId && email) {
      return { userId, email };
    }
    return null;
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
    const userInfo = await extractUserInfo(req);
    if (!userInfo) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { userId, email } = userInfo;
    console.log(
      `Credits API: Looking up user by email: ${email} (token userId: ${userId})`
    );

    // 1. Get Profile Stats - Try by ID first (more reliable)
    let credits = 0;
    let plan = "free";
    let subscriptionData: any = null;
    let userProfile: any = null;
    let isAdmin = false;

    // Try 'profiles' first BY ID
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, email, credits, plan_id, created_at, updated_at, is_admin, onboarding_completed"
      )
      .eq("id", userId)
      .single();

    // Fallback to email if ID lookup failed (legacy support)
    if (!profile) {
      console.log(
        `Credits API: Profile not found by ID ${userId}, trying email ${email}...`
      );
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select(
          "id, email, credits, plan_id, created_at, updated_at, is_admin, onboarding_completed"
        )
        .eq("email", email)
        .single();
      profile = profileByEmail;
    }

    if (profile) {
      credits = profile.credits || 0;
      // Map plan_id to string, default to free
      const planId = profile.plan_id || 0;
      if (planId === 1) plan = "free";
      else if (planId === 2) plan = "starter";
      else if (planId === 3) plan = "pro";
      else if (planId === 4) plan = "pro_plus";
      else if (planId === 5) plan = "enterprise";
      else plan = "free";

      isAdmin = profile.is_admin || false;
      console.log(
        `✅ Credits API: Profile found. ID: ${profile.id}, Admin: ${isAdmin}, Plan: ${plan}, Credits: ${credits}, Onboarding: ${profile.onboarding_completed}`
      );

      subscriptionData = {
        plan: plan,
        status: plan !== "free" ? "active" : "inactive",
        startedAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    } else {
      console.log(
        `❌ Credits API: No user/profile found for ${email} (Checked profiles table only migration complete)`
      );
    }

    // 2. Get History from BOTH tables
    const profileId = profile?.id || null;
    let history: any[] = [];

    if (profileId) {
      // Fetch Manual Credits / Upgrades
      const { data: creditUsage, error: creditError } = await supabase
        .from("credit_usage")
        .select("credits_used, action, description, created_at, id")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false })
        .limit(50);

      // Fetch AI Usage Logs
      const { data: aiLogs, error: aiError } = await supabase
        .from("ai_usage_logs")
        .select("credits_used, action_type, details, created_at, id")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false })
        .limit(50);

      console.log(`DEBUG: Credit Usage Rows: ${creditUsage?.length || 0}`);
      console.log(`DEBUG: AI Logs Rows: ${aiLogs?.length || 0}`);

      if (creditError || aiError) {
        console.error("History fetch error:", creditError || aiError);
      }

      // Merge and Format
      const formattedCreditUsage = (creditUsage || []).map((item: any) => ({
        ...item,
        type: "ledger",
      }));

      const formattedAiLogs = (aiLogs || []).map((item: any) => ({
        id: item.id,
        user_id: profileId,
        credits_used: item.credits_used, // Positive = Deduction
        action: item.action_type,
        description: item.details?.filename
          ? `Parsed ${item.details.filename}`
          : item.action_type === "ats_analysis"
          ? "ATS Job Analysis"
          : item.action_type,
        created_at: item.created_at,
        type: "ai",
      }));

      history = [...formattedCreditUsage, ...formattedAiLogs]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 50);
    }

    // Calculate "Used This Month"
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
          isAdmin: isAdmin, // Return it here
          onboarding_completed:
            (profile || userProfile)?.onboarding_completed ?? false,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
            .toISOString()
            .split("T")[0],
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
