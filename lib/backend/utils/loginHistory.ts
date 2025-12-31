import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface LoginLogParams {
  userId: string;
  loginMethod: "email" | "google" | "github" | "linkedin";
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  failureReason?: string;
}

/**
 * Detect device type from user agent string
 */
function detectDeviceType(userAgent: string | undefined): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  if (
    /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  ) {
    if (/ipad|tablet/i.test(ua)) return "tablet";
    return "mobile";
  }
  return "desktop";
}

/**
 * Log a user login to the login_history table
 */
export async function logUserLogin(params: LoginLogParams): Promise<void> {
  try {
    const deviceType = detectDeviceType(params.userAgent);

    const { error } = await supabaseAdmin.from("login_history").insert({
      user_id: params.userId,
      login_method: params.loginMethod,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      device_type: deviceType,
      success: params.success ?? true,
      failure_reason: params.failureReason || null,
    });

    if (error) {
      console.error("[LoginHistory] Failed to log login:", error.message);
    } else {
      console.log(
        `[LoginHistory] Logged ${params.loginMethod} login for user ${params.userId}`
      );
    }
  } catch (err) {
    console.error("[LoginHistory] Error logging login:", err);
  }
}

/**
 * Extract IP address from request headers
 */
export function getClientIP(req: any): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : forwarded[0];
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress;
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: any): string | undefined {
  return req.headers["user-agent"];
}
