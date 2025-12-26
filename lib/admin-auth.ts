import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifies if the request is from an authenticated admin user.
 * Returns the user object if admin, null otherwise.
 */
export async function verifyAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.authorization;

  console.log("\n🔐 === ADMIN MIDDLEWARE CHECK ===");
  console.log("Has auth header:", !!authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Missing or invalid authorization header");
    res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    return null;
  }

  const token = authHeader.substring(7);
  console.log("Token preview:", token.substring(0, 20) + "...");

  try {
    // 1. Extract user ID from token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    let userId = user?.id;
    let email = user?.email;

    if (!userId) {
      console.log("⚠️ Supabase auth failed, trying JWT decode");
      const decoded: any = jwt.decode(token);
      userId = decoded?.sub || decoded?.userId;
      email = decoded?.email;
    }

    console.log(`👤 User extracted: ${userId} (${email})`);

    if (!userId || !email) {
      console.log("❌ Could not extract user ID or email from token");
      res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
      return null;
    }

    // 2. Check admin status in profiles table BY EMAIL (not ID, due to ID mismatch)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_admin, plan_id")
      .eq("email", email) // Use email instead of ID
      .single();

    console.log(`📊 Profiles table (by email):`, {
      found: !!profile,
      isAdmin: profile?.is_admin,
      profileId: profile?.id,
      email: profile?.email,
      error: profileError?.message,
    });

    let isAdmin = profile?.is_admin === true;

    // 3. If not admin in profiles, check users table (fallback)
    if (!isAdmin) {
      console.log("⚠️ Not admin in profiles, checking users table...");
      const { data: userProfile, error: userError } = await supabaseAdmin
        .from("users")
        .select("id, email, is_admin")
        .eq("email", email) // Use email instead of ID
        .single();

      console.log(`📊 Users table (by email):`, {
        found: !!userProfile,
        isAdmin: userProfile?.is_admin,
        userId: userProfile?.id,
        error: userError?.message,
      });

      if (userProfile?.is_admin === true) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      console.log(`❌ Access DENIED - User ${email} is not an admin`);
      res.status(403).json({
        error: "Forbidden",
        message: "Admin access required",
        diagnostic: {
          userId,
          email,
          checkedProfiles: !!profile,
          profileAdmin: profile?.is_admin,
        },
      });
      return null;
    }

    console.log(`✅ Access GRANTED - Admin verified for ${email}`);
    console.log("=== END MIDDLEWARE CHECK ===\n");
    return { id: userId, email };
  } catch (err: any) {
    console.error("❌ Admin verification error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
    return null;
  }
}
