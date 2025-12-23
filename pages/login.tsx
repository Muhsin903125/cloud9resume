import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Button from "../components/Button";
import OAuthButton from "../components/OAuthButton";
import {
  signIn,
  getGoogleOAuthUrl,
  getLinkedInOAuthUrl,
  getGitHubOAuthUrl,
  useAuth,
} from "../lib/authUtils";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load saved email if remember me was enabled, and check for OAuth errors
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const wasRemembered = localStorage.getItem("rememberMeEnabled") === "true";
    if (savedEmail && wasRemembered) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    // Check if there's an error from Google OAuth callback
    if (router.query.error) {
      const errorMsg = Array.isArray(router.query.error)
        ? router.query.error[0]
        : router.query.error;
      setError(decodeURIComponent(errorMsg));

      // Clear error from URL
      window.history.replaceState({}, "", "/login");
    }
  }, [router.query.error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberMeEnabled", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.setItem("rememberMeEnabled", "false");
      }

      // Call the signin function from authUtils
      const result = await signIn(formData.email, formData.password);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // This is now handled by OAuthButton component
    window.location.href = getGoogleOAuthUrl("signin");
  };

  return (
    <>
      <Head>
        <title>Sign In - Cloud9Profile</title>
        <meta
          name="description"
          content="Sign in to your Cloud9Profile account"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center px-4 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {/* Animated Background */}
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
              Welcome back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to continue to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-8">
            <OAuthButton
              provider="google"
              mode="signin"
              getOAuthUrl={() => getGoogleOAuthUrl("signin")}
            />
            <OAuthButton
              provider="linkedin"
              mode="signin"
              getOAuthUrl={() => getLinkedInOAuthUrl("signin")}
            />
            <OAuthButton
              provider="github"
              mode="signin"
              getOAuthUrl={() => getGitHubOAuthUrl("signin")}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="px-3 bg-white text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                {showEmailForm ? "Hide email sign in" : "Or sign in with email"}
              </button>
            </div>
          </div>

          {/* Email Form - Collapsible */}
          {showEmailForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign up free
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">
              Terms
            </a>
            {" · "}
            <a href="#" className="hover:text-gray-700">
              Privacy
            </a>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
