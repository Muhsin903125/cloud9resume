import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Card from "../../components/Card";
import {
  PlusIcon,
  ChevronLeftIcon,
  CheckIcon,
  GlobeIcon,
  EyeIcon,
} from "../../components/Icons";
import { useAPIAuth } from "../../hooks/useAPIAuth";
import { Resume, Portfolio } from "../../lib/types";
import { ResumeRenderer } from "../../components/ResumeRenderer";
import { PortfolioRenderer } from "../../lib/portfolio-templates";
import { toast } from "react-hot-toast";

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "bg-blue-500" },
  { id: "professional", name: "Professional", color: "bg-slate-700" },
  { id: "minimal", name: "Minimal", color: "bg-gray-100" },
  { id: "creative", name: "Creative", color: "bg-purple-600" },
  { id: "grid", name: "Grid", color: "bg-orange-500" },
  { id: "glass", name: "Glass", color: "bg-black" },
];

const PortfolioDashboardPage: NextPage = () => {
  const router = useRouter();
  const { get, post, del } = useAPIAuth();

  // Data
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard State
  const [view, setView] = useState<
    "list" | "select-resume" | "select-template" | "details"
  >("list");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("modern");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, portRes] = await Promise.all([
        get<Resume[]>("/api/resumes"),
        get<any[]>("/api/portfolios"), // Type cast as any[] for now due to join structure differences if any
      ]);

      if (resRes.success && resRes.data) setResumes(resRes.data);
      if (portRes.success && portRes.data) setPortfolios(portRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (customTitle?: string, customSlug?: string) => {
    if (!selectedResumeId || !selectedTemplateId) return;

    setCreating(true);
    try {
      // If we came from Details step, we have customTitle and customSlug
      // Otherwise (legacy/fallback), generate them
      // But now we force Details step, so we should expect them.

      const resume = resumes.find((r) => r.id === selectedResumeId);

      let finalSlug = customSlug;
      if (!finalSlug) {
        const baseSlug = (resume?.title || "portfolio")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const finalTitle = customTitle || resume?.title || "My Portfolio";

      const res = await post("/api/portfolios", {
        title: finalTitle,
        resume_id: selectedResumeId,
        template_id: selectedTemplateId,
        theme_color: "#2563EB",
        slug: finalSlug,
        is_active: true,
      });

      if (res.success && res.data) {
        toast.success("Portfolio created!");
        router.push(`/dashboard/portfolio/${res.data.id}`);
      } else {
        toast.error("Failed to create portfolio");
      }
    } catch (e) {
      toast.error("Error creating portfolio");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this portfolio?")) return;

    try {
      const res = await del(`/api/portfolios/${id}`);
      if (res.success) {
        toast.success("Deleted");
        fetchData();
      }
    } catch (err) {
      toast.error("Error deleting");
    }
  };

  // --- Views ---

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  // 1. Wizard: Select Resume
  if (view === "select-resume") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => setView("list")}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition"
          >
            <ChevronLeftIcon size={20} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select a Source Resume
          </h1>
          <p className="text-gray-500 mb-8">
            Choose which resume you want to turn into a website.
          </p>

          <div className="space-y-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedResumeId(r.id);
                  setView("select-template");
                }}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition group flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600">
                    {r.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.job_title || "No job title"} • Updated{" "}
                    {new Date(r.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-blue-500">
                  <ChevronLeftIcon size={20} className="rotate-180" />
                </div>
              </div>
            ))}
            {resumes.length === 0 && (
              <div className="text-center py-10 bg-white border border-dashed rounded-xl">
                <p>No resumes found.</p>
                <button
                  onClick={() => router.push("/dashboard/resume")}
                  className="text-blue-600 font-bold mt-2"
                >
                  Create a Resume first
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Wizard: Select Template (Split View)
  if (view === "select-template") {
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Template List */}
          <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white border-r border-gray-200 overflow-y-auto p-6 z-10 shadow-xl">
            <button
              onClick={() => setView("select-resume")}
              className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition text-sm"
            >
              <ChevronLeftIcon size={16} /> Back
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Choose Template
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Select a style for your portfolio.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`group relative aspect-[3/4] bg-gray-50 rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                    selectedTemplateId === t.id
                      ? "border-blue-600 ring-2 ring-blue-100 shadow-md scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`h-full w-full ${t.color} opacity-20 group-hover:opacity-30 transition`}
                  ></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                    <div className="font-bold text-gray-900 text-xs">
                      {t.name}
                    </div>
                  </div>
                  {selectedTemplateId === t.id && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg z-10">
                      <CheckIcon size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-[1000px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden min-h-[800px] ring-1 ring-black/5 transform origin-top transition-all">
                {selectedResume && (
                  <div className="pointer-events-none select-none h-full">
                    <PortfolioRenderer
                      resume={selectedResume}
                      sections={selectedResume.sections || []}
                      template={selectedTemplateId}
                      settings={{ color: "#2563EB" }} // Default preview color
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Floating Action Bar */}
            <div className="absolute bottom-8 right-8 z-30">
              <button
                onClick={() => setView("details")}
                className="px-8 py-4 bg-gray-900 text-white font-bold rounded-full shadow-2xl hover:bg-black hover:scale-105 transition flex items-center gap-3"
              >
                <span>Continue to Details</span>
                <ChevronLeftIcon size={20} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Wizard: Details (Title & Slug)
  if (view === "details") {
    return (
      <DetailsWizardStep
        onBack={() => setView("select-template")}
        onCreate={handleCreate}
        creating={creating}
        defaultTitle={
          resumes.find((r) => r.id === selectedResumeId)?.title ||
          "My Portfolio"
        }
      />
    );
  }

  // 3. Default: Dashboard List
  return (
    <>
      <Head>
        <title>Portfolios - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Portfolios</h1>
            </div>
            <button
              onClick={() => {
                setSelectedResumeId("");
                setView("select-resume");
              }}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusIcon size={16} color="white" />
              New Portfolio
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {portfolios.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-medium text-gray-900">
                No portfolios yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create a personal website from your resume in seconds.
              </p>
              <button
                onClick={() => setView("select-resume")}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Create Portfolio
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((p) => (
                <Card
                  key={p.id}
                  className="group relative p-0 overflow-hidden border border-gray-200 hover:shadow-lg transition-all hover:border-blue-200"
                >
                  <div
                    className={`h-32 ${
                      TEMPLATES.find((t) => t.id === p.template_id)?.color ||
                      "bg-gray-100"
                    } opacity-20`}
                  ></div>
                  <div className="p-5 pt-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition truncate pr-2">
                        {p.title}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <PlusIcon size={16} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.is_active ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></span>
                        {p.slug ? `cloud9profile.com/${p.slug}` : "No URL"}
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100"
                        title="Total Views"
                      >
                        <EyeIcon size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-600">
                          {p.views || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/portfolio/${p.id}`)
                        }
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs transition"
                      >
                        Edit
                      </button>
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 rounded-lg flex items-center justify-center transition"
                      >
                        <GlobeIcon size={16} />
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default PortfolioDashboardPage;

