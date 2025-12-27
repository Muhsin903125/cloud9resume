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
        `⚠️ Credits API: Profile not found for ${email}, checking users table...`
      );
      // Fallback: Check 'users' table BY EMAIL (Legacy)
      const { data: foundUser } = await supabase
        .from("users")
        .select("id, email, credits, plan_id, created_at, updated_at, is_admin")
        .eq("email", email)
        .single();

      userProfile = foundUser;

      if (userProfile) {
        credits = userProfile.credits || 0;
        // Map plan_id to string, default to free
        const planId = userProfile.plan_id || 0;
        if (planId === 1) plan = "free";
        else if (planId === 2) plan = "starter";
        else if (planId === 3) plan = "pro";
        else if (planId === 4) plan = "pro_plus";
        else if (planId === 5) plan = "enterprise";
        else plan = "free";

        isAdmin = userProfile.is_admin || false;
        console.log(
          `✅ Credits API: User found by email ${email}. UserID: ${userProfile.id}, Admin: ${isAdmin}, Plan: ${plan}, Credits: ${credits}`
        );

        subscriptionData = {
          plan: plan,
          status: plan !== "free" ? "active" : "inactive",
          startedAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        };
      } else {
        console.log(`❌ Credits API: No user/profile found for ${email}`);
      }
    }

    // 2. Get History - use the actual profile ID from the database, not the token userId
    const profileId = profile?.id || null;
    const { data: history, error: historyError } = profileId
      ? await supabase
          .from("credit_usage")
          .select("*")
          .eq("user_id", profileId) // Use profile ID from DB
          .order("created_at", { ascending: false })
          .limit(50)
      : { data: null, error: null };

    if (historyError) {
      console.error("History fetch error:", historyError);
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
