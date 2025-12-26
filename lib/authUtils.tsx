// Authentication utilities and hooks
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient } from "./apiClient";

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  profile?: {
    first_name: string;
    last_name: string;
    credits: number;
  };
  plan?: "free" | "starter" | "pro" | "pro_plus" | "enterprise";
  is_admin?: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Sign up function
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  acceptTerms: boolean
) {
  try {
    const result = await apiClient.post("/auth/signup", {
      email,
      password,
      firstName,
      lastName,
      acceptTerms,
    });

    // Handle new JWT format: {success, accessToken, expiresIn, user}
    if (result.data && result.data.success && result.data.accessToken) {
      const { accessToken, expiresIn, user } = result.data;

      // Use new token storage system with x_ prefix
      const tokenExpiry = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds

      localStorage.setItem("x_user_auth_token", accessToken);
      localStorage.setItem("x_user_id", user.id);
      localStorage.setItem("x_user_email", user.email);
      localStorage.setItem("x_token_expiry", tokenExpiry.toString());

      console.log("✅ Signup successful - tokens stored:", {
        token: accessToken.substring(0, 20) + "...",
        userId: user.id,
        email: user.email,
        expiresIn: `${expiresIn}s`,
        expiryTime: new Date(tokenExpiry).toISOString(),
      });

      return { data: result.data, error: null };
    }

    // Handle error response
    return {
      data: null,
      error: result.data?.message || "Signup failed",
    };
  } catch (error: any) {
    console.error("❌ Signup error:", error);
    return {
      data: null,
      error: error.response?.data?.message || error.message || "Signup failed",
    };
  }
}

// Sign in function
export async function signIn(email: string, password: string) {
  try {
    const result = await apiClient.post("/auth/signin", {
      email,
      password,
    });

    // Handle new JWT format: {success, accessToken, expiresIn, user}
    if (result.data && result.data.success && result.data.accessToken) {
      const { accessToken, expiresIn, user } = result.data;

      // Use new token storage system with x_ prefix
      const tokenExpiry = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds

      localStorage.setItem("x_user_auth_token", accessToken);
      localStorage.setItem("x_user_id", user.id);
      localStorage.setItem("x_user_email", user.email);
      localStorage.setItem("x_token_expiry", tokenExpiry.toString());

      console.log("✅ Login successful - tokens stored:", {
        token: accessToken.substring(0, 20) + "...",
        userId: user.id,
        email: user.email,
        expiresIn: `${expiresIn}s`,
        expiryTime: new Date(tokenExpiry).toISOString(),
      });

      return { data: result.data, error: null };
    }

    // Handle error response
    return {
      data: null,
      error: result.data?.message || "Login failed",
    };
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return {
      data: null,
      error: error.response?.data?.message || error.message || "Login failed",
    };
  }
}

// Forgot password function
export async function forgotPassword(email: string) {
  return apiClient.post("/auth/forgot-password", { email });
}

// Update password with token
export async function updatePasswordWithToken(
  token: string,
  password: string,
  email?: string
) {
  return apiClient.post("/auth/update-password", { token, password, email });
}

// Validate email - check if user exists
export async function validateEmail(email: string) {
  return apiClient.post("/auth/validate-email", { email });
}

// Email format validation (client-side)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Google OAuth Sign In
export async function signInWithGoogle(idToken: string) {
  return apiClient.post("/auth/signin-google", { idToken });
}

// Google OAuth Sign Up
export async function signUpWithGoogle(idToken: string) {
  return apiClient.post("/auth/signup-google", { idToken });
}

// Get Google OAuth URL for login/signup
export function getGoogleOAuthUrl(
  mode: "signin" | "signup" = "signin"
): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/auth/callback/google`;
  const scope = "openid profile email";
  const responseType = "id_token";
  const nonce = generateNonce();

  // Store nonce in session storage for verification
  if (typeof window !== "undefined") {
    sessionStorage.setItem("oauth_nonce", nonce);
  }

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: responseType,
    scope,
    nonce,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// LinkedIn OAuth Sign In
export async function signInWithLinkedIn(code: string) {
  return apiClient.post("/auth/signin-linkedin", { code });
}

// LinkedIn OAuth Sign Up
export async function signUpWithLinkedIn(code: string) {
  return apiClient.post("/auth/signup-linkedin", { code });
}

// Get LinkedIn OAuth URL for login/signup
export function getLinkedInOAuthUrl(
  mode: "signin" | "signup" = "signin"
): string {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/auth/callback/linkedin`;
  const scope = "openid profile email";
  const state = generateNonce();

  // Store state in session storage for verification
  if (typeof window !== "undefined") {
    sessionStorage.setItem("linkedin_oauth_state", state);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId || "",
    redirect_uri: redirectUri,
    scope,
    state,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  // Debug logging
  console.log("LinkedIn OAuth Request:", {
    clientId,
    redirectUri,
    scope,
    fullUrl: authUrl,
  });

  return authUrl;
}