// Helper Component for consistency and cleaner main file
function DetailsWizardStep({ onBack, onCreate, creating, defaultTitle }: any) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState("");
  const [slugCheck, setSlugCheck] = useState({
    available: null as boolean | null,
    checking: false,
  });

  // Auto-generate slug on mount
  useEffect(() => {
    const base = defaultTitle.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    // Add random suffix for uniqueness probability
    const initial = `${base}-${Math.floor(Math.random() * 1000)}`;
    setSlug(initial);
    checkSlug(initial);
  }, []);

  const checkSlug = async (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(sanitized);
    setSlugCheck({ checking: true, available: null });

    try {
      const res = await fetch(`/api/portfolio/check-slug?slug=${sanitized}`);
      const data = await res.json();
      setSlugCheck({ checking: false, available: data.available });
    } catch (e) {
      setSlugCheck({ checking: false, available: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition text-sm"
        >
          <ChevronLeftIcon size={16} /> Back to Templates
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Final Details</h1>
        <p className="text-gray-500 mb-8">
          Customize your portfolio URL and title.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Portfolio Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. My Professional Portfolio"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Public URL
            </label>
            <div className="flex relative">
              <span className="px-4 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm flex items-center">
                cloud9profile.com/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => checkSlug(e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-r-xl outline-none focus:ring-2 transition ${
                  slugCheck.available === false
                    ? "border-red-300 bg-red-50 focus:ring-red-200"
                    : slugCheck.available === true
                    ? "border-green-300 bg-green-50 focus:ring-green-200"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
              />
              <div className="absolute right-3 top-3.5">
                {slugCheck.checking ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : slugCheck.available === true ? (
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold text-xs">
                      Available
                    </span>
                    <CheckIcon size={16} className="text-green-600" />
                  </div>
                ) : slugCheck.available === false ? (
                  <span className="text-red-500 font-bold text-xs">Taken</span>
                ) : null}
              </div>
            </div>
            {slugCheck.available === false && (
              <p className="text-xs text-red-500 mt-2">
                Username already exists. Try another.
              </p>
            )}
          </div>

          <button
            onClick={() => onCreate(title, slug)}
            disabled={
              creating || slugCheck.available === false || slugCheck.checking
            }
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {creating ? "Creating Portfolio..." : "Launch Portfolio 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
