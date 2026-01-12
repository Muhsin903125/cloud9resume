import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "../../../lib/backend/utils/tokenService";
import { WELCOME_BONUS } from "../../../lib/subscription";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const linkedinClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!;
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Missing authorization code",
        message: "Authorization code is required",
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: linkedinClientId || "",
          client_secret: linkedinClientSecret || "",
          redirect_uri: `${appUrl}/api/auth/callback/linkedin`,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("LinkedIn token exchange error:", errorData);
      return res.status(400).json({
        error: "Token exchange failed",
        message: "Failed to exchange authorization code for access token",
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).json({
        error: "No access token",
        message: "Failed to obtain access token from LinkedIn",
      });
    }

    // Get user profile using OpenID Connect /v2/userinfo endpoint
    const userInfoResponse = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      console.error("LinkedIn userinfo error:", errorData);
      return res.status(400).json({
        error: "Failed to fetch user info",
        message: "Could not retrieve LinkedIn profile information",
      });
    }

    const userInfo = await userInfoResponse.json();

    // Extract user data from OpenID Connect response
    const email = userInfo.email;
    const name =
      userInfo.name ||
      `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim();

    if (!email) {
      return res.status(400).json({
        error: "Email not accessible",
        message: "Could not retrieve email from LinkedIn profile",
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (existingUser) {
      // User already exists
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
          login_provider: "linkedin",
          plan_id: 1, // Free plan
          credits: WELCOME_BONUS,
          onboarding_completed: false,
          email_verified: true,
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

    // Log the initial credit allocation
    await supabaseAdmin.from("credit_usage").insert({
      user_id: newProfile.id,
      credits_used: -WELCOME_BONUS, // Negative for addition
      action: "welcome_bonus",
      description: "Welcome Bonus Credits",
    });

    // Send Registration Email (Non-blocking)
    try {
      const { emailSender } = await import(
        "../../../lib/backend/utils/emailSender"
      );
      emailSender
        .sendRegistrationEmail(newProfile.email, name, "free", WELCOME_BONUS)
        .catch((err) => console.error("Failed to send signup email:", err));
    } catch (e) {
      console.error("Signup email error:", e);
    }

    // Generate JWT token
    const accessTokenJwt = await generateToken(
      newProfile.id,
      newProfile.email,
      "free"
    );

    return res.status(201).json({
      success: true,
      accessToken: accessTokenJwt,
      expiresIn: 86400,
      user: {
        id: newProfile.id,
        email: newProfile.email,
        plan: "free",
        credits: newProfile.credits,
      },
    });
  } catch (error) {
    console.error("LinkedIn signup error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "LinkedIn signup failed",
    });
  }
}
