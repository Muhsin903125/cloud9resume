import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { emailSender } from "../../../lib/backend/utils/emailSender";
import crypto from "crypto";

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
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid email format",
      });
    }

    // Check if user exists first
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      // Return 200 for security (don't reveal if email exists)
      console.warn("[ForgotPassword] Email not found:", email);
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    // Generate specific reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Save token to profile
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        reset_token: token,
        reset_token_expires: expiresAt,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(
        "[ForgotPassword] Failed to save reset token:",
        updateError
      );
      // DEBUG: Return actual error to user to verify if DB migration ran
      return res.status(500).json({
        error: "Database Error",
        message:
          "Failed to save reset token. Did you run the migration? " +
          updateError.message,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;
    const directLink = `${appUrl}/reset-password?token=${token}&type=recovery&email=${encodeURIComponent(
      email
    )}`;

    console.log("[ForgotPassword] Sending link to:", email);

    await emailSender
      .sendForgotPasswordEmail(email, directLink)
      .catch((err) => {
        console.error("Failed to send forgot password email:", err);
      });

    return res.status(200).json({
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while processing your request",
    });
  }
}
