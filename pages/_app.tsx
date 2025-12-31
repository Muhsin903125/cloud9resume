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
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";

import * as gtag from "../lib/gtag";
import CookieBanner from "../components/common/CookieBanner";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const { user, logout } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [userPicture, setUserPicture] = useState<string | null>(null);

  // Update user info when user changes
  useEffect(() => {
    if (user) {
      setUserName(user.name || user.email?.split("@")[0] || "User");
      setUserPicture(user.picture || null);
    }
  }, [user]);

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

  // No-layout pages don't need navbar/footer (includes admin pages)
  if (isNoLayoutPage) {
    return (
      <>
        {isLoading && <Loader />}
        <Component {...pageProps} />
      </>
    );
  }

  // Regular pages with navbar and footer
  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && <Loader />}
      <Toaster position="bottom-right" />
      <CookieBanner />
      <Navbar />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}

function DashboardLayout({
  children,
  userName,
  userPicture,
  userCredits = 0,
  onLogout,
}: {
  children: React.ReactNode;
  userName: string;
  userPicture: string | null;
  userCredits?: number;
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
    { name: "Dashboard", href: "/dashboard", Icon: DocumentIcon },
    { name: "Resume Builder", href: "/dashboard/resume", Icon: DocumentIcon },
    {
      name: "Portfolio Builder",
      href: "/dashboard/portfolio",
      Icon: PortfolioIcon,
    },
    { name: "ATS Checker", href: "/dashboard/ats", Icon: AnalyticsIcon },
    { name: "Credits", href: "/dashboard/credits", Icon: TemplateIcon },
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

            <div
              className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-sm md:w-64 md:border-r md:border-gray-200 ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-gray-200">
                  <Link href="/" className="flex items-center  ">
                    <img
                      src={getAssetUrl("/logo.png")}
                      alt="Cloud9Profile Logo"
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-grow flex flex-col py-6 px-4 gap-1 overflow-y-auto">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          router.pathname === item.href
                            ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <span
                          style={{
                            marginRight: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <item.Icon
                            size={20}
                            className={
                              router.pathname === item.href
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-600"
                            }
                          />
                        </span>
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="flex-shrink-0 border-t border-gray-200 px-4 py-4 m-4 mt-auto rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {userPicture ? (
                          <img
                            src={userPicture}
                            alt={userName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {userName || "Account"}
                        </p>
                        <div className="flex items-center mt-0.5 gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            ⚡ {userCredits} Credits
                          </span>
                          <button
                            onClick={() => setShowPlanModal(true)}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Get More
                          </button>
                        </div>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={handleSignOutClick}
                      title="Sign out"
                      className="flex-shrink-0 ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
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
