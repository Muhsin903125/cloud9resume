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

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Portfolio ID is required" });
    }

    // Verify user owns this portfolio
    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from("portfolios")
      .select("id, user_id, resume_id")
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

    // GET - Fetch all sections for a portfolio
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("portfolio_sections")
        .select("*")
        .eq("portfolio_id", id)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // POST - Create a new section or import from resume
    if (req.method === "POST") {
      const { action, section_type, section_data, order_index, is_visible } =
        req.body;

      // Special action: Import all sections from linked resume
      if (action === "import_from_resume") {
        if (!portfolio.resume_id) {
          return res.status(400).json({
            success: false,
            error: "No resume linked to this portfolio",
          });
        }

        // Fetch resume sections
        const { data: resumeSections, error: resumeError } = await supabaseAdmin
          .from("resume_sections")
          .select("section_type, section_data, order_index, is_visible")
          .eq("resume_id", portfolio.resume_id)
          .order("order_index", { ascending: true });

        if (resumeError) throw resumeError;

        if (!resumeSections || resumeSections.length === 0) {
          return res.status(400).json({
            success: false,
            error: "No sections found in linked resume",
          });
        }

        // Delete existing portfolio sections
        await supabaseAdmin
          .from("portfolio_sections")
          .delete()
          .eq("portfolio_id", id);

        // Copy resume sections to portfolio sections
        const newSections = resumeSections.map((s, idx) => ({
          portfolio_id: id,
          section_type: s.section_type,
          section_data: s.section_data,
          order_index: s.order_index ?? idx,
          is_visible: s.is_visible ?? true,
        }));

        const { data: imported, error: importError } = await supabaseAdmin
          .from("portfolio_sections")
          .insert(newSections)
          .select();

        if (importError) throw importError;

        return res.status(201).json({
          success: true,
          message: `Imported ${imported.length} sections from resume`,
          data: imported,
        });
      }

      // Regular section creation
      if (!section_type) {
        return res.status(400).json({
          success: false,
          error: "section_type is required",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("portfolio_sections")
        .insert({
          portfolio_id: id,
          section_type,
          section_data: section_data || {},
          order_index: order_index ?? 0,
          is_visible: is_visible ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // PUT - Update sections (batch update for reordering)
    if (req.method === "PUT") {
      const { sections } = req.body;

      if (!Array.isArray(sections)) {
        return res.status(400).json({
          success: false,
          error: "sections array is required",
        });
      }

      // Update each section
      const updates = sections.map(async (section: any) => {
        if (!section.id) return null;

        const { error } = await supabaseAdmin
          .from("portfolio_sections")
          .update({
            section_type: section.section_type,
            section_data: section.section_data,
            order_index: section.order_index,
            is_visible: section.is_visible,
            updated_at: new Date().toISOString(),
          })
          .eq("id", section.id)
          .eq("portfolio_id", id);

        if (error) throw error;
        return section.id;
      });

      await Promise.all(updates);

      // Fetch updated sections
      const { data, error } = await supabaseAdmin
        .from("portfolio_sections")
        .select("*")
        .eq("portfolio_id", id)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // DELETE - Delete a specific section
    if (req.method === "DELETE") {
      const { sectionId } = req.body;

      if (!sectionId) {
        return res.status(400).json({
          success: false,
          error: "sectionId is required",
        });
      }

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
    console.error("[Portfolio Sections API] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
