import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Card from "../../components/Card";
import SharedModal from "../../components/SharedModal";
import { PortfolioPreviewModal } from "../../components/PortfolioPreviewModal";
import { PlusIcon } from "../../components/Icons";
import { useAPIAuth } from "../../hooks/useAPIAuth";
import { Resume } from "../../lib/types";
import { toast } from "react-hot-toast";

const PortfolioBuilderPage: NextPage = () => {
  const router = useRouter();
  const { get, del } = useAPIAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [previewData, setPreviewData] = useState<{
    resume: any;
    sections: any[];
  } | null>(null);

  // For Editing
  const [existingPortfolio, setExistingPortfolio] = useState<any>(null);

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // GitHub Token (Global)
  const [githubToken, setGithubToken] = useState("");

  useEffect(() => {
    fetchResumes();
    fetchPortfolios();
    const token = localStorage.getItem("github_token");
    if (token) setGithubToken(token);
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await get<Resume[]>("/api/resumes");
      if (response.success && response.data) {
        setResumes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    }
  };

  const fetchPortfolios = async () => {
    try {
      const response = await get<any[]>("/api/portfolios");
      if (response.success && response.data) {
        setPortfolios(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolios", error);
    } finally {
      setLoading(false); // Only stop loading after portfolios attempt
    }
  };

  const handleCreateOpen = () => {
    setSelectedResumeId("");
    setExistingPortfolio(null);
    setShowSelectModal(true);
  };

  const handleContinueToPreview = async (
    resumeId: string = selectedResumeId
  ) => {
    if (!resumeId) return;

    setIsLoadingDetails(true);
    try {
      // Add timestamp to prevent caching
      const res = await get<any>(`/api/resumes/${resumeId}?_t=${Date.now()}`);
      if (res.success && res.data) {
        const resume = res.data;
        let sections = resume.resume_sections || resume.sections || [];

        // Fix: Map DB 'section_data' to 'content' for templates
        sections = sections.map((s: any) => ({
          ...s,
          content: s.content || s.section_data || {},
        }));

        setPreviewData({ resume, sections });
        setShowSelectModal(false);
        setShowPreviewModal(true);
      } else {
        toast.error("Failed to load resume details");
      }
    } catch (e) {
      toast.error("Error loading resume");
    } finally {
      setIsLoadingDetails(false);
    }
  };
  const handleEdit = (portfolio: any) => {
    router.push(`/dashboard/portfolio/${portfolio.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this portfolio? This cannot be undone."
      )
    )
      return;

    try {
      const res = await del(`/api/portfolios/${id}`);
      if (res.success) {
        toast.success("Portfolio deleted");
        fetchPortfolios();
      } else {
        toast.error("Failed to delete portfolio");
      }
    } catch (err) {
      toast.error("Error deleting portfolio");
    }
  };

  const handlePublishSuccess = (url: string, repo: string, theme: string) => {
    localStorage.setItem("github_token", githubToken);
    fetchPortfolios(); // Refresh list from DB
    toast.success(
      existingPortfolio ? "Portfolio updated!" : "Portfolio published!"
    );
    setShowPreviewModal(false);
  };

  return (
    <>
      <Head>
        <title>Portfolio Builder - Cloud9 Resume</title>
      </Head>

      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Portfolio Builder
              </h1>
              <p className="text-xs text-gray-500">
                Turn your resumes into live websites
              </p>
            </div>
            <button
              onClick={handleCreateOpen}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusIcon size={16} color="white" />
              New Portfolio
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="mb-4 text-4xl">🚀</div>
              <h3 className="text-lg font-medium text-gray-900">
                No portfolios yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Select one of your resumes and verify it into a GitHub Pages
                website in seconds.
              </p>
              <button
                onClick={handleCreateOpen}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Portfolio
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <Card
                  key={portfolio.id}
                  className="p-5 hover:border-blue-300 hover:shadow-md transition-all group border border-gray-200 relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-8">
                      {portfolio.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, portfolio.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors bg-transparent border-0 p-1 rounded-full hover:bg-red-50"
                      title="Delete Portfolio"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      {portfolio.repo ? portfolio.repo : "No Repo"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      {portfolio.theme || "Modern"} Theme
                    </div>
                  </div>

                  <a
                    href={portfolio.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium mb-6 block truncate ${
                      portfolio.url
                        ? "text-blue-600 hover:text-blue-800 hover:underline"
                        : "text-gray-400 pointer-events-none"
                    }`}
                  >
                    {portfolio.url
                      ? portfolio.url.replace("https://", "")
                      : "Not published yet"}{" "}
                    ↗
                  </a>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <span className="text-[10px] text-gray-400">
                      Updated:{" "}
                      {new Date(portfolio.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(portfolio)}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      {portfolio.url && (
                        <a
                          href={portfolio.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Visit
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* 1. Resume Selection Modal */}
        <SharedModal
          isOpen={showSelectModal}
          onClose={() => setShowSelectModal(false)}
          title="Create Portfolio Website"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Select a resume to use as the base for your portfolio.
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedResumeId === r.id
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">
                    {r.job_title || "No job title"} • Updated{" "}
                    {new Date(r.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {resumes.length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  No resumes found. Create one first!
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <button
                disabled={!selectedResumeId || isLoadingDetails}
                onClick={() => handleContinueToPreview()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 flex items-center gap-2"
              >
                {isLoadingDetails && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                Preview & Customize
              </button>
            </div>
          </div>
        </SharedModal>

        {/* 2. Preview & Publish Modal */}
        {previewData && (
          <PortfolioPreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            resume={previewData.resume}
            sections={previewData.sections}
            githubToken={githubToken}
            onUpdateToken={setGithubToken}
            onPublishSuccess={handlePublishSuccess}
            existingPortfolio={existingPortfolio}
          />
        )}
      </div>
    </>
  );
};

export default PortfolioBuilderPage;
