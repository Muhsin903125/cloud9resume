import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { generateToken } from "../../../lib/backend/utils/tokenService";

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

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, plan_id, credits")
      .eq("email", email)
      .single();

    if (existingUser) {
      // User already exists, return 409 Conflict
      return res.status(409).json({
        error: "User already exists",
        message:
          "An account with this email already exists. Please sign in instead.",
      });
    }

    // Create profile in 'profiles' table
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          email,
          name,
          login_provider: "google",
          plan_id: 1, // Free plan
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id, email, plan_id, credits")
      .single();

    if (createError || !newProfile) {
      console.error("User creation error:", createError);
      return res.status(500).json({
        error: "Failed to create user",
        message: "Could not create account",
      });
    }

    // Send Welcome Email (Non-blocking)
    // Need to import emailSender first
    const { emailSender } = require("../../../lib/backend/utils/emailSender");
    emailSender.sendWelcomeEmail(email, name).catch((err: any) => {
      console.error("Failed to send welcome email:", err);
    });

    // Generate JWT token
    const accessToken = await generateToken(
      newProfile.id,
      newProfile.email,
      "free" // Default plan
    );

    return res.status(201).json({
      success: true,
      accessToken,
      expiresIn: 86400,
      user: {
        id: newProfile.id,
        email: newProfile.email,
        plan: "free",
        credits: newProfile.credits,
      },
    });
  } catch (error) {
    console.error("Google signup error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Google signup failed",
    });
  }
}
