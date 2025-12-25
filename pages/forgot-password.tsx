import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAssetUrl } from "../lib/common-functions";
import Button from "../components/Button";
import { forgotPassword, validateEmail, isValidEmail } from "../lib/authUtils";

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);

  // Validate email when it changes
  useEffect(() => {
    const validateEmailAsync = async () => {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        setEmailError("");
        setEmailExists(null);
        return;
      }

      // First check format
      if (!isValidEmail(trimmedEmail)) {
        setEmailError("Invalid email format");
        setEmailExists(false);
        return;
      }

      // Then check if user exists
      setEmailValidating(true);
      setEmailError("");

      try {
        const result = await validateEmail(trimmedEmail);

        if (result.data?.exists) {
          setEmailError("");
          setEmailExists(true);
        } else {
          setEmailError("No account found with this email");
          setEmailExists(false);
        }
      } catch (err) {
        console.error("Email validation error:", err);
        // Don't block submission if validation fails
        setEmailError("");
        setEmailExists(null);
      } finally {
        setEmailValidating(false);
      }
    };

    // Debounce the validation
    const timer = setTimeout(validateEmailAsync, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Email validation
    if (!isValidEmail(email)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    if (emailExists === false) {
      setError(emailError || "Email not found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to send reset email"
        );
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Cloud9Profile</title>
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <img
                src={getAssetUrl("/logo.png")}
                alt="Cloud9Profile"
                style={{ height: "48px", width: "auto", objectFit: "contain" }}
              />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-600">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                We've sent password reset instructions to{" "}
                <span className="font-semibold text-gray-900">{email}</span>.
                Please check your inbox (and spam folder).
              </p>

              <div className="space-y-4">
                <Link href="/login" className="block w-full">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25">
                    Back to login
                  </button>
                </Link>

                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Click to try another email
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        emailError
                          ? "border-red-300 bg-red-50/10"
                          : emailExists === true
                          ? "border-green-300 bg-green-50/10"
                          : "border-gray-300 bg-white"
                      }`}
                      placeholder="you@example.com"
                    />
                    {emailValidating && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {emailError}
                    </p>
                  )}
                  {emailExists === true && email && (
                    <p className="mt-1.5 text-xs text-green-600 font-medium">
                      Account found
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || emailExists === false}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  {isLoading ? "Sending link..." : "Reset password"}
                </button>
              </form>
            </>
          )}

          {/* Back to Login Link */}
          {!success && (
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Back to login
              </Link>
            </p>
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

export default ForgotPasswordPage;
