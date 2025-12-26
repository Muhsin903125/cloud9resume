import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: "Email query param is required" });
  }

  try {
    // 1. Check Profiles
    const { data: profiles, error: profileFindError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email);

    let profileResult = null;
    let userResult = null;

    if (profiles && profiles.length > 0) {
      // Update first match
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_admin: true })
        .eq("email", email)
        .select()
        .single();

      profileResult = {
        found: true,
        updated: updatedProfile,
        error: updateError,
      };
    } else {
      profileResult = { found: false, error: profileFindError };
    }

    // 2. Check Users (fallback table)
    const { data: users, error: userFindError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email);

    if (users && users.length > 0) {
      // Update first match
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({ is_admin: true })
        .eq("email", email)
        .select()
        .single();

      userResult = { found: true, updated: updatedUser, error: updateError };
    } else {
      userResult = { found: false, error: userFindError };
    }

    return res.status(200).json({
      message: "Attempted to promote user to admin",
      email,
      results: {
        profiles: profileResult,
        users: userResult,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
