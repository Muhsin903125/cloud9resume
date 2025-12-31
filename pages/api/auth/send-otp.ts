import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { emailSender } from "../../../lib/backend/utils/emailSender";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    return decoded?.sub || decoded?.userId || null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    // Authenticate user
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Get user email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res
        .status(404)
        .json({ success: false, error: "User profile not found" });
    }

    const email = profile.email;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store in DB
    const { error: insertError } = await supabaseAdmin
      .from("email_verifications")
      .insert({
        email,
        otp,
        expires_at: expiresAt,
        verified: false,
      });

    if (insertError) {
      console.error("[Send OTP] DB Insert Error:", insertError);
      throw new Error("Failed to generate OTP");
    }

    // Send Email
    await emailSender.sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to " + email,
    });
  } catch (error: any) {
    console.error("[Send OTP] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send OTP",
    });
  }
}
