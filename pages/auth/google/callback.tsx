import { useEffect } from "react";
import { useRouter } from "next/router";
import { signUpWithGoogle, signInWithGoogle } from "../../../lib/authUtils";

/**
 * Google OAuth Callback Handler
 * This page receives the redirect from Google after user authentication
 * URL: https://cloud9profile.vercel.app/auth/google/callback
 * Google redirects here with: #id_token=...
 */
export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the ID token from the URL hash
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get("id_token");

        console.log(
          "Google callback page loaded, hash:",
          hash.substring(0, 50) + "..."
        );

        if (!idToken) {
          console.error("No ID token found in callback");
          router.push("/login?error=no_token");
          return;
        }

        console.log("ID token found, attempting authentication");

        // Try to sign in first (existing user)
        const signInResult = await signInWithGoogle(idToken);

        console.log("Sign in result:", {
          hasError: !!signInResult.error,
          error: signInResult.error,
          hasData: !!signInResult.data,
          data: signInResult.data,
        });

        // Debug: log the full response
        if (signInResult.data) {
          console.log(
            "Full signin response:",
            JSON.stringify(signInResult.data, null, 2)
          );
        }

        // Check if sign in was successful (no error and has user data)
        // New format: { success, accessToken, expiresIn, user: {id, email, plan, credits} }
        if (
          !signInResult.error &&
          signInResult.data?.user?.id &&
          signInResult.data?.accessToken
        ) {
          console.log(
            "✅ Sign in successful, storing auth and redirecting to dashboard"
          );

          // Store JWT token
          localStorage.setItem(
            "x_user_auth_token",
            signInResult.data.accessToken
          );
          console.log(
            "✅ Stored x_user_auth_token:",
            signInResult.data.accessToken.substring(0, 30) + "..."
          );

          // Store user info with x_ prefix
          localStorage.setItem("x_user_id", signInResult.data.user.id);
          console.log("✅ Stored x_user_id:", signInResult.data.user.id);

          if (signInResult.data.user.email) {
            localStorage.setItem("x_user_email", signInResult.data.user.email);
            console.log(
              "✅ Stored x_user_email:",
              signInResult.data.user.email
            );
          }

          // Store token expiry
          const expiryTime = Date.now() + signInResult.data.expiresIn * 1000;
          localStorage.setItem("x_token_expiry", expiryTime.toString());
          console.log("✅ Stored x_token_expiry:", {
            expiryTime,
            expiryReadable: new Date(expiryTime).toISOString(),
            expiresIn: signInResult.data.expiresIn,
            currentTime: Date.now(),
            currentTimeReadable: new Date().toISOString(),
          });

          // Verify storage
          console.log("✅ Verification - localStorage now contains:", {
            token:
              localStorage.getItem("x_user_auth_token")?.substring(0, 30) +
              "...",
            userId: localStorage.getItem("x_user_id"),
            email: localStorage.getItem("x_user_email"),
            expiry: localStorage.getItem("x_token_expiry"),
          });

          console.log("🚀 Redirecting to /dashboard");
          router.push("/dashboard");
          return;
        }

        // Check if error indicates user not found
        if (
          signInResult.error?.includes("not found") ||
          signInResult.error?.includes("No account found")
        ) {
          console.log("User not found, attempting signup");
          const signUpResult = await signUpWithGoogle(idToken);

          console.log("Sign up result:", {
            hasError: !!signUpResult.error,
            error: signUpResult.error,
            hasData: !!signUpResult.data,
            data: signUpResult.data,
          });

          // Debug: log the full response
          if (signUpResult.data) {
            console.log(
              "Full signup response:",
              JSON.stringify(signUpResult.data, null, 2)
            );
          }

          // Check if sign up was successful (no error and has user data)
          // New format: { success, accessToken, expiresIn, user: {id, email, plan, credits} }
          if (
            !signUpResult.error &&
            signUpResult.data?.user?.id &&
            signUpResult.data?.accessToken
          ) {
            console.log(
              "Signup successful, storing auth and redirecting to dashboard"
            );

            // Store JWT token
            localStorage.setItem(
              "x_user_auth_token",
              signUpResult.data.accessToken
            );

            // Store user info with x_ prefix
            localStorage.setItem("x_user_id", signUpResult.data.user.id);
            if (signUpResult.data.user.email) {
              localStorage.setItem(
                "x_user_email",
                signUpResult.data.user.email
              );
            }

            // Store token expiry
            const expiryTime = Date.now() + signUpResult.data.expiresIn * 1000;
            localStorage.setItem("x_token_expiry", expiryTime.toString());

            router.push("/dashboard");
            return;
          }

          // Signup failed
          const errorMsg = signUpResult.error || "Signup failed";
          console.error("Signup failed:", errorMsg);
          router.push(`/signup?error=${encodeURIComponent(errorMsg)}`);
          return;
        }

        // Other sign in error
        const errorMsg = signInResult.error || "Sign in failed";
        console.error("Sign in failed:", errorMsg);
        router.push(`/login?error=${encodeURIComponent(errorMsg)}`);
      } catch (error) {
        console.error("Callback error:", error);
        router.push(`/login?error=callback_error`);
      }
    };

    if (typeof window !== "undefined") {
      handleCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Processing login...
        </h1>
        <p className="text-gray-600">
          Please wait while we verify your credentials
        </p>
      </div>
    </div>
  );
}
