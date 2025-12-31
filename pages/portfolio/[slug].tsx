import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { PortfolioRenderer } from "../../lib/portfolio-templates";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const PublicPortfolio = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [portfolio, setPortfolio] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const colors = {
    primary: "#000000",
    secondary: "#666666",
    accent: "#3b82f6",
    border: "#e5e7eb",
    light: "#f9fafb",
  };

  useEffect(() => {
    if (slug) {
      fetchPortfolio();
    }
  }, [slug]);

  const fetchPortfolio = async (pwd?: string) => {
    try {
      setLoading(true);
      const url = `/api/portfolio/${slug}${
        pwd ? `?password=${encodeURIComponent(pwd)}` : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.status === 401) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to load portfolio");
        setLoading(false);
        return;
      }

      const portData = data.data;
      setPortfolio(portData);

      // Load resume and content from snapshot if available
      if (portData.content && portData.content.resume) {
        setResume(portData.content.resume);
      } else {
        setResume(portData.resume);
      }

      setPasswordRequired(false);
      setError("");
    } catch (err) {
      setError("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPortfolio(password);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7h4a4 4 0 118 0v4M14 7h-4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Private Portfolio
          </h1>
          <p className="text-center text-gray-500 mb-8">
            This portfolio is password protected. Please enter the password to
            view it.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              Unlock Portfolio
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!portfolio || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
        <p className="text-gray-500">Portfolio Not Found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{portfolio.title || resume.title} | Portfolio</title>
        <meta
          name="description"
          content={
            resume.summary || `Professional portfolio of ${resume.title}`
          }
        />
      </Head>

      <PortfolioRenderer
        resume={resume}
        sections={
          portfolio?.content?.sections ||
          resume.resume_sections ||
          resume.sections ||
          []
        }
        template={portfolio.template_id || "modern"}
        settings={{
          themeColor: portfolio.theme_color || "#2563EB",
          ...portfolio.settings,
        }}
      />

      {/* View Count Badge */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          color: "white",
          padding: "8px 14px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
        }}
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {portfolio.view_count || 0} views
      </div>
    </>
  );
};

export default PublicPortfolio;
