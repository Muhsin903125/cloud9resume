import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { emailSender } from "../../../lib/backend/utils/emailSender";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client with service role for admin operations
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

    // Send password reset email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;

    // Generate a reset token/link (using Supabase's built-in reset link generation)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: { redirectTo: `${appUrl}/reset-password` },
    });

    if (error) {
      console.error("Password reset link generation error:", error);
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    if (data?.properties?.action_link) {
      await emailSender
        .sendForgotPasswordEmail(email, data.properties.action_link)
        .catch((err) => {
          console.error("Failed to send forgot password email:", err);
        });
    }

    return res.status(200).json({
      message:
        "Password reset email sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Password reset failed",
    });
  }
}
