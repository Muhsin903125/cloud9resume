import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;

    console.log("=== ADMIN CHECK DIAGNOSTIC ===");
    console.log("Has authorization header:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
        diagnostic: {
          hasAuthHeader: !!authHeader,
          headerFormat: authHeader
            ? authHeader.substring(0, 10) + "..."
            : "none",
        },
      });
    }

    const token = authHeader.substring(7);
    console.log("Token extracted:", token.substring(0, 20) + "...");

    // 1. Try Supabase auth first
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    let userId = user?.id;
    let email = user?.email;

    console.log("Supabase auth result:", {
      userId,
      email,
      error: authError?.message,
    });

    // 2. Fallback to JWT decode
    if (!userId) {
      console.log("Trying manual JWT decode...");
      const decoded: any = jwt.decode(token);
      userId = decoded?.sub || decoded?.userId;
      email = decoded?.email;
      console.log("JWT decoded:", { userId, email });
    }

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Could not extract user ID from token",
        diagnostic: {
          supabaseAuthError: authError?.message,
          tokenDecoded: false,
        },
      });
    }

    console.log(`Checking admin status for user: ${userId} (${email})`);

    // 3. Check profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_admin, plan_id, credits")
      .eq("id", userId)
      .single();

    console.log("Profiles table query result:", {
      found: !!profileData,
      data: profileData,
      error: profileError?.message,
    });

    // 4. Check users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, is_admin")
      .eq("id", userId)
      .single();

    console.log("Users table query result:", {
      found: !!userData,
      data: userData,
      error: userError?.message,
    });

    // 5. Also check by email in both tables
    const { data: profileByEmail } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_admin")
      .eq("email", email)
      .limit(5);

    const { data: usersByEmail } = await supabaseAdmin
      .from("users")
      .select("id, email, is_admin")
      .eq("email", email)
      .limit(5);

    console.log("Email-based lookups:", {
      profilesByEmail: profileByEmail,
      usersByEmail: usersByEmail,
    });

    // Determine admin status
    const isAdminInProfiles = profileData?.is_admin === true;
    const isAdminInUsers = userData?.is_admin === true;
    const isAdmin = isAdminInProfiles || isAdminInUsers;

    console.log("Final admin determination:", {
      isAdminInProfiles,
      isAdminInUsers,
      finalIsAdmin: isAdmin,
    });

    console.log("=== END DIAGNOSTIC ===\n");

    return res.status(200).json({
      success: true,
      isAdmin,
      user: {
        id: userId,
        email: email,
      },
      diagnostic: {
        profilesTable: {
          found: !!profileData,
          isAdmin: isAdminInProfiles,
          data: profileData,
        },
        usersTable: {
          found: !!userData,
          isAdmin: isAdminInUsers,
          data: userData,
        },
        emailLookup: {
          profilesCount: profileByEmail?.length || 0,
          usersCount: usersByEmail?.length || 0,
          profiles: profileByEmail,
          users: usersByEmail,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
