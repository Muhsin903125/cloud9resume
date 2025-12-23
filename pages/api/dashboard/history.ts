import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function extractUserIdFromToken(
  req: NextApiRequest
): Promise<string | null> {
  try {
    let token = "";
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.query.access_token) {
      token = req.query.access_token as string;
    }

    if (!token) return null;

    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) return data.user.id;

    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;

    return decoded.sub || decoded.userId;
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const userId = await extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Fetch Resumes
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, title, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    // Filter in JS to safely handle NULL statuses which .neq excludes
    const validResumes = (resumes || []).filter(
      (r) => r.status !== "deleted" && r.status !== "archived"
    );

    if (resumesError) console.error("Resumes fetch error:", resumesError);

    // Fetch Portfolios
    const { data: portfolios, error: portError } = await supabase
      .from("portfolios")
      .select("id, title, is_active, views, created_at, updated_at")
      .eq("user_id", userId)
      // Assuming portfolios are hard deleted or managed differently, but if soft deleted:
      // .neq("status", "deleted")
      .order("updated_at", { ascending: false });

    if (portError) console.error("Portfolios fetch error:", portError);

    const fetchedResumes = validResumes || [];
    const fetchedPortfolios = portfolios || [];

    // Combine Activities
    const activities = [
      ...fetchedResumes.map((r: any) => ({
        id: `r-${r.id}`,
        type: "resume",
        title: r.title,
        action: "Updated",
        status: r.status,
        timestamp: r.updated_at || r.created_at,
      })),
      ...fetchedPortfolios.map((p: any) => ({
        id: `p-${p.id}`,
        type: "portfolio",
        title: p.title,
        action: p.updated_at ? "Updated" : "Created",
        status: p.is_active ? "Active" : "Draft",
        views: p.views || 0,
        timestamp: p.updated_at || p.created_at,
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error("History API error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
