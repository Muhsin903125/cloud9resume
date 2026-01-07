import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Resume } from "../../lib/types";
import { PlusIcon, SearchIcon, DocumentIcon } from "../../components/Icons";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import SharedModal from "../../components/SharedModal";
import { ResumeUploader } from "../../components/ai/ResumeUploader";
import { ResumeCard } from "../../components/ResumeCard";
import { ResumePreviewModal } from "../../components/ResumePreviewModal";
import FormField from "../../components/FormField";
import { useAPIAuth } from "../../hooks/useAPIAuth";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAuth } from "../../lib/authUtils";
import { canCreateResource, PlanType } from "../../lib/subscription";

const ResumeDashboard = () => {
  const router = useRouter();
  const { get, post, patch, delete: deleteRequest } = useAPIAuth();
  const { user } = useAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [previewSections, setPreviewSections] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
    if (
      user &&
      !canCreateResource(
        (user.plan || "free") as PlanType,
        resumes.length,
        "resumes"
      )
    ) {
      toast.error(`Resume limit reached. Please upgrade your plan.`);
      return;
    }
    if (!newResumeTitle.trim()) return;

    try {
      setIsCreating(true);
      const response = await post<Resume>("/api/resumes", {
        title: newResumeTitle,
      });
      if (response.success && response.data) {
        setShowNewModal(false);
        setNewResumeTitle("");
        toast.success("Resume created");
        router.push(`/dashboard/resume/${response.data.id}/edit`);
      } else {
        toast.error(response.error || "Failed to create");
      }
    } catch (err) {
      toast.error("Failed to create");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      const response = await deleteRequest(`/api/resumes/${id}`);
      if (response.success) {
        setResumes(resumes.filter((r) => r.id !== id));
        toast.success("Deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleDuplicateResume = async (id: string) => {
    toast("Coming soon!", { icon: "🚧" });
  };

  const handlePreviewResume = async (resume: any) => {
    try {
      setFetchingPreview(true);
      const response = await get<any>(`/api/resumes/${resume.id}`);
      if (response.success && response.data) {
        setPreviewResume(response.data);
        setPreviewSections(
          response.data.sections || response.data.resume_sections || []
        );
        setShowPreview(true);
      } else {
        toast.error("Failed to load");
      }
    } catch (err) {
      toast.error("Failed to load");
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
      }));
      setResumes((prev) =>
        prev.map((r) =>
          r.id === previewResume.id
            ? { ...r, template_id: template, theme_color: color }
            : r
        )
      );
      toast.success("Saved");
      return true;
    } catch (e) {
      toast.error("Failed");
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
        <title>Resumes - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50/80">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Title */}
              <div className="flex-shrink-0">
                <h1 className="text-lg font-bold text-gray-900">My Resumes</h1>
                <p className="text-[10px] text-gray-400">
                  {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Center/Right: Search + Actions */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <SearchIcon size={14} color="#9CA3AF" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <CloudArrowUpIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Import</span>
                </button>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon size={12} color="white" />
                  <span className="hidden sm:inline">New</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-gray-400">Loading resumes...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <DocumentIcon size={24} color="#9CA3AF" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {searchQuery ? "No results found" : "No resumes yet"}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {searchQuery
                  ? "Try different search terms"
                  : "Create your first resume to get started"}
              </p>
              {!searchQuery && (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <CloudArrowUpIcon className="w-4 h-4" />
                    Import
                  </button>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon size={14} color="white" />
                    Create New
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={(id) => setResumeToDelete(id)}
                  onDuplicate={handleDuplicateResume}
                  onPreview={handlePreviewResume}
                />
              ))}
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
          title="New Resume"
          size="sm"
        >
          <div className="space-y-4">
            <FormField
              label="Title"
              name="resumeTitle"
              value={newResumeTitle}
              onChange={(e: any) =>
                setNewResumeTitle(e.target ? e.target.value : e)
              }
              placeholder="e.g., Software Engineer Resume"
              required
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResume}
                disabled={!newResumeTitle.trim() || isCreating}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </SharedModal>

        {/* Import Modal */}
        <SharedModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Resume"
        >
          <ResumeUploader
            onUploadSuccess={(data, resumeId) => {
              setShowImportModal(false);
              router.push(`/dashboard/resume/${resumeId}/edit`);
            }}
            onCancel={() => setShowImportModal(false)}
          />
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

        {/* Delete Confirmation */}
        <ConfirmationModal
          isOpen={!!resumeToDelete}
          onClose={() => setResumeToDelete(null)}
          onConfirm={() => {
            if (resumeToDelete) {
              handleDeleteResume(resumeToDelete);
              setResumeToDelete(null);
            }
          }}
          title="Delete Resume"
          message="Are you sure? This cannot be undone."
          confirmText="Delete"
          isDestructive={true}
        />

        {/* Preview Loading Overlay */}
        {fetchingPreview && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResumeDashboard;
