import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./middleware";

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
  if (!admin) return; // Response handled in verifyAdmin

  try {
    // 2. Fetch Stats
    // Parallelize queries for performance

    const [totalUsers, activeSubs, proUsers, revenueData] = await Promise.all([
      // Total Users
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true }),

      // Active Subscriptions (Any plan via our subscription logic, basic is just 'active')
      // Assuming 'is_active' flag exists, or derive from plan != 'free'
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .neq("plan", "free"),

      // Pro Users specifically
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("plan", ["pro", "pro_plus", "enterprise"]),

      // Revenue (Estimate from credit_usage or implement real payment tracking table later)
      // For now, let's just count total credits added via purchases if possible,
      // or just return 0 if no payment table exists yet.
      // We'll create a mock revenue stat for now based on plan counts * price estimate
      supabaseAdmin.from("profiles").select("plan"),
    ]);

    // Calculate estimated revenue (Mock logic for MVP)
    // In real app, query 'transactions' table
    let estimatedRevenue = 0;
    if (revenueData.data) {
      revenueData.data.forEach((p) => {
        if (p.plan === "pro") estimatedRevenue += 9; // $9
        if (p.plan === "pro_plus") estimatedRevenue += 19; // $19
        if (p.plan === "enterprise") estimatedRevenue += 49; // $49
      });
    }

    return res.status(200).json({
      totalUsers: totalUsers.count || 0,
      activeSubs: activeSubs.count || 0,
      proUsers: proUsers.count || 0,
      revenue: estimatedRevenue,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
