import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/backend/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    const { data, error } = await supabase
      .from("portfolios")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;

    // If data exists, it's taken. Available = !data
    return res.status(200).json({ available: !data });
  } catch (error: any) {
    console.error("Check slug error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
