import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Button from "../components/Button";
import { getAssetUrl } from "../lib/common-functions";
import { updatePasswordWithToken } from "../lib/authUtils";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Extract token from URL on mount
  useEffect(() => {
    if (router.isReady) {
      // Prioritize query parameters (our new custom flow)
      const queryToken = router.query.token as string;
      const queryType = router.query.type as string;
      const queryEmail = router.query.email as string;

      if (queryEmail) {
        setEmail(queryEmail);
      }

      // Fallback to Hash parameters (legacy Supabase flow)
      const hash = window.location.hash;
      let hashToken = "";
      let hashType = "";

      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        hashToken = params.get("access_token") || "";
        hashType = params.get("type") || "";
      }

      const foundToken = queryToken || hashToken;
      const tokenType = queryType || hashType;

      // Token is valid if it's a recovery type token, or if it's any token and we're on the reset page
      if (foundToken) {
        setToken(foundToken);
        setTokenValid(true);
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
      // Pass email if available (needed for recovery token verification)
      const result = await updatePasswordWithToken(token, password, email);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
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

      <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center px-4 font-sans text-slate-900">
        {/* Animated Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px]"
          />
        </div>

        {/* Honeycomb Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="honeycomb-small"
              width="28"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="14,3 21,7 21,17 14,21 7,17 7,7"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.5"
              />
              <polygon
                points="0,27 7,31 7,41 0,45 -7,41 -7,31"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.5"
              />
              <polygon
                points="28,27 35,31 35,41 28,45 21,41 21,31"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb-small)" />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl relative z-10"
        >
          {!tokenValid ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Invalid or expired link
              </h3>
              <p className="text-gray-600 mb-8">
                The password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <div className="space-y-3">
                <Link href="/forgot-password">
                  <Button variant="primary" className="w-full">
                    Request New Link
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Logo */}
              <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-6">
                  <img
                    src={getAssetUrl("/logo.png")}
                    alt="Cloud9Profile"
                    style={{
                      height: "48px",
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Create new password
                </h1>
                <p className="text-sm text-gray-600">
                  Enter a strong password for your account
                </p>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Password reset successful
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Your password has been successfully reset. You can now sign
                    in with your new password.
                  </p>
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeSlashIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      At least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>

                  <p className="text-center text-sm text-gray-600 mt-6">
                    <Link
                      href="/login"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Back to login
                    </Link>
                  </p>
                </form>
              )}
            </>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            <Link href="/terms" className="hover:text-gray-700">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:text-gray-700">
              Privacy
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
