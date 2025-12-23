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

    // Check if user exists
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from("users")
      .select("id, email, plan, credits")
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
        console.error("❌ User creation error:", createError);
        return res.status(500).json({
          error: "Failed to create user",
          message: "Could not create account",
        });
      }

      console.log("✅ New user created:", {
        id: newUser.id,
        email: newUser.email,
        plan: newUser.plan,
      });

      user = newUser;
    } else {
      console.log("✅ Existing user found:", {
        id: user.id,
        email: user.email,
        plan: user.plan,
      });
    }

    // Ensure profile exists in 'profiles' table
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        plan: user.plan || "free",
        credits: user.credits || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true }
    ); // Only insert if missing

    if (profileError) {
      console.error("⚠️ Profile sync error:", profileError.message);
    }

    // Generate JWT token
    const accessToken = await generateToken(user.id, user.email, user.plan);

    console.log("✅ JWT token generated for user:", {
      userId: user.id,
      email: user.email,
      tokenLength: accessToken.length,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      expiresIn: 86400,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
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
