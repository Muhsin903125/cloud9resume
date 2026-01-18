import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { storeAuthData, getReturnUrl } from "../lib/auth-utils";
import { USER_AUTH_TOKEN_KEY, USER_ID_KEY } from "../lib/token-keys";
import { colors } from "../lib/constants";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

/**
 * Login page with token generation
 * After successful login, generates access token and stores in localStorage
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Authenticate user
      const authResponse = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok || !authData.success) {
        const errorMsg = authData.error || authData.message || "Login failed";
        setError(errorMsg);
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        setError("Invalid authentication response - no user ID");
        return;
      }

      // Step 2: Generate access token
      const tokenResponse = await fetch("/api/auth/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.success) {
        const errorMsg = tokenData.error || "Failed to generate access token";
        setError(errorMsg);
        return;
      }

      // Step 3: Store token and user data in localStorage
      storeAuthData(tokenData.accessToken, userId, email, tokenData.expiresIn);

      // Step 4: Redirect to original requested page or dashboard
      const returnUrl = getReturnUrl(router.query);
      await router.push(returnUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Cloud9Profile</title>
      </Head>

      <div
        style={{
          background: colors.background.light,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "white",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: colors.primary.black,
              margin: "0 0 8px 0",
              textAlign: "center",
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: colors.secondary.mediumGray,
              textAlign: "center",
              margin: "0 0 24px 0",
            }}
          >
            Sign in to access your resumes
          </p>

          {error && (
            <div
              style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${colors.accent.red}`,
                borderRadius: "6px",
                color: colors.accent.red,
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: colors.primary.black,
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: colors.primary.black,
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    paddingRight: "40px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: colors.secondary.mediumGray,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <EyeSlashIcon style={{ width: "20px", height: "20px" }} />
                  ) : (
                    <EyeIcon style={{ width: "20px", height: "20px" }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: colors.primary.blue,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "8px",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              fontSize: "13px",
              color: colors.secondary.mediumGray,
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: colors.primary.blue,
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
