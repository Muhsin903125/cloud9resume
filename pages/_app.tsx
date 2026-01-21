import type { AppProps } from "next/app";
import { getAssetUrl } from "../lib/common-functions";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import PlanUpgradeModal from "../components/PlanUpgradeModal";
import OnboardingModal from "../components/OnboardingModal";
import { useAuth } from "../lib/authUtils";
import {
  DocumentIcon,
  PortfolioIcon,
  AnalyticsIcon,
  TemplateIcon,
} from "../components/Icons";
import {
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Loader from "../components/Loader";
import CookieBanner from "@/components/common/CookieBanner";

// ... imports remain the same

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // ... useEffects remain the same

  const { user, logout, isLoading } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [userPicture, setUserPicture] = useState<string | null>(null);

  // Update user info when user changes
  useEffect(() => {
    if (user) {
      setUserName(user.name || user.email?.split("@")[0] || "User");
      setUserPicture(user.picture || null);
    }
  }, [user]);

  // ... authPages and checks remain the same
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isDashboard = router.pathname.startsWith("/dashboard");
  const isAdminPage = router.pathname.startsWith("/admin");
  const isAuthPage =
    authPages.includes(router.pathname) || router.pathname.startsWith("/auth/");
  const isPortfolioView =
    router.pathname.startsWith("/portfolio/") ||
    router.pathname === "/[username]";

  const isNoLayoutPage = isAuthPage || isPortfolioView || isAdminPage;

  // Dashboard pages have their own layout
  if (isDashboard) {
    // Show fullscreen loader with onboarding modal before onboarding is complete
    if (!isLoading && user && !user.profile?.onboarding_completed) {
      return (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center z-40">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center animate-pulse">
                <svg
                  className="w-8 h-8 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Setting up your workspace...
              </h2>
              <p className="text-blue-200/80 text-sm">
                Please wait while we prepare everything
              </p>
            </div>
          </div>
          <OnboardingModal
            isOpen={true}
            onComplete={() => {
              // Refresh the page to reload user data with onboarding_completed = true
              window.location.reload();
            }}
          />
        </>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {isLoading && <Loader />}
        <DashboardLayout
          userName={userName}
          userPicture={userPicture}
          userCredits={user?.profile?.credits || 0}
          userPlan={user?.plan || "free"}
          onLogout={logout}
          isResumeEditor={router.pathname.includes(
            "/dashboard/resume/[id]/edit",
          )}
        >
          <Component {...pageProps} />
        </DashboardLayout>
        <CookieBanner />
      </div>
    );
  }

  // For non-dashboard pages (landing, login, signup, etc.)
  return (
    <>
      <Toaster />
      {!isNoLayoutPage && <Navbar />}
      <Component {...pageProps} />
      {!isNoLayoutPage && <Footer />}
      <CookieBanner />
    </>
  );
}

// DashboardLayout Component
function DashboardLayout({
  children,
  userName,
  userPicture,
  userCredits = 0,
  userPlan = "free",
  onLogout,
}: {
  children: React.ReactNode;
  userName: string;
  userPicture: string | null;
  userCredits?: number;
  userPlan?: string;
  onLogout: () => Promise<void>;
  isResumeEditor?: boolean;
}) {
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", Icon: Squares2X2Icon },
    {
      name: "Resume Builder",
      href: "/dashboard/resume",
      Icon: DocumentTextIcon,
    },
    {
      name: "Portfolio Builder", // Added name back just in case
      href: "/dashboard/portfolio",
      Icon: BriefcaseIcon,
    },
    {
      name: "Cover Letters",
      href: "/dashboard/cover-letters",
      Icon: EnvelopeIcon,
    },
    {
      name: "ATS Checker",
      href: "/dashboard/ats",
      Icon: ClipboardDocumentCheckIcon,
    },
    { name: "Credits", href: "/dashboard/credits", Icon: CreditCardIcon },
  ];

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onLogout();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  return (
    <div className="min-h-screen flex flex-row bg-gray-50 font-sans relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[5%] w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[50%] right-[20%] w-80 h-80 bg-indigo-100/25 rounded-full blur-3xl"
        />
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 16px",
            borderRadius: "12px",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid #E5E7EB",
          },
          success: {
            style: {
              background: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
            },
            iconTheme: {
              primary: "#22C55E",
              secondary: "#F0FDF4",
            },
          },
          error: {
            style: {
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
            },
            iconTheme: {
              primary: "#EF4444",
              secondary: "#FEF2F2",
            },
          },
        }}
      />

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      {!router.pathname.includes("/dashboard/resume/[id]/edit") &&
        !router.pathname.includes("/dashboard/portfolio/[id]") && (
          <>
            {/* Mobile Toggle Button (Floating) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-black transition-all active:scale-95"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Light Theme Sidebar */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:fixed md:top-0 md:h-screen md:w-72 border-r border-gray-100 overflow-hidden print:hidden flex flex-col ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Subtle Pattern Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="dots"
                      x="0"
                      y="0"
                      width="30"
                      height="30"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="3" cy="3" r="2" fill="#3B82F6" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>

              <div className="flex flex-col h-full relative z-10">
                {/* Logo Area */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <Link href="/" className="flex items-center group">
                    <img
                      src={getAssetUrl("/logo.png")}
                      alt="Cloud9"
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex-grow flex flex-col py-4 px-3 gap-1 overflow-y-auto custom-scrollbar">
                  <nav className="space-y-0.5">
                    {navigationItems.map((item) => {
                      const isActive = router.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group relative flex items-center px-4 py-2 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                              : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                          }`}
                        >
                          <span className="flex items-center mr-3">
                            <item.Icon
                              className={`w-5 h-5 transition-transform ${
                                isActive
                                  ? "text-white"
                                  : "text-gray-400 group-hover:text-blue-600 group-hover:scale-110"
                              }`}
                            />
                          </span>
                          <span className="leading-none pt-0.5">
                            {item.name}
                          </span>
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl -z-10"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Credit & Plan Usage Section */}
                <div className="flex-shrink-0 px-3 pb-2">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        My Plan
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200 uppercase shadow-sm">
                        {userPlan}
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-600 font-medium">
                          Credits
                        </span>
                        <span className="text-gray-900 font-bold">
                          {userCredits}
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-blue-100">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (userCredits / 100) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {userPlan === "free" && (
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold py-2 px-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 group"
                      >
                        <SparklesIcon className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>

                {/* User Profile Section (Bottom) */}
                <div className="flex-shrink-0 border-t border-gray-100 p-3 bg-gray-50/50">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {userPicture ? (
                        <img
                          src={userPicture}
                          alt={userName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold shadow-sm">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {userName || "Account"}
                      </p>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-xs text-gray-500 hover:text-blue-600 transition-colors block"
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSignOutClick();
                      }}
                      title="Sign out"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative ${
          !router.pathname.includes("/dashboard/resume/[id]/edit") &&
          !router.pathname.includes("/dashboard/portfolio/[id]")
            ? "md:ml-72"
            : ""
        }`}
      >
        <main className="flex-1 w-full">{children}</main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutModal}
        title="Sign out?"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isSigningOut}
        onConfirm={handleConfirmSignOut}
        onClose={handleCancelSignOut}
      />

      {/* Plan Upgrade Modal (Redesigned) */}
      <PlanUpgradeModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={userPlan}
      />
    </div>
  );
}
