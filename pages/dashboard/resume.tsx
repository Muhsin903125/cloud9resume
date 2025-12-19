import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Resume } from "../../lib/types";
import { PlusIcon, SearchIcon, DocumentIcon } from "../../components/Icons";
import SharedModal from "../../components/SharedModal";
import { ResumeCard } from "../../components/ResumeCard";
import { ResumePreviewModal } from "../../components/ResumePreviewModal";
import FormField from "../../components/FormField";
import { useAPIAuth } from "../../hooks/useAPIAuth";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/ConfirmationModal";

const ResumeDashboard = () => {
  const router = useRouter();
  const { get, post, patch, delete: deleteRequest } = useAPIAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation state
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);

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
          response.data.sections || response.data.resume_sections || []
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

  const handlePreferencesSave = async (
    template: string,
    color: string,
    settings: any
  ) => {
    if (!previewResume?.id) return false;

    try {
      const userId = localStorage.getItem("x_user_id");
      await patch(
        `/api/resumes/${previewResume.id}`,
        {
          template_id: template,
          theme_color: color,
          resume_sections: settings,
        },
        { "x-user-id": userId || "" }
      );

      setPreviewResume((prev: any) => ({
        ...prev,
        template_id: template,
        theme_color: color,
        settings: settings,
        resume_sections: settings, // Meta alias
      }));
      // Also update the list so we don't have stale data
      setResumes((prev) =>
        prev.map((r) =>
          r.id === previewResume.id
            ? {
                ...r,
                template_id: template,
                theme_color: color,
                settings: settings,
              }
            : r
        )
      );

      toast.success("Preferences saved");
      return true;
    } catch (e) {
      toast.error("Failed to save");
      return false;
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
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 sticky top-0 z-30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  My Resumes
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and organize your professional credentials
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-lg shadow-gray-200"
              >
                <PlusIcon size={20} color="white" />
                New Resume
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats / Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} color="#9CA3AF" />
              </div>
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-white border-none rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm transition-shadow text-gray-700"
              />
            </div>

            {/* Simple Stats Pucks */}
            <div className="flex gap-3">
              <div className="bg-white px-5 py-2 rounded-xl text-sm font-medium text-gray-500 shadow-sm flex items-center gap-2">
                Total
                <span className="bg-gray-100 text-gray-900 font-bold px-2 py-0.5 rounded-md text-xs">
                  {resumes.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : filteredResumes.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="mx-auto h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <DocumentIcon size={32} color="#9CA3AF" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? "No resumes found" : "No resumes yet"}
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first resume to get started building your career."}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                  <PlusIcon size={20} color="white" />
                  Create First Resume
                </motion.button>
              )}
            </motion.div>
          ) : (
            /* Layout Group for smooth reordering */
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredResumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onDelete={(id) => setResumeToDelete(id)}
                    onDuplicate={handleDuplicateResume}
                    onPreview={handlePreviewResume}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
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
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResume}
                disabled={!newResumeTitle.trim() || isCreating}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all ${
                  !newResumeTitle.trim() || isCreating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-black shadow-lg"
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
          template={previewResume?.template_id}
          themeColor={previewResume?.theme_color}
          onSave={handlePreferencesSave}
        />

        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          isOpen={!!resumeToDelete}
          title="Delete Resume"
          message="Are you sure you want to delete this resume? This action cannot be undone."
          confirmText="Delete Resume"
          isDangerous={true}
          onConfirm={() => {
            if (resumeToDelete) {
              handleDeleteResume(resumeToDelete);
              setResumeToDelete(null);
            }
          }}
          onCancel={() => setResumeToDelete(null)}
        />

        {/* Loading Overlay for Preview Fetch */}
        {fetchingPreview && (
          <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
              <span className="font-medium text-gray-900">
                Loading preview...
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// End of file

export default ResumeDashboard;
