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
      .from("users")
      .select("id, email, plan, credits")
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

    // Create user if doesn't exist
    const { data: newUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email,
          name,
          login_provider: "google",
          plan: "free",
          credits: 0,
        },
      ])
      .select("id, email, plan, credits")
      .single();

    if (createError || !newUser) {
      console.error("User creation error:", createError);
      return res.status(500).json({
        error: "Failed to create user",
        message: "Could not create account",
      });
    }

    // Create profile in 'profiles' table
    await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: newUser.id,
          email: newUser.email,
          plan: "free",
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .then(({ error }) => {
        if (error) console.error("⚠️ Profile creation error:", error.message);
      });

    // Generate JWT token
    const accessToken = await generateToken(
      newUser.id,
      newUser.email,
      newUser.plan
    );

    return res.status(201).json({
      success: true,
      accessToken,
      expiresIn: 86400,
      user: {
        id: newUser.id,
        email: newUser.email,
        plan: newUser.plan,
        credits: newUser.credits,
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
