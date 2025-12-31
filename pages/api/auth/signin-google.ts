import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { generateToken } from "../../../lib/backend/utils/tokenService";
import {
  logUserLogin,
  getClientIP,
  getUserAgent,
} from "../../../lib/backend/utils/loginHistory";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Google OAuth2
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const oauth2Client = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  `${appUrl}/api/auth/callback/google`
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Missing ID token",
        message: "ID token is required",
      });
    }

    // Verify the ID token with Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({
        error: "Invalid token",
        message: "Could not verify Google token",
      });
    }

    const email = payload.email;
    const name = payload.name || "User";

    // Check if user exists in profiles
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, plan_id, credits")
      .eq("email", email)
      .single();

    console.log("🔍 Google signin - User lookup:", {
      email,
      found: !!existingUser,
      searchError: searchError?.message,
    });

    let user = existingUser;

    // Create user if doesn't exist
    if (!user) {
      console.log("📝 Creating new user for email:", email);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            email,
            name,
            login_provider: "google",
            plan_id: 1, // Free plan
            credits: 10,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id, email, plan_id, credits")
        .single();

      if (createError || !newUser) {
        console.error("❌ User creation error (profiles):", createError);
        return res.status(500).json({
          error: "Failed to create user profile",
          message: "Could not create account profile",
          details: createError,
        });
      }

      // Log the initial credit allocation
      await supabaseAdmin.from("credit_usage").insert({
        user_id: newUser.id,
        credits_used: -10, // Negative for addition
        action: "welcome_bonus",
        description: "Welcome Bonus Credits",
      });

      // Send Welcome Email (Non-blocking)
      try {
        const {
          emailSender,
        } = require("../../../lib/backend/utils/emailSender");
        emailSender.sendWelcomeEmail(email, name).catch((err: any) => {
          console.error("Failed to send welcome email:", err);
        });
      } catch (e) {
        console.error("Failed to load emailSender:", e);
      }

      console.log("✅ New user created in profiles:", {
        id: newUser.id,
        email: newUser.email,
        plan_id: newUser.plan_id,
      });

      user = newUser;
    } else {
      console.log("✅ Existing user found:", {
        id: user.id,
        email: user.email,
        plan_id: user.plan_id,
      });
    }

    // Map plan_id to string
    const planMap: { [key: number]: string } = {
      1: "free",
      2: "starter",
      3: "pro",
      4: "pro_plus",
      5: "enterprise",
    };
    const userPlan = planMap[user.plan_id] || "free";

    // Generate JWT token
    const accessToken = await generateToken(user.id, user.email, userPlan);

    console.log("✅ JWT token generated for user:", {
      userId: user.id,
      email: user.email,
      tokenLength: accessToken.length,
    });

    // Log successful login
    logUserLogin({
      userId: user.id,
      loginMethod: "google",
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      success: true,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      expiresIn: 86400,
      user: {
        id: user.id,
        email: user.email,
        plan: userPlan,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("Google signin error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Google login failed",
    });
  }
}
