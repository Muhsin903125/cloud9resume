import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Button from "../components/Button";
import Card from "../components/Card";
import OAuthButton from "../components/OAuthButton";
import { api } from "../lib/api";
import {
  validateEmail,
  isValidEmail,
  getGoogleOAuthUrl,
  getLinkedInOAuthUrl,
  getGitHubOAuthUrl,
} from "../lib/authUtils";

const SignupPage: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // Check for errors from OAuth callback
  useEffect(() => {
    if (router.query.error) {
      const errorMsg = Array.isArray(router.query.error)
        ? router.query.error[0]
        : router.query.error;
      setError(decodeURIComponent(errorMsg));

      // Clear error from URL
      window.history.replaceState({}, "", "/signup");
    }
  }, [router.query.error]);

  // Validate email when it changes
  useEffect(() => {
    const validateEmailAsync = async () => {
      const email = formData.email.trim();

      if (!email) {
        setEmailError("");
        setEmailValid(null);
        return;
      }

      // First check format
      if (!isValidEmail(email)) {
        setEmailError("Invalid email format");
        setEmailValid(false);
        return;
      }

      // Then check if user already exists
      setEmailValidating(true);
      setEmailError("");

      try {
        const result = await validateEmail(email);

        if (result.data?.exists) {
          setEmailError("This email is already registered");
          setEmailValid(false);
        } else {
          setEmailError("");
          setEmailValid(true);
        }
      } catch (err) {
        console.error("Email validation error:", err);
        // Don't block submission if validation fails
        setEmailError("");
        setEmailValid(null);
      } finally {
        setEmailValidating(false);
      }
    };

    // Debounce the validation
    const timer = setTimeout(validateEmailAsync, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Email validation
    if (!isValidEmail(formData.email)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    if (emailValid === false) {
      setError(emailError || "Invalid email");
      setIsLoading(false);
      return;
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError("You must accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        acceptTerms: true, // Assuming terms are accepted in the form
      });

      if (!response.success) {
        setError(response.error || "Failed to create account");
        return;
      }

      // Show success message and redirect to login or dashboard
      alert(
        "Account created successfully! Please check your email to verify your account."
      );
      router.push("/login");
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // This is now handled by OAuthButton component
    window.location.href = getGoogleOAuthUrl("signup");
  };

  return (
    <>
      <Head>
        <title>Sign Up - Cloud9Profile</title>
        <meta name="description" content="Create your Cloud9Profile account" />
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
              Create your account
            </h1>
            <p className="text-sm text-gray-600">
              Start building your professional profile
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
              mode="signup"
              getOAuthUrl={() => getGoogleOAuthUrl("signup")}
            />
            <OAuthButton
              provider="linkedin"
              mode="signup"
              getOAuthUrl={() => getLinkedInOAuthUrl("signup")}
            />
            <OAuthButton
              provider="github"
              mode="signup"
              getOAuthUrl={() => getGitHubOAuthUrl("signup")}
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
                {showEmailForm ? "Hide email sign up" : "Or sign up with email"}
              </button>
            </div>
          </div>

          {/* Email Form - Collapsible */}
          {showEmailForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      emailError
                        ? "border-red-300 focus:ring-red-500"
                        : emailValid === true
                        ? "border-green-300 focus:ring-green-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } focus:border-transparent`}
                    placeholder="you@example.com"
                  />
                  {emailValidating && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!emailValidating && emailValid === true && (
                    <div className="absolute right-3 top-3 text-green-600">
                      ✓
                    </div>
                  )}
                  {!emailValidating && emailError && (
                    <div className="absolute right-3 top-3 text-red-600">✕</div>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1.5 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter password"
                />
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
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

export default SignupPage;
