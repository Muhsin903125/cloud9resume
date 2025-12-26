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
  const couponId = req.query.id as string;

  // 1. Verify Admin
  const admin = await verifyAdmin(req, res);
  if (!admin) return;

  if (req.method === "PUT") {
    try {
      const { is_active } = req.body;

      if (is_active === undefined) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const { data: updatedCoupon, error } = await supabaseAdmin
        .from("coupons")
        .update({ is_active })
        .eq("id", couponId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ coupon: updatedCoupon });
    } catch (error) {
      console.error("Update coupon error:", error);
      return res.status(500).json({ error: "Failed to update coupon" });
    }
  } else if (req.method === "DELETE") {
    // Optional: Soft delete or Hard delete? Hard delete for now if unused?
    // Better to just set is_active=false usually, but user asked for CRUD.
    try {
      const { error } = await supabaseAdmin
        .from("coupons")
        .delete()
        .eq("id", couponId);

      if (error) throw error;
      return res.status(200).json({ message: "Coupon deleted" });
    } catch (error) {
      console.error("Delete coupon error:", error);
      return res.status(500).json({ error: "Failed to delete coupon" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
