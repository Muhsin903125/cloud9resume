import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import { useAuth } from "../lib/authUtils";
import {
  DocumentIcon,
  PortfolioIcon,
  AnalyticsIcon,
  TemplateIcon,
} from "../components/Icons";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
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

  const authPages = ["/login", "/signup"];
  const isDashboard = router.pathname.startsWith("/dashboard");
  const isAuthPage =
    authPages.includes(router.pathname) || router.pathname.startsWith("/auth/");

  // Dashboard pages have their own layout
  if (isDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardLayout
          userName={userName}
          userPicture={userPicture}
          onLogout={logout}
          isResumeEditor={router.pathname.includes(
            "/dashboard/resume/[id]/edit"
          )}
        >
          <Component {...pageProps} />
        </DashboardLayout>
      </div>
    );
  }

  // Auth pages don't need navbar/footer
  if (isAuthPage) {
    return <Component {...pageProps} />;
  }

  // Regular pages with navbar and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-right" />
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
  onLogout,
}: {
  children: React.ReactNode;
  userName: string;
  userPicture: string | null;
  onLogout: () => Promise<void>;
  isResumeEditor?: boolean;
}) {
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <div className="min-h-screen flex flex-row bg-gray-50">
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
      {/* Sidebar - Hide on Resume Editor */}
      {!router.pathname.includes("/dashboard/resume/[id]/edit") &&
        !router.pathname.includes("/dashboard/portfolio/[id]") && (
          <div className="hidden md:block md:w-64 md:flex-shrink-0 md:border-r md:border-gray-200 md:bg-white md:shadow-sm">
            <div className="flex flex-col h-screen sticky top-0 overflow-y-auto bg-white">
              <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Cloud9</span>
              </div>
              <div className="flex-grow flex flex-col py-2">
                <nav className="flex-1 px-4 space-y-1">
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        router.pathname === item.href
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        style={{
                          marginRight: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          lineHeight: 1,
                        }}
                      >
                        <item.Icon
                          size={20}
                          color={
                            router.pathname === item.href ? "white" : "#666666"
                          }
                        />
                      </span>
                      {item.name}
                    </a>
                  ))}
                </nav>
                <div className="flex-shrink-0 border-t border-gray-200 px-4 py-1">
                  <div className=" ">
                    {/* View Profile Link */}

                    {/* User Info with Sign Out */}
                    <div className="flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors p-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {userPicture ? (
                            <img
                              src={userPicture}
                              alt={userName}
                              // onError={}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userName || "Account"}
                          </p>
                          {/* <p className="text-xs text-gray-600">Signed in</p> */}
                          <Link
                            href="/dashboard"
                            className="w-full text-left hover:bg-gray-50 rounded-lg transition-colors   block text-xs text-gray-600 hover:text-gray-900"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>

                      {/* Sign Out Button */}
                      <button
                        onClick={handleSignOutClick}
                        title="Sign out"
                        className="flex-shrink-0 ml-2 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
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
            </div>
          </div>
        )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">{children}</div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutModal}
        title="Sign out?"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isSigningOut}
        onConfirm={handleConfirmSignOut}
        onCancel={handleCancelSignOut}
      />
    </div>
  );
}
