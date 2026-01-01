import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authUtils";
import {
  HomeIcon,
  UsersIcon,
  TicketIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Verify Admin Status on Mount
  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Wait for Auth loading
      if (isLoading) return;

      if (!isAuthenticated || !user) {
        router.push("/login?redirect=" + router.pathname);
        return;
      }

      // 2. Verify Admin Status via secure API
      try {
        const token =
          localStorage.getItem("x_user_auth_token") ||
          localStorage.getItem("auth_token");

        // We use the stats API as a permission check because it's protected by the same verifyAdmin middleware
        const res = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          setIsAdmin(true);
          setCheckingAdmin(false);
        } else {
          // If 401/403 or other error
          console.warn("Admin check failed:", res.status);
          router.push("/");
        }
      } catch (err) {
        console.error("Admin check error:", err);
        router.push("/");
      }
    };
    checkAdmin();
  }, [isLoading, isAuthenticated, user, router]);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Users", href: "/admin/users", icon: UsersIcon },
    { name: "Coupons", href: "/admin/coupons", icon: TicketIcon },
    // { name: "Reports", href: "/admin/reports", icon: ChartBarIcon },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-sm font-sans">
      {/* Sidebar */}
      {/* Modern Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-72"
        } bg-[#111827] text-white flex flex-col fixed h-full z-50 transition-all duration-300 ease-in-out border-r border-[#1F2937] shadow-xl`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b border-[#1F2937] px-6">
          <Link href="/admin">
            <div className="flex items-center justify-center cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <img
                  src="/logo.png"
                  alt="Cloud9"
                  className="h-12 w-auto relative rounded-lg object-contain"
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center ${
                    sidebarCollapsed ? "justify-center" : "gap-4"
                  } px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  {/* Active Indicator Line (Left) */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full"></div>
                  )}

                  <item.icon
                    className={`flex-shrink-0 transition-colors ${
                      sidebarCollapsed ? "w-6 h-6" : "w-5 h-5"
                    } ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm tracking-wide">
                      {item.name}
                    </span>
                  )}

                  {/* Subtle Glow Effect on Hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#1F2937] bg-[#0F1523]">
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            } px-4 py-3 mb-4 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200`}
          >
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold uppercase tracking-wider">
                Collapse
              </span>
            )}
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => logout()}
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "gap-3"
            } w-full px-4 py-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200 group border border-red-500/10 hover:border-red-500/30`}
            title={sidebarCollapsed ? "Sign Out" : undefined}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "288px",
          minHeight: "100vh",
          transition: "margin-left 300ms",
        }}
        className="bg-gray-50/50"
      >
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center bg-white border border-gray-200/60 rounded-lg p-3 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <h1 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              {title}
            </h1>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-700">
                  {user?.email}
                </p>
                <p className="text-[10px] font-medium bg-blue-50 text-blue-600 inline-block px-1.5 rounded mt-0.5">
                  ADMINISTRATOR
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
