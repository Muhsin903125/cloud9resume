import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Verify Admin
  const admin = await verifyAdmin(req, res);
  if (!admin) return;

  try {
    const { page = "1", limit = "10", search = "", plan = "all" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Apply Search (by email or name)
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply Filter
    if (plan !== "all") {
      const planMap: { [key: string]: number } = {
        free: 1,
        starter: 2,
        pro: 3,
        pro_plus: 4,
        enterprise: 5,
      };
      const planId = planMap[plan as string];
      if (planId) {
        query = query.eq("plan_id", planId);
      }
    }

    const { data: users, count, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      users,
      total: count,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ error: "Failed to list users" });
  }
}
