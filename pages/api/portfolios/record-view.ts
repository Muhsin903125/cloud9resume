import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Portfolio ID is required" });
    }

    // 1. Fetch current views
    const { data: portfolio, error: fetchError } = await supabase
      .from("portfolios")
      .select("view_count")
      .eq("id", id)
      .single();

    if (fetchError || !portfolio) {
      return res
        .status(404)
        .json({ success: false, error: "Portfolio not found" });
    }

    // 2. Increment
    const newViews = (portfolio.view_count || 0) + 1;

    // 3. Update
    const { error: updateError } = await supabase
      .from("portfolios")
      .update({ view_count: newViews })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating view_count:", updateError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update views" });
    }

    return res.status(200).json({ success: true, views: newViews });
  } catch (error: any) {
    console.error("Record View API Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
