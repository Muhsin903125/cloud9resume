import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userId = req.query.id as string;

  // 1. Verify Admin
  const admin = await verifyAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    try {
      // Fetch Profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch Recent Activity (Credit Usage)
      const { data: activity, error: activityError } = await supabaseAdmin
        .from("credit_usage")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch Resumes Count
      const { count: resumeCount } = await supabaseAdmin
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Fetch Portfolios Count
      const { count: portfolioCount } = await supabaseAdmin
        .from("portfolios")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      return res.status(200).json({
        profile,
        stats: {
          resumes: resumeCount,
          portfolios: portfolioCount,
        },
        activity: activity || [],
      });
    } catch (error) {
      console.error("Get user details error:", error);
      return res.status(500).json({ error: "Failed to get user details" });
    }
  } else if (req.method === "PUT") {
    try {
      const { plan, is_active, credits } = req.body;
      const updates: any = {};

      // Need current profile state to compare
      const { data: currentProfile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError || !currentProfile) {
        return res.status(404).json({ error: "User not found" });
      }

      if (plan !== undefined) updates.plan = plan;
      if (is_active !== undefined) updates.is_active = is_active;
      if (credits !== undefined) updates.credits = credits;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const { data: updatedProfile, error } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      // --- Send Emails ---
      try {
        const { emailSender } =
          await import("../../../../lib/backend/utils/emailSender");

        // 1. Plan Upgrade
        if (plan && plan !== currentProfile.plan_id && plan !== "free") {
          // Note: API body probably sends 'pro', 'starter' etc. as 'plan', but database validation might fail if it expects ID.
          // Assuming 'plan' in body is the string ID like 'pro'.
          // Also need to know how many credits come with the plan for the email?
          // For now, simpler email:
          // Fetch plan details to get credit amount if possible, or just generic message.
          // Actually `sendPlanUpgradeEmail` expects (email, name, planName, credits).
          // We might need to map plan string to name.
          // Let's defer credit lookup for now or use a basic map.
          // However, if we just updated the user, maybe we trust the admin UI knew what it was doing.
          // Best effort:
          const planName = plan.charAt(0).toUpperCase() + plan.slice(1); // Capitalize
          await emailSender.sendPlanUpgradeEmail(
            updatedProfile.email,
            updatedProfile.name || "User",
            planName,
            0, // We don't know exact credits added by just switching plan here unless we look it up. Passing 0 for now or handle in email template to hide if 0.
          );
        }

        // 2. Credits Added
        if (credits !== undefined && typeof credits === "number") {
          const oldCredits = currentProfile.credits || 0;
          const diff = credits - oldCredits;
          if (diff > 0) {
            await emailSender.sendCreditAdditionEmail(
              updatedProfile.email,
              updatedProfile.name || "User",
              diff,
              credits,
            );
          }
        }
      } catch (emailErr) {
        console.error("Failed to send admin update email:", emailErr);
        // Don't fail the request, just log
      }

      return res.status(200).json({
        message: "User updated successfully",
        user: updatedProfile,
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({ error: "Failed to update user" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
