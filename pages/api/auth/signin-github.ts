import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "../../../lib/backend/utils/tokenService";
import {
  logUserLogin,
  getClientIP,
  getUserAgent,
} from "../../../lib/backend/utils/loginHistory";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET!;
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
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code,
          redirect_uri: `${appUrl}/api/auth/callback/github`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("No access token received from GitHub");
    }

    // Get user profile
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch GitHub profile");
    }

    const profileData = await profileResponse.json();

    // Get user email (primary email)
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to fetch GitHub emails");
    }

    const emailsData = await emailResponse.json();
    const primaryEmail =
      emailsData.find((e: any) => e.primary)?.email || emailsData[0]?.email;

    if (!primaryEmail) {
      return res.status(400).json({
        error: "Email not accessible",
        message:
          "Could not retrieve email from GitHub profile. Please make your email public on GitHub.",
      });
    }

    const name = profileData.name || profileData.login;

    // Check if user exists in profiles
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id, email, plan_id, credits")
      .eq("email", primaryEmail)
      .single();

    let profile = existingUser;

    // Create profile if doesn't exist
    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            email: primaryEmail,
            name,
            login_provider: "github",
            plan_id: 1, // Free plan
            credits: 10,
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
          message: "Could not create account profile",
        });
      }

      // Log the initial credit allocation
      await supabaseAdmin.from("credit_usage").insert({
        user_id: newProfile.id,
        credits_used: -10, // Negative for addition
        action: "welcome_bonus",
        description: "Welcome Bonus Credits",
      });

      profile = newProfile;
    }

    // Map plan_id to string
    const planMap: { [key: number]: string } = {
      1: "free",
      2: "starter",
      3: "pro",
      4: "pro_plus",
      5: "enterprise",
    };
    const userPlan = planMap[profile.plan_id] || "free";

    // Generate JWT token
    const accessTokenJwt = await generateToken(
      profile.id,
      profile.email,
      userPlan
    );

    // Log successful login
    logUserLogin({
      userId: profile.id,
      loginMethod: "github",
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      success: true,
    });

    return res.status(200).json({
      success: true,
      accessToken: accessTokenJwt,
      expiresIn: 86400,
      user: {
        id: profile.id,
        email: profile.email,
        plan: userPlan,
        credits: profile.credits,
      },
    });
  } catch (error) {
    console.error("GitHub signin error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "GitHub login failed",
    });
  }
}
