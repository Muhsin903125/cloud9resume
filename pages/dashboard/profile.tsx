import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/authUtils";
import { apiClient } from "../../lib/apiClient";
import { Toaster, toast } from "react-hot-toast";
import { AvatarUpload } from "../../components/profile/AvatarUpload";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    picture: "",
    isEmailVerified: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        picture: user.picture || "",
        isEmailVerified: (user as any).email_verified || false,
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
        localStorage.setItem("user_name", formData.name);
        if (formData.picture)
          localStorage.setItem("user_picture", formData.picture);

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

  const handleAvatarUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, picture: url }));
  };

  const sendOtp = async () => {
    try {
      setVerifyingOtp(true);
      const res = await apiClient.post("/auth/send-otp", {});
      if (res.data.success) {
        toast.success("Verification code sent to your email");
        setOtpSent(true);
        setShowOtpModal(true);
      } else {
        toast.error(res.data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await apiClient.post("/auth/verify-otp", { otp: otpCode });
      if (res.data.success) {
        toast.success("Email verified successfully!");
        setFormData((prev) => ({ ...prev, isEmailVerified: true }));
        setShowOtpModal(false);
        // Update user state if possible or reload
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(res.data.error || "Invalid verification code");
      }
    } catch (error) {
      toast.error("Failed to verify code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete("/user/delete");
      if (res.data.success) {
        toast.success("Account deleted successfully");
        logout();
        window.location.href = "/";
      } else {
        toast.error(res.data.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
      console.error(error);
    } finally {
      setIsDeleting(false);
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
            <AvatarUpload
              currentAvatarUrl={formData.picture}
              name={formData.name}
              onUploadSuccess={handleAvatarUpload}
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {formData.name || "User"}
                {formData.isEmailVerified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200 font-medium flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
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
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed pr-24"
                />
                {/* Verify button removed as per requirements */}
                {/* {!formData.isEmailVerified && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={verifyingOtp}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    {verifyingOtp ? "Sending..." : "Verify"}
                  </button>
                )} */}
              </div>
              <p className="text-xs text-gray-400 mt-1 flex justify-between">
                <span>Email cannot be changed.</span>
                {!formData.isEmailVerified && (
                  <span className="text-orange-500 font-medium">
                    Unverified
                  </span>
                )}
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
                  isEmailVerified: formData.isEmailVerified,
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
          Irreversible actions for your account.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={logout}
            className="px-6 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition shadow-sm"
          >
            Sign Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm border border-transparent"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white px-6 py-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              We sent a verification code to <strong>{formData.email}</strong>.
              <br />
              Enter it below to verify your email.
            </p>

            <input
              type="text"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full text-center text-3xl tracking-[0.5em] font-bold py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-6 font-mono"
              placeholder="000000"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                disabled={verifyingOtp || otpCode.length !== 6}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {verifyingOtp ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verify Code"
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Didn't receive code?{" "}
              <button
                onClick={sendOtp}
                className="text-blue-600 hover:underline"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white px-6 py-8 rounded-xl shadow-2xl max-w-md w-full text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Account?
            </h3>
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-6">
              <p className="text-red-800 text-sm font-medium">
                Warning: This action is permanent and cannot be undone.
              </p>
              <ul className="text-red-700 text-xs mt-2 list-disc pl-4 space-y-1">
                <li>All your profiles and resumes will be deleted.</li>
                <li>Your subscription will be cancelled immediately.</li>
                <li>All stored data will be permanently removed.</li>
              </ul>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              To confirm, please type <strong>DELETE</strong> in the box below.
            </p>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-6 font-mono"
              placeholder="Type DELETE to confirm"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
