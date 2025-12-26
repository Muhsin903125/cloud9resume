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
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-56"
        } bg-slate-900 text-white flex flex-col fixed h-full z-50 transition-all duration-300 shadow-xl border-r border-slate-800`}
      >
        {/* Logo Section */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <Link href="/admin">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src="/logo.png"
                alt="Cloud9Profile"
                className="h-6 w-6 rounded object-contain"
              />
              {!sidebarCollapsed && (
                <span className="text-sm font-bold tracking-wide text-white">
                  Cloud9<span className="text-blue-400">Admin</span>
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center ${
                    sidebarCollapsed ? "justify-center" : "gap-3"
                  } px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? "bg-blue-600/90 text-white shadow-sm ring-1 ring-blue-500"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-white"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-xs tracking-wide">
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mx-3 mb-2 px-2 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded transition-colors text-xs text-slate-400 flex items-center justify-center gap-2 border border-slate-800"
        >
          <svg
            className={`w-3 h-3 transition-transform ${
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
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          {!sidebarCollapsed && <span>Collapse Menu</span>}
        </button>

        {/* Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => logout()}
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "gap-3"
            } px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md w-full transition-colors`}
            title={sidebarCollapsed ? "Sign Out" : undefined}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-medium text-xs">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarCollapsed ? "64px" : "224px", // 16px (w-16) vs 224px (w-56)
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
