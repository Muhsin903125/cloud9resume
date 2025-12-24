import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/authUtils";
import { apiClient } from "../../lib/apiClient";
import DashboardLayout from "../_app"; // Assuming DashboardLayout is exported or wrapped in _app
import { Toaster, toast } from "react-hot-toast";

// Since _app wrap all pages, we just export the page content
// BUT our _app uses DashboardLayout conditionally. We need to respect that structure.
// The dashboard layout is automatic for anything under /dashboard if configured in _app.
// Let's check _app again.
// In _app.tsx, it wraps {children} with DashboardLayout logic (the sidebar).
// So I just need to return the page content.

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    picture: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        picture: user.picture || "",
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.patch("/auth/update-profile", {
        name: formData.name,
        picture: formData.picture,
      });

      if (res.data && res.data.success) {
        toast.success("Profile updated successfully");
        // Update local storage to reflect changes immediately
        localStorage.setItem("user_name", formData.name);
        if (formData.picture)
          localStorage.setItem("user_picture", formData.picture);

        // Reload to refresh auth state
        window.location.reload();
      } else {
        toast.error(res.data?.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Head>
        <title>Account Settings - Cloud9</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account preferences and personal details.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {formData.picture ? (
                <img
                  src={formData.picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://ui-avatars.com/api/?name=" +
                      (formData.name || "User") +
                      "&background=0D8ABC&color=fff";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border-4 border-gray-50">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              {/* Overlay for picture edit could go here */}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {formData.name || "User"}
              </h2>
              <p className="text-sm text-gray-500 font-mono">
                {formData.email}
              </p>
              <div
                className={`mt-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block border ${
                  user?.plan === "pro_plus"
                    ? "text-purple-600 bg-purple-50 border-purple-100"
                    : user?.plan === "pro"
                    ? "text-blue-600 bg-blue-50 border-blue-100"
                    : user?.plan === "starter"
                    ? "text-orange-600 bg-orange-50 border-orange-100"
                    : "text-green-600 bg-green-50 border-green-100"
                }`}
              >
                {user?.plan === "pro_plus"
                  ? "Pro Plus"
                  : user?.plan
                  ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                  : "Free"}{" "}
                Plan
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 sm:p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter your name"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed.
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="text"
                value={formData.picture}
                onChange={(e) =>
                  setFormData({ ...formData, picture: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-sm"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter a public URL for your profile picture.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  name: user?.name || "",
                  picture: user?.picture || "",
                })
              }
              className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 transition disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-red-50 border border-red-100 rounded-xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-6">
          Sign out of your account on this device.
        </p>
        <button
          onClick={logout}
          className="px-6 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
