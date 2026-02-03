import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAPIAuth } from "../../../hooks/useAPIAuth";
import { CoverLetter } from "../../../lib/types";
import { EnvelopeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../../components/ConfirmationModal";
import PlanUpgradeModal from "../../../components/PlanUpgradeModal";
import { useAuth } from "../../../lib/authUtils";
import { PLAN_LIMITS } from "../../../lib/subscription";

export default function CoverLettersDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { get, delete: deleteRequest } = useAPIAuth();

  const userPlan = (user?.plan || "free") as keyof typeof PLAN_LIMITS;
  const coverLetterLimit = PLAN_LIMITS[userPlan]?.cover_letters || 1;

  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setLoading(true);
      const response = await get<CoverLetter[]>("/api/cover-letters");
      if (response.success) {
        setCoverLetters(response.data || []);
      } else {
        toast.error("Failed to fetch cover letters");
      }
    } catch (err) {
      toast.error("Failed to load cover letters");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await deleteRequest(`/api/cover-letters/${deleteId}`);
      if (response.success) {
        setCoverLetters((prev) => prev.filter((c) => c.id !== deleteId));
        toast.success("Cover letter deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateClick = () => {
    // Check plan limit
    if (
      coverLetterLimit !== Infinity &&
      coverLetters.length >= coverLetterLimit
    ) {
      setShowUpgradeModal(true);
      return;
    }
    router.push("/dashboard/cover-letters/create");
  };

  const filteredItems = coverLetters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Head>
        <title>Cover Letters - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50/80">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-shrink-0">
                <h1 className="text-lg font-bold text-gray-900">
                  Cover Letters
                </h1>
                <p className="text-[10px] text-gray-400">
                  {coverLetters.length}
                  {coverLetterLimit !== Infinity && (
                    <span> /{coverLetterLimit}</span>
                  )}
                  {" letter"}
                  {coverLetters.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Letter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No cover letters yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Create tailored cover letters for your job applications in
                seconds.
              </p>
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create Your First Letter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((letter) => (
                <div
                  key={letter.id}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5 flex flex-col h-full relative"
                >
                  <div
                    className="flex-1 mb-4 cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/cover-letters/${letter.id}`)
                    }
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <EnvelopeIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                      {letter.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {letter.company_name
                        ? `For ${letter.company_name}`
                        : "General Application"}
                      {letter.job_title ? ` - ${letter.job_title}` : ""}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(letter.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(letter.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Cover Letter"
          message="Are you sure you want to delete this cover letter? This action cannot be undone."
          confirmText="Delete"
          isDestructive={true}
        />
        <PlanUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={userPlan}
          limitedFeature="Unlimited Cover Letters"
          errorMessage={`You've reached your cover letter limit (${coverLetterLimit} letter${coverLetterLimit !== 1 ? "s" : ""}). Upgrade to Professional to create unlimited cover letters.`}
        />
      </div>
    </>
  );
}
