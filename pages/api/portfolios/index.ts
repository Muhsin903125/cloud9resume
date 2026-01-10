import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/backend/supabaseClient";
import jwt from "jsonwebtoken";
import { Portfolio } from "../../../lib/types";
import { PLAN_LIMITS } from "../../../lib/subscription";

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
  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "POST") {
      const {
        title,
        resume_id,
        repo,
        url,
        theme,
        theme_color,
        template_id,
        slug,
        is_active,
        settings,
        content,
      } = req.body;

      if (!title || !resume_id) {
        return res
          .status(400)
          .json({ success: false, error: "Title and Resume ID are required" });
      }

      // Check portfolio limit based on plan
      let userPlan = "free";

      const { data: profileCheck, error: profileErr } = await supabase
        .from("profiles")
        .select("plan_id, plan")
        .eq("id", userId)
        .single();

      if (profileCheck) {
        if (
          ["free", "starter", "pro", "pro_plus", "enterprise"].includes(
            profileCheck.plan
          )
        ) {
          userPlan = profileCheck.plan;
        } else {
          // Legacy or ID-based fallback
          const pid = profileCheck.plan_id;
          if (pid === 2 || pid === 3) userPlan = "pro"; // Was 'professional'
          else if (pid === 4) userPlan = "pro_plus"; // Was 'premium'
          else if (pid === 5) userPlan = "enterprise";
        }
      }

      const planLimits =
        PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
      const limit = planLimits.portfolios;

      if (limit !== Infinity) {
        const { count, error: countError } = await supabase
          .from("portfolios")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .neq("is_active", false); // Only count active portfolios

        if (countError) throw countError;

        if ((count || 0) >= limit) {
          return res.status(403).json({
            success: false,
            error:
              "Portfolio limit reached. Upgrade to create more portfolios.",
          });
        }
      }

      // Check slug uniqueness if provided
      if (slug) {
        const { data: existing } = await supabase
          .from("portfolios")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (existing) {
          return res
            .status(400)
            .json({ success: false, error: "URL is already taken" });
        }
      }

      const { data, error } = await supabase
        .from("portfolios")
        .insert({
          user_id: userId,
          title,
          resume_id,
          repo: repo || null,
          url: url || null,
          theme: theme || "modern",
          theme_color: theme_color || "#3b82f6",
          template_id: template_id || "modern",
          slug: slug || null,
          is_active: is_active ?? true,
          settings: settings || {},
          content: content || null,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
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
