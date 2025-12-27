import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "../../../lib/backend/utils/tokenService";
import bcrypt from "bcryptjs";
import { emailSender } from "../../../lib/backend/utils/emailSender";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { data: existingUser } = await supabase
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
    // We generate a UUID manually since we aren't using Supabase Auth's auto-generation or another table
    // However, profiles usually rely on an ID. If 'id' is a uuid primary key, we can let Postgres generate it
    // OR if it was foreign key to 'users', we need to be careful.
    // Assuming 'profiles.id' is a UUID PK or we can generate one.
    // Let's use 'crypto.randomUUID()' or let DB handle it if possible.
    // Looking at previous code: newUser.id was from 'users' table insert.
    // We should probably rely on Supabase returning the generated ID.

    // NOTE: 'users' table usually handles ID generation. If we're swapping to 'profiles', ensure 'profiles.id' is default uuid_generate_v4()

    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          email,
          name,
          password_hash: passwordHash,
          login_provider: "email",
          plan_id: 1, // Free plan
          credits: 0,
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

    // Send Welcome Email (Non-blocking)
    emailSender.sendWelcomeEmail(email, name).catch((err) => {
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
