import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    return decoded?.sub || decoded?.userId || null;
  } catch {
    return null;
  }
}

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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, name, picture, gender, dob, credits, plan_id, created_at"
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile fetch Supabase error:", error);
      return res.status(500).json({
        error: "Failed to fetch profile",
        details: error.message,
      });
    }

    // Map plan_id to plan name (same as dashboard API)
    const planMap: { [key: number]: string } = {
      1: "free",
      2: "starter",
      3: "pro",
      4: "pro_plus",
      5: "enterprise",
    };
    const plan = planMap[data?.plan_id] || "free";

    return res.status(200).json({
      success: true,
      profile: {
        ...data,
        plan,
      },
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch profile",
      details: error?.message || "Unknown error",
    });
  }
}
