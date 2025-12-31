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

    // 1. Authenticate via manual JWT decode (custom tokens)
    const decoded: any = jwt.decode(token);
    let userId = decoded?.sub || decoded?.userId;
    let email = decoded?.email;

    console.log("JWT decoded:", { userId, email });

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Could not extract user ID from token",
        diagnostic: {
          supabaseAuthError: "none (manual decode used)",
          tokenDecoded: !!userId,
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

    // 4. Also check by email
    const { data: profileByEmail } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_admin")
      .eq("email", email)
      .limit(5);

    console.log("Email-based lookup:", {
      profilesByEmail: profileByEmail,
    });

    // Determine admin status
    const isAdmin = profileData?.is_admin === true;

    console.log("Final admin determination:", {
      isAdminInProfiles: isAdmin,
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
          isAdmin: isAdmin,
          data: profileData,
        },
        emailLookup: {
          profilesCount: profileByEmail?.length || 0,
          profiles: profileByEmail,
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
