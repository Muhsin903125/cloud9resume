import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import {
  generateToken,
  getUserById,
} from "../../../lib/backend/utils/tokenService";
import bcrypt from "bcryptjs";
import {
  logUserLogin,
  getClientIP,
  getUserAgent,
} from "../../../lib/backend/utils/loginHistory";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.JWT_SECRET;

// Client for database access (Admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email and password are required",
      });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        error: "Server error",
        message: "JWT_SECRET not configured",
      });
    }

    // Fetch user from 'profiles' table
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, email, password_hash, plan_id, credits")
      .ilike("email", email) // Case-insensitive match
      .single();

    console.log(`[Signin] Attempting login for: ${email}`);

    if (userError || !user) {
      console.warn(
        "[Signin] User not found in profiles (or not email provider):",
        userError
      );
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password (User lookup failed)",
      });
    }

    console.log(`[Signin] User found: ${user.id}`);

    // Verify password hash
    if (!user.password_hash) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "This account uses social login, not email/password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password",
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

    // Generate JWT token with user plan info
    const accessToken = await generateToken(user.id, user.email, userPlan);

    // Log successful login
    logUserLogin({
      userId: user.id,
      loginMethod: "email",
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      success: true,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: user.id,
        email: user.email,
        plan: userPlan,
        credits: user.credits,
      },
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("Signin error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Login failed: " + (error.message || String(error)),
    });
  }
}
