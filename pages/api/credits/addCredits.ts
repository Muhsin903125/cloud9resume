import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { emailSender } from "../../../lib/backend/utils/emailSender";
import { getPlanName } from "../../../lib/subscription";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper to get token from header
function getTokenFromHeader(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

interface TokenUser {
  id: string | null;
  email: string | null;
}

function extractUserFromToken(token: string): TokenUser {
  try {
    const decoded = jwt.decode(token) as any;
    // Check both standard sub and custom userId fields
    return {
      id: decoded?.sub || decoded?.userId || null,
      email: decoded?.email || null,
    };
  } catch (error) {
    return { id: null, email: null };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { creditsToAdd, planId, paymentIntentId, couponCode } = req.body;

    // Validate input
    if (!creditsToAdd || !planId) {
      return res.status(400).json({
        error: "Validation failed",
        message: "creditsToAdd and planId are required",
      });
    }

    if (typeof creditsToAdd !== "number" || creditsToAdd <= 0) {
      return res.status(400).json({
        error: "Validation failed",
        message: "creditsToAdd must be a positive number",
      });
    }

    // 1. Extract Token
    const token = getTokenFromHeader(req);
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Missing auth token" });
    }

    // Verify token and get user
    let userId: string | null = null;
    let userEmail: string | null = null;

    // Try Supabase auth first
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (user && !authError) {
      userId = user.id;
      userEmail = user.email || null;
    } else {
      // Fallback to manual JWT extraction
      const extracted = extractUserFromToken(token);
      userId = extracted.id;
      userEmail = extracted.email;
    }

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    // 3. Get / Create Profile
    let profile: any = null;
    let targetTable = "profiles";

    try {
      // Check 'profiles' table first
      const { data: pData, error: pError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (pData) {
        profile = pData;
      } else {
        // Try to create in profiles
        const insertData: any = {
          id: userId,
          plan_id: 1, // Free plan
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (userEmail) insertData.email = userEmail;

        const { data: newProfile, error: createError } = await supabaseAdmin
          .from("profiles")
          .insert(insertData)
          .select()
          .single();

        if (!createError && newProfile) {
          profile = newProfile;
        } else {
          console.error("Profiles table insert failed", createError?.message);
          throw new Error("Could not create user profile");
        }
      }
    } catch (err) {
      console.error("Profile access error:", err);
      return res.status(500).json({
        error: "Profile error",
        message: "Could not access user profile",
      });
    }

    if (!profile) {
      return res.status(404).json({
        error: "User not found",
        message: "Could not find or create user profile",
      });
    }

    // Handle Coupon Usage (if provided)
    let couponDescription = "";
    if (couponCode) {
      try {
        const { data: coupon, error: couponError } = await supabaseAdmin
          .from("coupons")
          .select("*")
          .eq("code", couponCode.toUpperCase())
          .single();

        if (coupon && !couponError && coupon.is_active) {
          // Check limits again to be safe
          if (!coupon.max_uses || coupon.current_uses < coupon.max_uses) {
            // 1. Increment usage
            await supabaseAdmin
              .from("coupons")
              .update({
                current_uses: coupon.current_uses + 1,
              })
              .eq("id", coupon.id);

            // 2. Log usage
            await supabaseAdmin.from("coupon_logs").insert({
              coupon_id: coupon.id,
              user_id: userId,
              plan_id: planId,
              discount_applied: coupon.discount_value,
            });

            couponDescription = ` (Coupon: ${couponCode})`;
          }
        }
      } catch (err) {
        console.error("Error applying coupon in addCredits:", err);
        // Don't fail the transaction, just log error
      }
    }

    // Add credits AND update plan
    const newCredits = (profile.credits || 0) + creditsToAdd;

    // Map string planId to integer just in case, though API expects string usually?
    // Wait, the API body receives 'planId'. Let's assume it's the plan STRING from frontend (e.g. 'starter').
    // We need to map it to integer if it's a string.
    // The previous code used it as `plan: planId`.
    // And `plan_upgrade_${planId}`.
    // Let's assume input 'planId' is a string like 'starter' or 'pro'.

    const planMapReverse: { [key: string]: number } = {
      free: 1,
      starter: 2,
      pro: 3,
      pro_plus: 4,
      "pro+": 4,
      enterprise: 5,
    };

    // If planId is number coming in, keep it. If string, map it.
    let numericPlanId = 1;
    if (typeof planId === "number") {
      numericPlanId = planId;
    } else if (typeof planId === "string") {
      numericPlanId = planMapReverse[planId] || 1;
    }

    const { error: updateError } = await supabaseAdmin
      .from(targetTable)
      .update({
        credits: newCredits,
        plan_id: numericPlanId, // Update the plan_id field
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Update credits error:", updateError);
      return res.status(500).json({
        error: "Failed to update credits",
        message: "Could not add credits to account",
      });
    }

    // Record credit addition in credit_usage table
    const { error: recordError } = await supabaseAdmin
      .from("credit_usage")
      .insert({
        user_id: userId,
        action: `plan_upgrade_${planId}`,
        credits_used: -creditsToAdd, // Negative to indicate credits added
        description: `Upgraded to ${getPlanName(
          planId as any
        )} Plan${couponDescription}`,
        created_at: new Date().toISOString(),
      });

    if (recordError) {
      console.error("Record usage error:", recordError);
      // Don't fail if we can't record usage, but log it
    }

    // Send Plan Upgrade Email (Non-blocking)
    if (userEmail && profile.name) {
      const planName = getPlanName(planId as any);
      emailSender
        .sendPlanUpgradeEmail(userEmail, profile.name, planName, creditsToAdd)
        .catch((err) => {
          console.error("Failed to send plan upgrade email:", err);
        });
    }

    return res.status(200).json({
      success: true,
      message: `${creditsToAdd} credits added successfully`,
      creditsRemaining: newCredits,
      creditsAdded: creditsToAdd,
      planId: planId,
      paymentIntentId: paymentIntentId || null,
    });
  } catch (error) {
    console.error("Add credits error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to add credits",
    });
  }
}
