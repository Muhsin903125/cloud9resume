import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;
  // const { password } = req.body // Future: Add password protection back if needed

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (req.method === "GET") {
      // Fetch portfolio by slug (public endpoint)
      // Joined with resumes table to get resume data
      const { data: portfolio, error } = await supabase
        .from("portfolios")
        .select("*, resumes(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      // Track view - increment view_count
      let updatedViewCount = (portfolio.view_count || 0) + 1;
      try {
        const { data: updatedData, error: updateError } = await supabase
          .from("portfolios")
          .update({ view_count: updatedViewCount })
          .eq("id", portfolio.id)
          .select("view_count")
          .single();

        if (updateError) {
          console.error("View count update failed:", updateError);
        } else if (updatedData) {
          updatedViewCount = updatedData.view_count;
          console.log(
            `[Portfolio] View count updated to ${updatedViewCount} for ${slug}`
          );
        }
      } catch (err) {
        console.error("Analytics tracking failed", err);
      }

      // Update portfolio object with new view count
      portfolio.view_count = updatedViewCount;

      const portData = {
        ...portfolio,
        resume: portfolio.resumes, // Map nested resume data
      };

      // If we have a persisted content snapshot, prioritize it
      if (portfolio.content) {
        const {
          resume: snapshotResume,
          sections: snapshotSections,
          config: snapshotConfig,
        } = portfolio.content;
        return res.status(200).json({
          success: true,
          data: {
            ...portData,
            resume: snapshotResume || portData.resume,
            sections: snapshotSections || [],
            // Use snapshot config if available to ensure full visual persistence
            template_id: snapshotConfig?.templateId || portfolio.template_id,
            theme_color: snapshotConfig?.themeColor || portfolio.theme_color,
            settings: snapshotConfig?.settings || portfolio.settings,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: portData,
      });
    }

    // POST usually used for analytics/download tracking
    if (req.method === "POST") {
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Public portfolio error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
