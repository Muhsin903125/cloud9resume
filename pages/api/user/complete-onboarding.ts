import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { emailSender } from "../../../lib/backend/utils/emailSender";

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

  try {
    let updates: any = {
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
      plan_id: 1, // Free plan for all users
    };

    // No bonus credits or experience level logic - all users start with free plan

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
    // No bonus credits in simplified onboarding

    // Fetch user details for email (since standard update might not return all fields depending on version/mock)
    // We used .select() above, usually it returns the updated rows.
    const updatedProfile = data && data[0];
    if (updatedProfile) {
      console.log(
        "[Onboarding] Profile updated, attempting to send welcome email to:",
        updatedProfile.email
      );
      // Send Welcome Email (Non-blocking)
      try {
        const email = updatedProfile.email;
        const name = updatedProfile.name;
        // Determine plan name based on ID or experience level
        const planId = updatedProfile.plan_id;
        let planName = "free"; // All users start with free plan

        const credits = updatedProfile.credits;

        console.log("[Onboarding] Email details:", {
          email,
          name,
          planName,
          credits,
        });

        if (email && name) {
          // Use sendRegistrationEmail to include plan details and credits
          emailSender
            .sendRegistrationEmail(email, name, planName, credits)
            .then(() =>
              console.log("[Onboarding] Registration email sent successfully")
            )
            .catch((err: any) => {
              console.error("Failed to send registration email:", err);
            });
        } else {
          console.warn(
            "[Onboarding] Missing email or name, cannot send welcome email"
          );
        }
      } catch (e) {
        console.error("Failed to send welcome email (execution error):", e);
      }
    } else {
      console.warn(
        "[Onboarding] No updated profile data returned, skipping welcome email"
      );
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("Onboarding logic error:", error);
    return res.status(500).json({ error: error.message });
  }
}
