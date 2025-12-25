import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { emailSender } from "../../../lib/backend/utils/emailSender";

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

    // Send password reset email
    // Use production URL for production, localhost for development
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;

    // Generate a reset token/link (using Supabase's built-in reset link generation)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: { redirectTo: `${appUrl}/reset-password` },
    });

    if (error) {
      console.error("Password reset link generation error:", error);
      // Still return 200 for security
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    // CUSTOM FLOW: Construct a direct link using the OTP token
    // This bypasses Supabase's email template but we still use their token
    // We will assume the token in action_link is the OTP
    // action_link format: https://.../verify?token=...&type=recovery&redirect_to=...
    // We want: https://myapp.com/reset-password?token=...&type=recovery

    // Extract token from action_link
    const actionLinkUrl = new URL(data.properties.action_link);
    const recoveryToken = actionLinkUrl.searchParams.get("token");

    if (recoveryToken) {
      // Construct our DIRECT link
      const directLink = `${appUrl}/reset-password?token=${recoveryToken}&type=recovery&email=${encodeURIComponent(
        email
      )}`;

      await emailSender
        .sendForgotPasswordEmail(email, directLink)
        .catch((err) => {
          console.error("Failed to send forgot password email:", err);
        });
    }

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
