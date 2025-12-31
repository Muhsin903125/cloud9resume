import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client to check if user exists
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

    // Check if user already exists in profiles
    const { data: existingUser, error: queryError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 is "Row not found"
      console.error("Error checking profiles:", queryError);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to validate email",
      });
    }

    const userExists = !!existingUser;

    return res.status(200).json({
      exists: userExists || false,
      email: email,
    });
  } catch (error) {
    console.error("Validate email error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to validate email",
    });
  }
}
