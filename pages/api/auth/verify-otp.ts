import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
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
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, error: "OTP is required" });
    }

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

    // Verify OTP
    const { data: verificationData, error: verificationError } =
      await supabaseAdmin
        .from("email_verifications")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (verificationError || !verificationData) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("email_verifications")
      .update({ verified: true })
      .eq("id", verificationData.id);

    // Update Profile
    await supabaseAdmin
      .from("profiles")
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("[Verify OTP] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to verify OTP",
    });
  }
}
