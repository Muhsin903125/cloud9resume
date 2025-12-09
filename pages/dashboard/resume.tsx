import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Resume } from "../../lib/types";
import { PlusIcon, SearchIcon } from "../../components/Icons";
import SharedModal from "../../components/SharedModal";
import { ResumeCard } from "../../components/ResumeCard";
import { ResumePreviewModal } from "../../components/ResumePreviewModal";
import FormField from "../../components/FormField";
import { useAPIAuth } from "../../hooks/useAPIAuth";
import { toast } from "react-hot-toast";

const ResumeDashboard = () => {
  const router = useRouter();
  const { get, post, delete: deleteRequest } = useAPIAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Preview State
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [previewSections, setPreviewSections] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await get<Resume[]>("/api/resumes");

      if (response.success) {
        setResumes(response.data || []);
      } else {
        setError(response.error || "Failed to fetch resumes");
      }
    } catch (err) {
      setError("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) return;

    try {
      setIsCreating(true);
      setError("");

      const response = await post<Resume>("/api/resumes", {
        title: newResumeTitle,
      });

      if (response.success && response.data) {
        setShowNewModal(false);
        setNewResumeTitle("");
        toast.success("Resume created successfully");
        router.push(`/dashboard/resume/${response.data.id}/edit`);
      } else {
        toast.error(response.error || "Failed to create resume");
      }
    } catch (err) {
      toast.error("Failed to create resume");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const response = await deleteRequest(`/api/resumes/${id}`);

      if (response.success) {
        setResumes(resumes.filter((r) => r.id !== id));
        toast.success("Resume deleted");
      } else {
        toast.error(response.error || "Failed to delete resume");
      }
    } catch (err) {
      toast.error("Failed to delete resume");
    }
  };

  const handleDuplicateResume = async (id: string) => {
    // Placeholder for duplication logic
    toast("Duplication feature coming soon!", { icon: "🚧" });
  };

  const handlePreviewResume = async (resume: any) => {
    try {
      setFetchingPreview(true);
      // Fetch full details including sections
      // If the list API already returns sections, we might skip this, but safer to fetch
      const response = await get<any>(`/api/resumes/${resume.id}`);
      if (response.success && response.data) {
        setPreviewResume(response.data);
        setPreviewSections(
          response.data.resume_sections || response.data.sections || []
        );
        setShowPreview(true);
      } else {
        toast.error("Failed to load resume details");
      }
    } catch (err) {
      toast.error("Failed to load preview");
    } finally {
      setFetchingPreview(false);
    }
  };

  const filteredResumes = resumes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.job_title &&
        r.job_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Head>
        <title>My Resumes - Cloud9 Resume</title>
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and organize your professional resumes
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PlusIcon size={20} color="white" />
                New Resume
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats / Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} color="#9CA3AF" />
              </div>
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
              />
            </div>

            {/* Simple Stats Pucks */}
            <div className="flex gap-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                Total:{" "}
                <span className="text-gray-900 font-bold ml-1">
                  {resumes.length}
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : filteredResumes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                <DocumentIcon size={64} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchQuery ? "No resumes found" : "No resumes yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first resume to get started"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon size={20} color="white" />
                  Create Resume
                </button>
              )}
            </div>
          ) : (
            /* Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={handleDeleteResume}
                  onDuplicate={handleDuplicateResume}
                  onPreview={handlePreviewResume}
                />
              ))}

              {/* "Add New" Card */}
              <button
                onClick={() => setShowNewModal(true)}
                className="group flex flex-col items-center justify-center h-full min-h-[280px] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                  <PlusIcon
                    size={24}
                    className="text-gray-400 group-hover:text-blue-600"
                  />
                </div>
                <span className="font-semibold text-gray-900 group-hover:text-blue-700">
                  Create New Resume
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  Start from scratch
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <SharedModal
          isOpen={showNewModal}
          onClose={() => {
            setShowNewModal(false);
            setNewResumeTitle("");
          }}
          title="Create New Resume"
          size="md"
        >
          <div className="space-y-4">
            <FormField
              label="Resume Title"
              name="resumeTitle"
              value={newResumeTitle}
              onChange={(e: any) =>
                setNewResumeTitle(e.target ? e.target.value : e)
              }
              placeholder="e.g., Senior Full Stack Developer"
              required
              helpText="Give your resume a recognizable name."
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResume}
                disabled={!newResumeTitle.trim() || isCreating}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-all ${
                  !newResumeTitle.trim() || isCreating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
              >
                {isCreating ? "Creating..." : "Create Resume"}
              </button>
            </div>
          </div>
        </SharedModal>

        {/* Preview Modal */}
        <ResumePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          resume={previewResume || {}}
          sections={previewSections}
        />

        {/* Loading Overlay for Preview Fetch */}
        {fetchingPreview && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="font-medium text-gray-700">
                Loading preview...
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Simple Document Icon for Empty State if not imported
const DocumentIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

export default ResumeDashboard;
