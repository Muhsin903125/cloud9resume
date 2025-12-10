import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Resume } from "../../lib/types";
import { PlusIcon } from "../../components/Icons";

const ResumeDashboard = () => {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/resumes", {
        headers: { "x-user-id": "user-id-here" },
      });
      const data = await response.json();
      if (data.success) {
        setResumes(data.data || []);
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
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-id-here",
        },
        body: JSON.stringify({ title: newResumeTitle }),
      });

      const data = await response.json();
      if (data.success) {
        setShowNewModal(false);
        setNewResumeTitle("");
        router.push(`/dashboard/resume/${data.data.id}/edit`);
      }
    } catch (err) {
      setError("Failed to create resume");
    }
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "user-id-here" },
      });

      if (response.ok) {
        setResumes(resumes.filter((r) => r.id !== id));
      }
    } catch (err) {
      setError("Failed to delete resume");
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

      <div className="min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 relative">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                My Resumes
              </h1>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <PlusIcon size={14} />
              New Resume
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Resumes: {resumes.length}
              </span>
            </div>

            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-6">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm border-dashed">
              <p className="text-base font-medium text-gray-900 mb-1">
                No resumes yet
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Create your first resume to get started
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all flex flex-col h-full cursor-pointer relative"
                  onClick={() =>
                    router.push(`/dashboard/resume/${resume.id}/edit`)
                  }
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {resume.title}
                      </h3>
                      {resume.job_title && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {resume.job_title}
                        </p>
                      )}
                    </div>
                    {resume.is_primary && (
                      <span className="shrink-0 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full uppercase tracking-wide">
                        Primary
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400 mt-auto mb-4">
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/resume/${resume.id}/edit`);
                      }}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/resume/${resume.id}/preview`);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-md transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => handleDeleteResume(resume.id, e)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-gray-500 text-xs font-medium rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* New Resume Modal */}
        {showNewModal && (
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Create New Resume
              </h2>
              <input
                type="text"
                placeholder="Resume title (e.g., Software Engineer)"
                value={newResumeTitle}
                onChange={(e) => setNewResumeTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateResume}
                  disabled={!newResumeTitle.trim()}
                  className="flex-1 px-4 py-2 bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResumeDashboard;