// GitHub OAuth Sign In
export async function signInWithGitHub(code: string) {
  return apiClient.post("/auth/signin-github", { code });
}

// GitHub OAuth Sign Up
export async function signUpWithGitHub(code: string) {
  return apiClient.post("/auth/signup-github", { code });
}

// Get GitHub OAuth URL for login/signup
export function getGitHubOAuthUrl(
  mode: "signin" | "signup" = "signin"
): string {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/auth/callback/github`;
  const scope = "user:email";
  const state = generateNonce();

  // Store state in session storage for verification
  if (typeof window !== "undefined") {
    sessionStorage.setItem("github_oauth_state", state);
  }

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    scope,
    state,
    allow_signup: "true",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// Generate nonce for OAuth security
function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Handle Google OAuth callback
export async function handleGoogleCallback(
  idToken: string,
  mode: "signin" | "signup" = "signin"
) {
  try {
    // Verify nonce
    const storedNonce =
      typeof window !== "undefined"
        ? sessionStorage.getItem("oauth_nonce")
        : null;
    if (!storedNonce) {
      throw new Error("OAuth nonce not found");
    }

    const result =
      mode === "signin"
        ? await signInWithGoogle(idToken)
        : await signUpWithGoogle(idToken);

    if (result.data && result.data.user?.id) {
      // Store session data using new x_ prefix keys
      localStorage.setItem(
        "x_user_auth_token",
        result.data.session?.access_token || ""
      );
      localStorage.setItem("x_user_id", result.data.user.id);
      localStorage.setItem("x_user_email", result.data.user.email);

      // If expiresIn is provided, store expiry time
      if (result.data.session?.expires_in) {
        const tokenExpiry = Date.now() + result.data.session.expires_in * 1000;
        localStorage.setItem("x_token_expiry", tokenExpiry.toString());
      }

      // Clear nonce
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("oauth_nonce");
      }

      return { success: true, user: result.data.user };
    }

    return { success: false, error: result.error || "Authentication failed" };
  } catch (error) {
    console.error("Google callback error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

// Sign out function
export async function signOut() {
  try {
    const result = await apiClient.post("/auth/signout", {});

    // Clear all authentication data using new x_ prefix keys
    localStorage.removeItem("x_user_auth_token");
    localStorage.removeItem("x_user_id");
    localStorage.removeItem("x_user_email");
    localStorage.removeItem("x_token_expiry");

    // Also clear old keys for backward compatibility
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_profile");

    return result;
  } catch (error) {
    console.error("Signout error:", error);
    // Clear tokens even if API call fails
    localStorage.removeItem("x_user_auth_token");
    localStorage.removeItem("x_user_id");
    localStorage.removeItem("x_user_email");
    localStorage.removeItem("x_token_expiry");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_profile");
    throw error;
  }
}

// Get current session
export async function getSession() {
  return apiClient.get("/auth/session");
}

// Reset password
export async function resetPassword(email: string) {
  return apiClient.post("/auth/reset-password", { email });
}

// Verify email
export async function verifyEmail(token: string, type: string = "email") {
  return apiClient.post("/auth/verify-email", { token, type });
}

// Custom hook for authentication
export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      console.log("🔐 useAuth: Checking authentication...");

      // Check for new x_ prefixed tokens first
      const token = localStorage.getItem("x_user_auth_token");
      const userId = localStorage.getItem("x_user_id");
      const userEmail = localStorage.getItem("x_user_email");
      const tokenExpiry = localStorage.getItem("x_token_expiry");

      console.log("🔐 useAuth: Found tokens:", {
        hasToken: !!token,
        hasUserId: !!userId,
        hasEmail: !!userEmail,
        hasExpiry: !!tokenExpiry,
      });

      // Fallback to old token keys for backward compatibility
      const oldToken = !token ? localStorage.getItem("auth_token") : null;
      const oldUserId = !userId ? localStorage.getItem("user_id") : null;

      const authToken = token || oldToken;
      const authUserId = userId || oldUserId;

      if (!authToken && !authUserId) {
        console.log("❌ useAuth: No token found");
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        return;
      }

      // Check token expiry
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry, 10);
        const currentTime = Date.now();

        // Check if token is expired
        const isExpired =
          expiryTime > 32503680000000
            ? currentTime >= expiryTime // milliseconds
            : currentTime >= expiryTime * 1000; // seconds

        if (isExpired) {
          console.log("❌ useAuth: Token expired, clearing auth data");
          localStorage.removeItem("x_user_auth_token");
          localStorage.removeItem("x_user_id");
          localStorage.removeItem("x_user_email");
          localStorage.removeItem("x_token_expiry");
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
          return;
        }
      }

      try {
        // For users with new JWT tokens (x_ prefix), trust the token without session validation
        // The session endpoint expects Supabase tokens, not our custom JWT tokens
        if (token && userId) {
          console.log(
            "✅ useAuth: Found new JWT token, trusting without session validation"
          );

          let plan: "free" | "starter" | "pro" | "pro_plus" | "enterprise" =
            "free";
          let credits = 0;
          let isAdmin = false;

          try {
            // Fetch fresh profile data
            const profileRes = await apiClient.get("/credits");
            if (profileRes.data && profileRes.data.success) {
              plan = profileRes.data.data.stats.plan;
              credits = profileRes.data.data.stats.current;
              isAdmin = profileRes.data.data.stats.isAdmin || false;

              // Persist isAdmin
              localStorage.setItem("x_user_is_admin", isAdmin.toString());

              console.log("✅ useAuth: Fresh profile loaded", {
                plan,
                credits,
                isAdmin,
              });
            }
          } catch (e) {
            console.warn("⚠️ useAuth: Failed to fetch fresh profile", e);
            // Fallback to local storage if API fails
            isAdmin = localStorage.getItem("x_user_is_admin") === "true";
          }

          setAuthState({
            user: {
              id: userId,
              email: userEmail || localStorage.getItem("user_email") || "",
              name: localStorage.getItem("user_name") || undefined,
              picture: localStorage.getItem("user_picture") || undefined,
              profile: {
                first_name: "",
                last_name: "",
                credits: credits,
              },
              plan: plan,
              is_admin: isAdmin,
            },
            session: null,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }

        // For old auth_token users, validate with session endpoint
        if (authToken) {
          console.log("🔍 useAuth: Validating old token with session endpoint");
          const result = await getSession();

          if (result.data) {
            console.log(
              "✅ useAuth: Session validation successful. Migrating to new token storage."
            );

            // MIGRATION: Save to new keys so apiClient can work
            if (result.data.session?.access_token) {
              localStorage.setItem(
                "x_user_auth_token",
                result.data.session.access_token
              );
              // Also set invalid expiry to force re-check or set reasonably?
              // Let's just set it.
            }
            if (result.data.user?.id) {
              localStorage.setItem("x_user_id", result.data.user.id);
            }

            // Now fetch profile stats with the token in place
            let plan: "free" | "starter" | "pro" | "pro_plus" | "enterprise" =
              "free";
            let credits = 0;
            let isAdmin = false;

            try {
              const profileRes = await apiClient.get("/credits");
              if (profileRes.data && profileRes.data.success) {
                plan = profileRes.data.data.stats.plan;
                credits = profileRes.data.data.stats.current;
                isAdmin = profileRes.data.data.stats.isAdmin || false;
                localStorage.setItem("x_user_is_admin", isAdmin.toString());
              }
            } catch (e) {
              console.warn("Profile fetch failed during migration", e);
              isAdmin = localStorage.getItem("x_user_is_admin") === "true";
            }

            setAuthState({
              user: {
                ...result.data.user,
                plan,
                is_admin: isAdmin,
                profile: {
                  ...result.data.user.profile,
                  credits,
                },
              },
              session: result.data.session,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log(
              "❌ useAuth: Session validation failed, clearing token"
            );
            // Token is invalid, clear it
            localStorage.removeItem("x_user_auth_token");
            localStorage.removeItem("auth_token");
            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
              isAuthenticated: false,
            }));
          }
        } else if (authUserId) {
          console.log("✅ useAuth: Found user ID only, trusting for OAuth");
          // OAuth user (only has user_id, not a full session)
          // Trust the user_id for now and assume user is authenticated
          setAuthState({
            user: {
              id: authUserId,
              email:
                localStorage.getItem("x_user_email") ||
                localStorage.getItem("user_email") ||
                "",
              name: localStorage.getItem("user_name") || undefined,
              picture: localStorage.getItem("user_picture") || undefined,
              profile: undefined,
            },
            session: null,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await signOut();
    setAuthState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/");
  };

  return {
    ...authState,
    logout,
  };
}

// Protected page wrapper
export function withAuth(Component: any) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return React.createElement(Component, props);
  };
}
