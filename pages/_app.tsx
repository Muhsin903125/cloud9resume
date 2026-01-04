import type { AppProps } from "next/app";
import { getAssetUrl } from "../lib/common-functions";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import PlanSelectionModal from "../components/PlanSelectionModal";
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
            "/dashboard/resume/[id]/edit"
          )}
        >
          <Component {...pageProps} />
        </DashboardLayout>
        <CookieBanner />
      </div>
    );
  }

  // ... rest of the file remains the same

// ... DashboardLayout implementation below
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
    { name: "Resume Builder", href: "/dashboard/resume", Icon: DocumentTextIcon },
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
    { name: "ATS Checker", href: "/dashboard/ats", Icon: ClipboardDocumentCheckIcon },
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
    <div className="min-h-screen flex flex-row bg-gray-50 font-sans">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1F2937",
            color: "#fff",
            fontSize: "14px",
            padding: "16px",
            borderRadius: "8px",
          },
          success: {
            style: {
              background: "#1F2937",
              borderLeft: "4px solid #10B981",
            },
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background: "#1F2937",
              borderLeft: "4px solid #EF4444",
            },
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
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
        !router.pathname.includes("/dashboard/resume/[id]/templates") &&
        !router.pathname.includes("/dashboard/portfolio/[id]") && (
          <>
            {/* Mobile Toggle Button (Floating) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-black transition-all active:scale-95"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Light Theme Sidebar with SVG Pattern */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:w-72 border-r border-gray-200 overflow-hidden print:hidden flex flex-col ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* SVG Background Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="sidebar-dots"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#sidebar-dots)" />
                </svg>
              </div>

              <div className="flex flex-col h-full relative z-10">
                {/* Logo Area */}
                <div className="flex items-center justify-between flex-shrink-0 px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                  <Link href="/" className="flex items-center group">
                    <img
                      src={getAssetUrl("/logo.png")}
                      alt="Cloud9"
                      className="h-9 w-auto object-contain"
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
                <div className="flex-grow flex flex-col py-4 px-3 gap-1 overflow-y-auto">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const isActive = router.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-blue-50 text-blue-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full"></div>
                          )}

                          <span className="flex items-center mr-3">
                            <item.Icon
                              className={`w-5 h-5 transition-colors ${
                                isActive
                                  ? "text-blue-600"
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            />
                          </span>
                          <span className="leading-none pt-0.5">
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Credit & Plan Usage Section */}
                <div className="flex-shrink-0 px-4 pb-2">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        My Plan
                      </span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                        {userPlan}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Credits</span>
                        <span className="text-gray-900 font-bold">{userCredits}</span>
                      </div>
                      {/* Simple visual bar (capped at 50 for visual nicety, or purely decorative) */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((userCredits / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {userPlan === "free" && (
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-gray-900 to-black text-white text-xs font-bold py-2 px-3 rounded-lg hover:shadow-lg transition-all active:scale-95 group"
                      >
                        <SparklesIcon className="w-3.5 h-3.5 text-yellow-300 group-hover:animate-pulse" />
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>

                {/* User Profile Section (Bottom) */}
                <div className="flex-shrink-0 border-t border-gray-100 p-3 bg-gray-50/50">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {userPicture ? (
                        <img
                          src={userPicture}
                          alt={userName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-600 text-xs font-bold border border-gray-200 shadow-sm">
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
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      <div className="flex-1 flex flex-col min-w-0 relative">
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

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSuccess={() => {
          // Optional: Reload page to refresh credits
          window.location.reload();
        }}
      />
    </div>
  );
}

}