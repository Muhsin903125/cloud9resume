import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const PLAN_LIMITS = {
  free: 1,
  professional: 5,
  premium: Infinity,
  enterprise: Infinity,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { username, portfolioId } = req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required" });
    }

    // Normalize username
    const normalizedUsername = username.toLowerCase().trim();

    // Check if username is reserved
    const RESERVED_USERNAMES = [
      "admin",
      "api",
      "dashboard",
      "login",
      "signup",
      "auth",
      "portfolio",
      "portfolios",
      "resume",
      "resumes",
      "settings",
      "profile",
      "plans",
      "pricing",
      "help",
      "support",
      "about",
      "contact",
      "terms",
      "privacy",
      "blog",
      "www",
      "app",
    ];

    if (RESERVED_USERNAMES.includes(normalizedUsername)) {
      return res.status(200).json({
        available: false,
        reason: "reserved",
      });
    }

    // Check minimum length
    if (normalizedUsername.length < 3) {
      return res.status(200).json({
        available: false,
        reason: "too_short",
      });
    }

    // Check if username exists
    const { data: existingPortfolio, error: checkError } = await supabase
      .from("portfolios")
      .select("id, user_id, slug, title, is_active")
      .eq("slug", normalizedUsername)
      .eq("is_active", true)
      .single();

    // Get user's published portfolios count
    const { data: userPortfolios, error: countError } = await supabase
      .from("portfolios")
      .select("id, slug, title")
      .eq("user_id", userId)
      .eq("is_active", true);

    const publishedCount = userPortfolios?.length || 0;

    // Get user's plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    const userPlan = (profile?.plan || "free") as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[userPlan];

    if (!existingPortfolio) {
      // Username is available
      return res.status(200).json({
        available: true,
        publishedCount,
        limit: limit === Infinity ? "unlimited" : limit,
        existingPortfolios: userPortfolios || [],
      });
    }

    // Username exists - check if owned by current user
    const isOwnedByUser = existingPortfolio.user_id === userId;
    const isSamePortfolio = existingPortfolio.id === portfolioId;

    return res.status(200).json({
      available: isSamePortfolio, // Available if it's the same portfolio being edited
      ownedByUser: isOwnedByUser,
      existingPortfolioId: existingPortfolio.id,
      publishedCount,
      limit: limit === Infinity ? "unlimited" : limit,
      existingPortfolios: userPortfolios || [],
    });
  } catch (error: any) {
    console.error("Check username error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to check username",
    });
  }
}
