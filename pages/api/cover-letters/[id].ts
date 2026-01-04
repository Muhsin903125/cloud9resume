import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;
    return decoded.sub || decoded.userId || null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    // Check ownership
    const { data: record, error: fetchError } = await supabase
      .from("cover_letters")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !record) {
      return res
        .status(404)
        .json({ success: false, error: "Cover letter not found" });
    }

    if (record.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized access" });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "PATCH") {
      const {
        title,
        content,
        content_short,
        job_description,
        company_name,
        job_title,
      } = req.body;

      const { data, error } = await supabase
        .from("cover_letters")
        .update({
          title,
          content,
          content_short,
          job_description,
          company_name,
          job_title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase
        .from("cover_letters")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("Cover Letter [id] API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
