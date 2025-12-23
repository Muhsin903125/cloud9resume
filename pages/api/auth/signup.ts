import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "../../../lib/backend/utils/tokenService";
import bcrypt from "bcryptjs";

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
      .from("users")
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

    // Create user in 'users' table
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email,
          name,
          password_hash: passwordHash,
          login_provider: "email",
          plan: "free", // Default plan
          credits: 0, // Free users get 0 credits initially
        },
      ])
      .select("id, email, plan, credits")
      .single();

    if (createError || !newUser) {
      console.error("User creation error:", createError);
      return res.status(500).json({
        error: "Signup failed",
        message: "Could not create user account",
      });
    }

    // Create profile in 'profiles' table
    await supabase
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
