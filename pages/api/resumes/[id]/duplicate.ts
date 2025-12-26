import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { method } = req;
  const { id } = req.query;

  try {
    if (method === "POST") {
      // Duplicate resume
      const { data: sourceResume } = await supabase
        .from("resumes")
        .select("*, resume_sections(*)")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (!sourceResume)
        return res.status(404).json({ error: "Resume not found" });

      // Check plan limits
      const { data: userResumes } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active");

      const planLimits: { [key: string]: number } = {
        free: 1,
        starter: 3,
        pro: 10,
        pro_plus: 100,
      };
      const userPlan = "pro"; // Get from user's subscription
      if (userResumes && userResumes.length >= planLimits[userPlan]) {
        return res.status(403).json({ error: "Resume limit reached" });
      }

      // Create duplicate
      const { data: newResume, error: createError } = await supabase
        .from("resumes")
        .insert({
          user_id: userId,
          title: `${sourceResume.title} (Copy)`,
          job_title: sourceResume.job_title,
          template_id: sourceResume.template_id,
          theme_color: sourceResume.theme_color,
          is_primary: false,
          status: "active",
        })
        .select()
        .single();

      if (createError) throw createError;

      // Duplicate sections
      const sectionsToInsert = sourceResume.resume_sections.map(
        (section: any) => ({
          resume_id: newResume.id,
          section_type: section.section_type,
          section_data: section.section_data,
          order_index: section.order_index,
          is_visible: section.is_visible,
        })
      );

      if (sectionsToInsert.length > 0) {
        await supabase.from("resume_sections").insert(sectionsToInsert);
      }

      // Deduct credit if needed (over plan limit free tier)
      if (userResumes && userResumes.length >= planLimits[userPlan]) {
        // Log usage
        await supabase.from("credit_usage").insert({
          user_id: userId,
          action: "duplicate",
          credits_used: 1,
          description: `Duplicated resume ${id}`,
        });
      }

      return res.status(201).json({ success: true, data: newResume });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Duplicate error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
