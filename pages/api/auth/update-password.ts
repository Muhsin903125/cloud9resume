import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

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
    const { token, password, email } = req.body;

    // Basic validation
    if (!token || !password) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Password must be at least 8 characters long",
      });
    }

    let userToUpdate = null;

    if (email) {
      // Verify via custom reset_token in profiles
      const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("id, reset_token, reset_token_expires")
        .eq("email", email)
        .limit(1); // Ensure we get list

      const user = profiles?.[0];

      if (error || !user) {
        console.error("[UpdatePassword] User not found or error:", error);
        console.log(`[UpdatePassword] Searched for email: '${email}'`);
        // Fallback or error
      } else {
        // Evaluate token
        const expiresAt = new Date(user.reset_token_expires).getTime();
        const now = Date.now();

        console.log("[UpdatePassword] Debug:", {
          incomingToken: token,
          storedToken: user.reset_token,
          match: user.reset_token === token,
          now,
          expiresAt,
          isExpired: now >= expiresAt,
        });

        if (user.reset_token === token && now < expiresAt) {
          userToUpdate = user;
        } else {
          console.warn("[UpdatePassword] Token mismatch or expired.");
        }
      }
    }

    if (!userToUpdate) {
      // Try legacy Supabase OTP verification if email provided?
      // Or just fail. Given we moved to custom auth, fail.
      return res.status(400).json({
        error: "Invalid or expired token",
        message:
          "The password reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update password and clear token
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userToUpdate.id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(500).json({
        error: "Password update failed",
        message: "Failed to update password. Please try again.",
      });
    }

    return res.status(200).json({
      message:
        "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while resetting your password",
    });
  }
}
