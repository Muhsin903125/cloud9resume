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
    const { creditsToAdd, planId, paymentIntentId } = req.body;

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
          plan: "free",
          credits: 0,
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
          console.warn(
            "Profiles table insert failed, trying fallback...",
            createError?.message
          );
          throw new Error("Profiles table unavailable");
        }
      }
    } catch (err) {
      console.log("Falling back to 'users' table due to profiles error");
      // Fallback: Check 'users' table
      targetTable = "users";

      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userData) {
        profile = userData;
      } else {
        // Create in users
        const insertData: any = {
          id: userId, // Some users tables rely on auth trigger, but we can try insert
          plan: "free",
          credits: 0,
          email: userEmail,
        };
        const { data: newUser, error: createUserError } = await supabaseAdmin
          .from("users")
          .insert(insertData)
          .select()
          .single();

        if (createUserError || !newUser) {
          console.error(
            "Failed to create user in users table:",
            createUserError
          );
          return res.status(500).json({
            error: "Profile creation failed",
            details: createUserError,
            message: "Could not find or create user profile in any table",
          });
        }
        profile = newUser;
      }
    }

    if (!profile) {
      return res.status(404).json({
        error: "User not found",
        message: "Could not find or create user profile",
      });
    }

    // Add credits AND update plan
    const newCredits = (profile.credits || 0) + creditsToAdd;
    const { error: updateError } = await supabaseAdmin
      .from(targetTable)
      .update({
        credits: newCredits,
        plan: planId, // Update the plan field
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
