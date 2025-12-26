import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, planId, userId } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  try {
    // 1. Fetch Coupon
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    // 2. Validate Status
    if (!coupon.is_active) {
      return res.status(400).json({ error: "Coupon is inactive" });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    // 3. Validate Global Usage Limits
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // 4. Validate Plan Limit
    if (planId && coupon.plan_limit && coupon.plan_limit.length > 0) {
      if (!coupon.plan_limit.includes(planId)) {
        return res
          .status(400)
          .json({ error: "Coupon not applicable to this plan" });
      }
    }

    // 5. Validate User Usage Limit (if user is logged in)
    if (userId) {
      const { count } = await supabaseAdmin
        .from("coupon_logs")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .eq("user_id", userId);

      if (count && count >= coupon.user_limit) {
        return res
          .status(400)
          .json({ error: "You have already used this coupon" });
      }
    }

    // Return Valid Coupon Info
    return res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    });
  } catch (err) {
    console.error("Verify coupon error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
}
