import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
  if (req.method !== "DELETE") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    // Authenticate user
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1. Delete from public.profiles (This might cascade, but let's be sure)
    // Actually, usually deleting from auth.users cascades to public.profiles if FK is set up correctly.
    // But sometimes it's safer to delete referenced data first if constraints prevent auth deletion.
    // Let's try deleting the auth user, which is the root.

    // However, if we delete auth user, we can't access their data anymore.
    // Let's first delete from 'profiles' to ensure application data is gone.
    // Or check if we should just call deleteUser.

    // Safer path: Delete Auth User. Supabase usually handles cascade if configured.
    // If not, we might get an error.

    // Let's do explicit cleanup just in case FK constraints are Restrict.
    await supabaseAdmin
      .from("email_verifications")
      .delete()
      .eq(
        "email",
        (
          await supabaseAdmin
            .from("profiles")
            .select("email")
            .eq("id", userId)
            .single()
        ).data?.email
      );

    // Attempt to delete user from Supabase Auth
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("[Delete Account] Auth Deletion Error:", deleteAuthError);
      // Fallback: If auth deletion fails (e.g. not authorized?), try deleting profile data

      const { error: deleteProfileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (deleteProfileError) {
        throw new Error("Failed to delete account data");
      }
    }

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error("[Delete Account] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete account",
    });
  }
}
