import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    return decoded?.sub || decoded?.userId || null;
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, picture } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (picture) updateData.picture = picture;

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select("id, email, name, picture") // Ensure columns exist in profiles. Name usually does. Picture might not?
      // Checking User interface in authUtils.ts: name is top level, picture is top level.
      // In Supabase profiles, we usually have name, but maybe not picture.
      // If picture is not in profiles, this will fail.
      // But user said "move EVERYTHING to profile tbl". So I assume schema supports it.
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      user: data,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
