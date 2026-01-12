import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "../../../lib/backend/utils/tokenService";
import bcrypt from "bcryptjs";
import { emailSender } from "../../../lib/backend/utils/emailSender";
import { WELCOME_BONUS } from "../../../lib/subscription";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, name, acceptTerms } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email, password, and name are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Password must be at least 8 characters",
      });
    }

    if (!acceptTerms) {
      return res.status(400).json({
        error: "Validation failed",
        message: "You must accept the terms and conditions",
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: "User already exists",
        message: "This email is already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create profile in 'profiles' table
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          email,
          name,
          password_hash: passwordHash,
          login_provider: "email",
          plan_id: 1, // Free plan
          credits: WELCOME_BONUS, // Default Free Plan Credits
          onboarding_completed: false,
        },
      ])
      .select("id, email, plan_id, credits")
      .single();

    if (createError || !newProfile) {
      console.error("Signup error:", createError);
      return res.status(500).json({
        error: "Signup failed",
        message: "Could not create user profile",
      });
    }

    // Log the initial credit allocation
    await supabaseAdmin.from("credit_usage").insert({
      user_id: newProfile.id,
      credits_used: -WELCOME_BONUS, // Negative for addition
      action: "welcome_bonus",
      description: "Welcome Bonus Credits",
    });

    // Generate JWT token
    const accessToken = await generateToken(
      newProfile.id,
      newProfile.email,
      "free" // Default plan
    );

    // Send Registration Email (Non-blocking)
    try {
      emailSender
        .sendRegistrationEmail(newProfile.email, name, "free", WELCOME_BONUS)
        .catch((err) => console.error("Failed to send signup email:", err));
    } catch (e) {
      console.error("Signup email error:", e);
    }

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
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Signup failed",
    });
  }
}
