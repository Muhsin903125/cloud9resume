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
  // 1. Verify Admin
  const admin = await verifyAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    try {
      const { data: coupons, error } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ coupons });
    } catch (error) {
      console.error("List coupons error:", error);
      return res.status(500).json({ error: "Failed to list coupons" });
    }
  } else if (req.method === "POST") {
    try {
      const {
        code,
        discount_type,
        discount_value,
        max_uses,
        plan_limit,
        user_limit,
        expiry_date,
      } = req.body;

      // Basic Validation
      if (!code || !discount_type || !discount_value) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { data: newCoupon, error } = await supabaseAdmin
        .from("coupons")
        .insert({
          code: code.toUpperCase(),
          discount_type,
          discount_value,
          max_uses,
          plan_limit,
          user_limit: user_limit || 1,
          expiry_date,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(400).json({ error: "Coupon code already exists" });
        }
        throw error;
      }

      return res.status(201).json({ coupon: newCoupon });
    } catch (error) {
      console.error("Create coupon error:", error);
      return res.status(500).json({ error: "Failed to create coupon" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
