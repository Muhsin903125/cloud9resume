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
  DeleteIcon,
} from "../../components/Icons";
import { useAPIAuth } from "../../hooks/useAPIAuth";
import { Resume, Portfolio } from "../../lib/types";
import { ResumeRenderer } from "../../components/ResumeRenderer";
import { PortfolioRenderer } from "../../lib/portfolio-templates";
import { toast } from "react-hot-toast";
import { useAuth } from "../../lib/authUtils";
import { canCreateResource, PlanType } from "../../lib/subscription";

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
  const { user } = useAuth();
  const { get, post, del } = useAPIAuth();

  // Data
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  // Wizard State
  const [view, setView] = useState<"list" | "select-resume">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, portRes] = await Promise.all([
        get<Resume[]>("/api/resumes"),
        get<any[]>("/api/portfolios"),
      ]);

      if (resRes.success && resRes.data) setResumes(resRes.data);
      if (portRes.success && portRes.data) setPortfolios(portRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = () => {
    if (
      user &&
      !canCreateResource(
        (user.plan || "free") as PlanType,
        portfolios.length,
        "portfolios"
      )
    ) {
      toast.error(
        `You've reached the limit of portfolios for the ${user.plan} plan. Please upgrade.`
      );
      router.push("/plans");
      return;
    }
    setView("select-resume");
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
                  router.push(`/dashboard/portfolio/new?resumeId=${r.id}`);
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
              onClick={handleCreatePortfolio}
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
                onClick={handleCreatePortfolio}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Create Portfolio
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios
                .filter((p) => p.is_active)
                .map((p) => (
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
                            <DeleteIcon size={16} />
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
