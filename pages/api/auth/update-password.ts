import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for password updates
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

    // Create a client for auth operations
    const anonClient = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    let session = null;
    let authError = null;

    // SCENARIO 1: We have an email, try verifying as an OTP (Recovery Token)
    // This is the new custom flow
    if (email) {
      const { data, error } = await anonClient.auth.verifyOtp({
        token,
        type: "recovery",
        email,
      });

      if (error) {
        console.log(
          "OTP verification failed, trying setSession fallback...",
          error.message
        );
      } else if (data.session) {
        session = data.session;
      }
    }

    // SCENARIO 2: No email or OTP failed, try using token as access_token (Legacy/Hash flow)
    if (!session) {
      const { data, error } = await anonClient.auth.setSession({
        access_token: token,
        refresh_token: "", // Not needed for setSession usually if we just want to use the access_token?
        // Actually setSession requires both or just access_token?
        // Supabase docs: setSession({ access_token, refresh_token })
      });

      if (error) {
        authError = error;
      } else {
        session = data.session;
      }
    }

    if (!session) {
      return res.status(400).json({
        error: "Invalid or expired token",
        message:
          "The password reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Now update the password with the recovered session
    const { error: updateError } = await anonClient.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(400).json({
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
