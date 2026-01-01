import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../lib/authUtils";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";
import PlanSelectionModal from "../../components/PlanSelectionModal";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    picture: "",
    gender: "",
    dob: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [memberSince, setMemberSince] = useState("—");
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState("free");
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get("/user/profile");
        if (res.data?.success && res.data?.profile) {
          const p = res.data.profile;
          setFormData({
            name: p.name || user.name || "",
            email: p.email || user.email || "",
            picture: p.picture || user.picture || "",
            gender: p.gender || "",
            dob: p.dob || "",
          });
          // Set credits, plan, and memberSince from API
          if (p.credits !== undefined) setCredits(p.credits);
          if (p.plan) setPlan(p.plan);
          if (p.created_at) {
            setMemberSince(
              new Date(p.created_at).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            );
          }
        } else {
          // Fallback to user context
          setFormData({
            name: user.name || "",
            email: user.email || "",
            picture: user.picture || "",
            gender: "",
            dob: "",
          });
        }
      } catch {
        // Fallback to user context
        setFormData({
          name: user.name || "",
          email: user.email || "",
          picture: user.picture || "",
          gender: "",
          dob: "",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Update memberSince and credits when profile data loads
  useEffect(() => {
    const createdAt = (user as any)?.created_at;
    if (createdAt) {
      setMemberSince(
        new Date(createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      );
    }
    if (user?.profile?.credits !== undefined) {
      setCredits(user.profile.credits);
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.patch("/auth/update-profile", {
        name: formData.name,
        picture: formData.picture,
        gender: formData.gender,
        dob: formData.dob,
      });
      if (res.data?.success) {
        toast.success("Saved");
        localStorage.setItem("user_name", formData.name);
        if (formData.picture)
          localStorage.setItem("user_picture", formData.picture);
        window.location.reload();
      } else {
        toast.error("Failed");
      }
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const res = await apiClient.postForm(
        "/user/upload-avatar",
        formDataUpload
      );
      if (res.data?.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, picture: res.data.url }));
        localStorage.setItem("user_picture", res.data.url);
        toast.success("Photo uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await apiClient.delete("/user/delete");
      if (res.data?.success) {
        logout();
        window.location.href = "/";
      }
    } catch {
      toast.error("Failed");
    }
    setDeleting(false);
  };

  const initials = formData.name ? formData.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-gray-50/80 py-4 px-4">
      <Head>
        <title>Profile</title>
      </Head>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="max-w-6xl mx-auto space-y-3">
        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  {formData.picture ? (
                    <img
                      src={formData.picture}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {uploading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {formData.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {formData.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        plan === "pro_plus"
                          ? "bg-purple-100 text-purple-600"
                          : plan === "pro"
                          ? "bg-blue-100 text-blue-600"
                          : plan === "starter"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {plan === "pro_plus"
                        ? "PRO+"
                        : plan.toUpperCase() || "FREE"}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      • Since {memberSince}
                    </span>
                  </div>
                </div>

                {/* Credits + Upgrade */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <span className="text-yellow-500 text-xs">⚡</span>
                    <span className="text-sm font-bold text-gray-900">
                      {credits}
                    </span>
                    <span className="text-[9px] text-gray-400">credits</span>
                  </div>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="inline-block px-3 py-1 text-[10px] font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Profile */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Edit Profile
              </p>
              <form onSubmit={handleUpdate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-md cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? "..." : "Save"}
                  </button>
                </div>
              </form>
            </div>

            {/* Account */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Account
              </p>
              <p className="text-[10px] text-gray-400 mb-3">
                Manage settings and preferences.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition flex items-center gap-1.5"
                >
                  <svg
                    className="w-3 h-3"
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
                  Sign Out
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition flex items-center gap-1.5"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xs p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Delete Account
            </p>
            <p className="text-[10px] text-gray-500 mb-3">
              Type DELETE to confirm.
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md mb-3 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteText !== "DELETE" || deleting}
                className="flex-1 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </div>
  );
}
