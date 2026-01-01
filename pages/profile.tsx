import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../lib/authUtils";
import { apiClient } from "../lib/apiClient";
import { toast } from "react-hot-toast";

const ProfilePage: NextPage = () => {
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
    <>
      <Head>
        <title>Profile - Cloud9</title>
      </Head>

      <div className="min-h-screen bg-gray-50/80">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Avatar Section */}
            <div className="flex justify-center pt-6 pb-4">
              <div className="relative group">
                {formData.picture ? (
                  <img
                    src={formData.picture}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="px-5 pb-5 space-y-3">
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 text-gray-400 border border-gray-100 rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    user?.plan === "pro_plus"
                      ? "bg-purple-100 text-purple-600"
                      : user?.plan === "pro"
                      ? "bg-blue-100 text-blue-600"
                      : user?.plan === "starter"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {user?.plan === "pro_plus"
                    ? "PRO+"
                    : user?.plan?.toUpperCase() || "FREE"}
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {loading ? "..." : "Save"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Actions */}
            <div className="px-5 py-4 flex items-center justify-between">
              <button
                onClick={logout}
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xs p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Delete Account
            </p>
            <p className="text-xs text-gray-500 mb-3">Type DELETE to confirm</p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteText !== "DELETE" || deleting}
                className="flex-1 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
