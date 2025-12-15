import React, { useState, useEffect } from "react";
import SharedModal from "./SharedModal";
import {
  DownloadIcon,
  CheckIcon,
  TemplateIcon,
  PaletteIcon,
  EditIcon,
  DeleteIcon,
} from "./Icons";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { GitHubService } from "../lib/github-service";
import { useAPIAuth } from "../hooks/useAPIAuth";

interface PortfolioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: any;
  sections: any[];
  githubToken: string;
  onUpdateToken: (token: string) => void;
  onPublishSuccess: (url: string, repo: string, theme: string) => void;
  existingPortfolio?: any; // For editing mode
}

export const PortfolioPreviewModal: React.FC<PortfolioPreviewModalProps> = ({
  isOpen,
  onClose,
  resume,
  sections,
  githubToken,
  onUpdateToken,
  onPublishSuccess,
  existingPortfolio,
}) => {
  const router = useRouter();
  const { post, patch } = useAPIAuth(); // API hooks

  const [template, setTemplate] = useState("modern");
  const [themeColor, setThemeColor] = useState(
    resume?.theme_color || "#2563EB"
  );

  // New State
  const [repoName, setRepoName] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(!githubToken);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingPortfolio) {
        setTemplate(existingPortfolio.template_id || "modern");
        setThemeColor(existingPortfolio.theme_color || "#2563EB");
        setRepoName(existingPortfolio.repo || "");
      } else {
        // Default repo name suggestion
        setRepoName(`portfolio-${resume.id?.substring(0, 8) || "web"}`);
      }
    }
  }, [isOpen, existingPortfolio, resume]);

  // Refetch preview when dependencies change
  useEffect(() => {
    if (isOpen && resume) {
      fetchPreview();
    }
  }, [isOpen, template, themeColor, resume, sections]);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: { ...resume, theme_color: themeColor },
          sections,
          templateId: template,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewHtml(data.data.html);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!githubToken) {
      setShowTokenInput(true);
      return;
    }

    if (!repoName.trim()) {
      toast.error("Please enter a repository name");
      return;
    }

    setIsPublishing(true);
    setPublishStatus("Initializing publishing...");

    try {
      const gh = new GitHubService(githubToken);
      const user = await gh.getUser(); // Validate token

      // Use user-defined repo name
      const finalRepoName = repoName.trim().replace(/\s+/g, "-").toLowerCase();

      setPublishStatus("Creating repository...");
      await gh.createRepo(finalRepoName, `Portfolio for ${resume.title}`);

      setPublishStatus("Uploading files...");
      await gh.uploadFile(
        user.login,
        finalRepoName,
        "index.html",
        previewHtml,
        "Published via Cloud9 Resume"
      );

      setPublishStatus("Enabling GitHub Pages...");
      await gh.enablePages(user.login, finalRepoName);

      const url = `https://${user.login}.github.io/${finalRepoName}`;

      // Save to Database
      setPublishStatus("Saving details...");

      if (existingPortfolio) {
        // Update existing
        await patch(`/api/portfolios/${existingPortfolio.id}`, {
          repo: finalRepoName,
          url,
          theme: template, // Mapping template to theme field for now
          template_id: template,
          theme_color: themeColor,
          title: resume.title, // Sync title if needed
        });
      } else {
        // Create new
        await post("/api/portfolios", {
          title: resume.title,
          resume_id: resume.id,
          repo: finalRepoName,
          url,
          theme: template,
          template_id: template,
          theme_color: themeColor,
          slug: finalRepoName,
        });
      }

      onPublishSuccess(url, finalRepoName, template);
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error("Publishing failed: " + e.message);
      if (e.message.includes("401") || e.message.includes("Bad credentials")) {
        setShowTokenInput(true); // Ask for token again if invalid
      }
    } finally {
      setIsPublishing(false);
      setPublishStatus("");
    }
  };

  const handleEditContent = () => {
    router.push(`/dashboard/resume/${resume.id}/edit`);
  };

  const handleOpenInNewTab = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean & hero-focused",
      color: "bg-blue-50",
    },
    {
      id: "professional",
      name: "Professional",
      description: "Sidebar & structured",
      color: "bg-gray-50",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Bold, gradients & animations",
      color: "bg-gradient-to-br from-purple-900 to-indigo-900 text-white",
    },
  ];

  const colors = [
    { name: "Blue", value: "#2563EB" },
    { name: "Violet", value: "#7C3AED" },
    { name: "Emerald", value: "#059669" },
    { name: "Rose", value: "#E11D48" },
    { name: "Amber", value: "#D97706" },
    { name: "Teal", value: "#0D9488" },
    { name: "Cyan", value: "#0891B2" },
    { name: "Indigo", value: "#4F46E5" },
    { name: "Orange", value: "#EA580C" },
    { name: "Pink", value: "#DB2777" },
  ];

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      // No title prop to remove header
    >
      {/* Custom Close Button since header is removed */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-black/5 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6 overflow-y-auto pr-2">
          {/* Custom Domain / Repo Name */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-gray-500">🌐</span> Website Address
            </h4>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-2 rounded-l border border-r-0 border-gray-300">
                user.github.io/
              </span>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-r focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="my-portfolio"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              This will be your repository name.
            </p>
          </div>

          {/* Template Selection */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TemplateIcon size={16} /> Template
            </h4>
            <div className="grid gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                    template === t.id
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div
                    className={`h-12 w-full rounded-md mb-2 ${t.color}`}
                  ></div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.description}</div>
                  {template === t.id && (
                    <div className="absolute top-2 right-2 text-blue-600">
                      <CheckIcon size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <PaletteIcon size={16} /> Accent Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setThemeColor(c.value)}
                  className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${
                    themeColor === c.value
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Token Input (Conditional) */}
          {showTokenInput && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs">
              <label className="font-bold block mb-1">
                GitHub Token Required
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => onUpdateToken(e.target.value)}
                className="w-full p-2 border rounded mb-2 bg-white"
                placeholder="ghp_..."
              />
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Cloud9+Portfolio"
                target="_blank"
                className="text-blue-600 underline block mb-2"
              >
                Get Token ↗
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <button
              onClick={handlePublish}
              disabled={isPublishing || loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {publishStatus || "Publishing..."}
                </span>
              ) : (
                <>
                  🚀{" "}
                  {existingPortfolio
                    ? "Update Deployment"
                    : "Publish to GitHub"}
                </>
              )}
            </button>

            <button
              onClick={handleEditContent}
              className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <EditIcon size={14} /> Edit Resume Content
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative flex flex-col">
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode("desktop")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === "desktop"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === "mobile"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mobile
              </button>
            </div>

            <div className="bg-gray-50 px-3 py-1 rounded text-xs text-gray-500 font-mono text-center truncate max-w-[200px]">
              {repoName || "..."}.github.io
            </div>

            {/* View Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenInNewTab}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition whitespace-nowrap flex items-center gap-1"
                title="Open in new tab"
              >
                Open New Tab ↗
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-gray-200/50 flex items-center justify-center overflow-auto p-4">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 w-full h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Generating preview...</p>
                </div>
              </div>
            ) : (
              <div
                className={`transition-all duration-300 bg-white shadow-xl overflow-hidden ${
                  viewMode === "mobile"
                    ? "w-[375px] h-[667px] rounded-[2rem] border-8 border-gray-800"
                    : "w-full h-full rounded-none border-0"
                }`}
              >
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-none block bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SharedModal>
  );
};
