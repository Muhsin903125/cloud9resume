import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/backend/supabaseClient";
import jwt from "jsonwebtoken";

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;
    return decoded.sub || decoded.userId || null;
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Verify ownership & get current status
    const { data: existing, error: checkError } = await supabase
      .from("portfolios")
      .select("id, is_active")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (checkError || !existing) {
      return res
        .status(404)
        .json({ success: false, error: "Portfolio not found" });
    }

    if (req.method === "PATCH") {
      const updates = req.body;

      // Credit Logic
      let cost = 0;
      let actionDescription = "";

      // Fetch user profile for plan/credits check
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, credits")
        .eq("id", userId)
        .single();

      const currentPlan = profile?.plan || "free";
      const currentCredits = profile?.credits || 0;

      const isPublishing =
        updates.is_active === true && existing.is_active === false;
      const isUpdatingPublished =
        existing.is_active === true &&
        (updates.is_active === true || updates.is_active === undefined);

      if (isPublishing) {
        if (currentPlan === "free") {
          return res
            .status(403)
            .json({
              success: false,
              error: "Free plan cannot publish portfolios. Please upgrade.",
            });
        }
        cost = 10; // Publish cost
        actionDescription = "Publish Portfolio";
      } else if (isUpdatingPublished) {
        cost = 2; // Update cost
        actionDescription = "Update Published Portfolio";
      }

      // Check Credits
      if (cost > 0) {
        if (currentCredits < cost) {
          return res
            .status(400)
            .json({
              success: false,
              error: `Insufficient credits. ${actionDescription} costs ${cost} credits.`,
            });
        }

        // Deduct
        await supabase
          .from("profiles")
          .update({ credits: currentCredits - cost })
          .eq("id", userId);
        await supabase.from("credit_usage").insert({
          user_id: userId,
          action: isPublishing ? "portfolio_publish" : "portfolio_update",
          credits_used: cost,
          description: actionDescription,
          // meta: { portfolio_id: id }
        });
      }

      // Prevent updating sensitive fields if necessary, e.g. user_id
      delete updates.id;
      delete updates.user_id;
      delete updates.created_at;

      const { data, error } = await supabase
        .from("portfolios")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase.from("portfolios").delete().eq("id", id);

      if (error) throw error;
      return res
        .status(200)
        .json({ success: true, message: "Deleted successfully" });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("Portfolio API error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
