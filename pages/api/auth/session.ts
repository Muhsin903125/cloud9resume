import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get token from Authorization header or body
    let token = null;

    if (req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    } else {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({
        error: "No active session",
        message: "Authorization token is required",
      });
    }

    // Verify token and get user ID via manual JWT decode
    let userId: string;
    let email: string;
    try {
      const decoded = jwt.decode(token) as any;
      userId = decoded?.sub || decoded?.userId;
      email = decoded?.email;
      if (!userId) {
        throw new Error("Invalid token payload");
      }
    } catch (err) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token is invalid or expired",
      });
    }

    // Get user profile using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      // Continue without profile data
    }

    return res.status(200).json({
      user: {
        id: userId,
        email: email,
        profile: profile || null,
      },
      session: {
        access_token: token,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Session retrieval failed",
    });
  }
}
