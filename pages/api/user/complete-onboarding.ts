import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const CREDIT_ADDITION_AMOUNT = 5;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Authenticate user via custom JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  let userId: string;

  try {
    const decoded = jwt.decode(token) as any;
    userId = decoded?.sub || decoded?.userId;
    if (!userId) {
      throw new Error("Invalid token payload");
    }
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { experienceLevel } = req.body;

  if (!experienceLevel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let updates: any = {
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    // Experience Logic
    if (experienceLevel === "fresher") {
      updates.plan_id = 2; // Starter plan

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      const currentCredits = profile?.credits || 0;
      updates.credits = currentCredits + CREDIT_ADDITION_AMOUNT;
    } else if (experienceLevel === "experienced") {
      updates.plan_id = 1; // Free plan
    } else {
      return res.status(400).json({ error: "Invalid experience level" });
    }

    // Update Profile
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Onboarding update error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Log this action if needed (optional)
    if (experienceLevel === "fresher") {
      await supabaseAdmin.from("credit_usage").insert({
        user_id: userId,
        credits_used: -CREDIT_ADDITION_AMOUNT, // Negative for addition
        action: "onboarding_bonus",
        description: "Fresher Plan Bonus",
      });
    }

    // Fetch user details for email (since standard update might not return all fields depending on version/mock)
    // We used .select() above, usually it returns the updated rows.
    const updatedProfile = data && data[0];
    if (updatedProfile) {
      // Send Welcome Email (Non-blocking)
      try {
        const {
          emailSender,
        } = require("../../../lib/backend/utils/emailSender");
        // We need email and name. If select() didn't return them, fetch them.
        // Let's ensure select() returns them or we fetch them.
        // 'data' from update should contain them if we didn't specify restricted columns or RLS permitted it.
        // But the query above just said .select(). Supabase returns all columns by default.
        // Let's be safe and fetch if missing, or trust .select().

        const email = updatedProfile.email;
        const name = updatedProfile.name;

        if (email && name) {
          emailSender.sendWelcomeEmail(email, name).catch((err: any) => {
            console.error("Failed to send welcome email:", err);
          });
        }
      } catch (e) {
        console.error("Failed to send welcome email (module load):", e);
      }
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("Onboarding logic error:", error);
    return res.status(500).json({ error: error.message });
  }
}
