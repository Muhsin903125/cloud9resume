import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  PLAN_LIMITS,
  CREDIT_COSTS,
  getPlanName,
  PlanType,
} from "../../lib/subscription";
import { CreditConfirmModal } from "../modals/CreditConfirmModal";
import { apiClient } from "../../lib/apiClient";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (username: string, replaceExisting?: string) => Promise<void>;
  currentSlug: string;
  portfolioId: string;
  userPlan: PlanType;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  currentSlug,
  portfolioId,
  userPlan,
}) => {
  const [username, setUsername] = useState(currentSlug || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [existingOwner, setExistingOwner] = useState<string | null>(null);
  const [isOwnedByUser, setIsOwnedByUser] = useState(false);
  const [publishedCount, setPublishedCount] = useState(0);
  const [existingPortfolios, setExistingPortfolios] = useState<
    Array<{ id: string; slug: string }>
  >([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showReplaceOption, setShowReplaceOption] = useState(false);
  const [selectedReplace, setSelectedReplace] = useState<string | null>(null);

  const limit = (
    PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  ).portfolios;
  const isAtLimit = publishedCount >= limit && limit !== Infinity;

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    try {
      const { data } = await apiClient.get("/credits");
      if (data?.success) {
        setBalance(data.data.stats.current);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const publishCost = CREDIT_COSTS.portfolio_publish;

  // Check username availability (debounced)
  const checkUsername = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      try {
        const token = localStorage.getItem("x_user_auth_token");
        const res = await fetch(
          `/api/portfolio/check-username?username=${encodeURIComponent(
            slug
          )}&portfolioId=${portfolioId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        setIsAvailable(data.available);
        setIsOwnedByUser(data.ownedByUser || false);
        setExistingOwner(data.existingOwner || null);
        setPublishedCount(data.publishedCount || 0);
        setExistingPortfolios(data.existingPortfolios || []);

        // Show replace option if at limit
        if (!data.available && data.ownedByUser) {
          setShowReplaceOption(true);
        } else if (data.publishedCount >= limit && limit !== Infinity) {
          setShowReplaceOption(true);
        } else {
          setShowReplaceOption(false);
        }
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setIsChecking(false);
      }
    },
    [portfolioId, limit]
  );

  // Debounced check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      setUsername(currentSlug || "");
      checkUsername(currentSlug || "");
    }
  }, [isOpen, currentSlug]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setUsername(value);
    setIsAvailable(null);
  };

  const handlePublish = () => {
    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!isAvailable && !isOwnedByUser && !selectedReplace) {
      toast.error("This username is not available");
      return;
    }

    setShowConfirm(true);
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    setShowConfirm(false);
    try {
      await onPublish(username, selectedReplace || undefined);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Publish Portfolio
            </h2>
            <p className="text-green-100 text-sm mt-1">
              Make your portfolio live at cloud9profile.com/{username || "..."}
            </p>
          </div>

          <div className="p-6">
            {/* Plan Limits Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your Plan:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {userPlan}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Published Portfolios:</span>
                <span
                  className={`font-semibold ${
                    isAtLimit ? "text-amber-600" : "text-gray-900"
                  }`}
                >
                  {publishedCount} / {limit === Infinity ? "∞" : limit}
                </span>
              </div>
            </div>

            {/* Username Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your portfolio URL
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2.5 rounded-l-lg border border-r-0 border-gray-300">
                  cloud9profile.com/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="your-name"
                  className={`flex-1 px-3 py-2.5 border rounded-r-lg focus:outline-none focus:ring-2 ${
                    isAvailable === true
                      ? "border-green-300 focus:ring-green-500"
                      : isAvailable === false && !isOwnedByUser
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={isPublishing}
                />
              </div>

              {/* Status indicator */}
              <div className="mt-2 flex items-center gap-2 text-sm">
                {isChecking ? (
                  <span className="text-gray-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 animate-spin"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Checking availability...
                  </span>
                ) : isAvailable === true ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Available!
                  </span>
                ) : isAvailable === false && isOwnedByUser ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    You already use this URL
                  </span>
                ) : isAvailable === false ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Not available
                  </span>
                ) : username.length > 0 && username.length < 3 ? (
                  <span className="text-gray-500">Minimum 3 characters</span>
                ) : null}
              </div>
            </div>

            {/* Replace Existing Option */}
            {showReplaceOption && existingPortfolios.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 mb-2 font-medium">
                  {isAtLimit
                    ? "You've reached your portfolio limit. Replace an existing one?"
                    : "This URL is used by another portfolio. Replace it?"}
                </p>
                <div className="space-y-2">
                  {existingPortfolios.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedReplace === p.id
                          ? "bg-amber-100 border border-amber-300"
                          : "hover:bg-amber-100/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="replace"
                        value={p.id}
                        checked={selectedReplace === p.id}
                        onChange={() => setSelectedReplace(p.id)}
                        className="text-amber-600"
                      />
                      <span className="text-sm text-gray-700">
                        Replace portfolio at <strong>/{p.slug}</strong>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={isPublishing}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={
                  isPublishing ||
                  isChecking ||
                  !username ||
                  username.length < 3 ||
                  (isAvailable === false &&
                    !isOwnedByUser &&
                    !selectedReplace) ||
                  (isAtLimit && !selectedReplace)
                }
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {selectedReplace ? "Replace & Publish" : "Publish"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreditConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmPublish}
        title="Ready to go live?"
        description="Publishing your portfolio makes it accessible to everyone at your chosen URL. You can update it anytime (costs 1 credit per update)."
        cost={publishCost}
        balance={balance}
        isLoading={isPublishing}
      />
    </>
  );
};
