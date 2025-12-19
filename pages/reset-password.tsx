import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import { updatePasswordWithToken } from "../lib/authUtils";

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Extract token from URL on mount
  useEffect(() => {
    if (router.isReady) {
      // Supabase sends token in URL hash as #access_token=... and type=recovery
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const type = params.get("type");

      // Also check query parameters in case redirectUri uses query string
      const queryToken =
        (router.query.token as string) || (router.query.access_token as string);
      const queryType = router.query.type as string;

      const foundToken = accessToken || queryToken;
      const tokenType = type || queryType;

      // Token is valid if it's a recovery type token, or if it's any token and we're on the reset page
      if (foundToken && (tokenType === "recovery" || !tokenType)) {
        setToken(foundToken);
        setTokenValid(true);
        console.log("Password reset token found:", {
          hasToken: !!foundToken,
          tokenType,
        });
      } else {
        console.log("No valid token found:", {
          hasToken: !!foundToken,
          tokenType,
        });
      }

      setCheckingToken(false);
    }
  }, [router.isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePasswordWithToken(token, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <>
        <Head>
          <title>Invalid Reset Link - Cloud9Profile</title>
        </Head>
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="rounded-lg bg-red-50 p-6 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Invalid or expired reset link
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      The password reset link is invalid or has expired. Please
                      request a new one.
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link href="/forgot-password">
                      <Button variant="primary" size="small">
                        Request New Link
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="secondary" size="small">
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password - Cloud9Profile</title>
        <meta
          name="description"
          content="Reset your Cloud9Profile account password"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link href="/">
            <span className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
              Cloud9Profile
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-light text-gray-900">
            Create new password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter a strong password for your account
          </p>
        </div>

        {/* Form Container */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {success ? (
            <div className="rounded-lg bg-green-50 p-6 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password reset successful
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your password has been successfully reset. You can now
                      sign in with your new password.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/login">
                      <Button variant="primary" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:bg-white focus:border-gray-400"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  At least 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:bg-white focus:border-gray-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
