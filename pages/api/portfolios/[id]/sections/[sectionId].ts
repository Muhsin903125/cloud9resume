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
  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id, sectionId } = req.query;

    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Portfolio ID is required" });
    }

    if (!sectionId || typeof sectionId !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Section ID is required" });
    }

    // Verify user owns this portfolio
    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from("portfolios")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (portfolioError || !portfolio) {
      return res
        .status(404)
        .json({ success: false, error: "Portfolio not found" });
    }

    if (portfolio.user_id !== userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // GET - Fetch a single section
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("portfolio_sections")
        .select("*")
        .eq("id", sectionId)
        .eq("portfolio_id", id)
        .single();

      if (error || !data) {
        return res
          .status(404)
          .json({ success: false, error: "Section not found" });
      }

      return res.status(200).json({ success: true, data });
    }

    // PUT - Update a single section
    if (req.method === "PUT") {
      const { section_type, section_data, order_index, is_visible } = req.body;

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (section_type !== undefined) updateData.section_type = section_type;
      if (section_data !== undefined) updateData.section_data = section_data;
      if (order_index !== undefined) updateData.order_index = order_index;
      if (is_visible !== undefined) updateData.is_visible = is_visible;

      const { data, error } = await supabaseAdmin
        .from("portfolio_sections")
        .update(updateData)
        .eq("id", sectionId)
        .eq("portfolio_id", id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res
          .status(404)
          .json({ success: false, error: "Section not found" });
      }

      return res.status(200).json({ success: true, data });
    }

    // DELETE - Delete a single section
    if (req.method === "DELETE") {
      const { error } = await supabaseAdmin
        .from("portfolio_sections")
        .delete()
        .eq("id", sectionId)
        .eq("portfolio_id", id);

      if (error) throw error;

      return res
        .status(200)
        .json({ success: true, message: "Section deleted" });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("[Portfolio Section API] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
