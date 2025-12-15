import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import { toast } from "react-hot-toast";
import {
  ChevronLeftIcon,
  LayoutIcon,
  PaletteIcon,
  DocumentIcon as FileTextIcon,
  SettingsIcon,
  EyeIcon,
  CheckIcon,
  GlobeIcon,
  SaveIcon,
  UploadIcon,
} from "@/components/Icons";

const TABS = [
  { id: "design", label: "Design", Icon: PaletteIcon },
  { id: "content", label: "Content", Icon: FileTextIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "bg-blue-500" },
  { id: "professional", name: "Professional", color: "bg-slate-700" },
  { id: "creative", name: "Creative", color: "bg-purple-600" },
  { id: "minimalist", name: "Minimalist", color: "bg-gray-100" },
  { id: "grid", name: "Grid", color: "bg-orange-500" },
  { id: "glass", name: "Glass", color: "bg-black" },
];

const COLORS = [
  "#2563EB", // Blue
  "#7C3AED", // Purple
  "#DB2777", // Pink
  "#DC2626", // Red
  "#EA580C", // Orange
  "#16A34A", // Green
  "#000000", // Black
];

export default function PortfolioBuilderPage() {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch } = useAPIAuth();

  const [activeTab, setActiveTab] = useState("design");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Data State
  const [portfolio, setPortfolio] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);

  // Editor State
  const [config, setConfig] = useState({
    templateId: "modern",
    themeColor: "#2563EB",
    settings: {
      visibleSections: ["experience", "education", "skills", "projects"],
      showPhoto: true,
      photoUrl: "",
      customTitle: "",
    } as any,
  });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  useEffect(() => {
    // Debounced preview generation
    const timer = setTimeout(() => {
      if (resume) generatePreview();
    }, 800);
    return () => clearTimeout(timer);
  }, [config, resume]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Portfolio
      const portRes = await get<any>(`/api/portfolios/${id}`);
      if (!portRes.success) throw new Error("Failed to load portfolio");

      const portData = portRes.data;
      setPortfolio(portData);

      // Initialize Config
      setConfig({
        templateId: portData.template_id || "modern",
        themeColor: portData.theme_color || "#2563EB",
        settings: {
          visibleSections: portData.settings?.visibleSections || [
            "experience",
            "education",
            "skills",
            "projects",
          ],
          showPhoto: portData.settings?.showPhoto ?? true,
          photoUrl: portData.settings?.photoUrl || "",
          customTitle: portData.settings?.customTitle || "",
        },
      });

      // Fetch Resume
      const resumeRes = await get<any>(
        `/api/resumes/${portData.resume_id}?_t=${Date.now()}`
      );
      if (resumeRes.success) {
        setResume(resumeRes.data);
        setSections(resumeRes.data.resume_sections || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load editor");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: { ...resume, theme_color: config.themeColor },
          sections,
          templateId: config.templateId,
          settings: config.settings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewUrl(data.data.html);
      }
    } catch (e) {
      console.error("Preview generation failed", e);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await patch(`/api/portfolios/${id}`, {
        template_id: config.templateId,
        theme_color: config.themeColor,
        settings: config.settings,
      });
      if (res.success) {
        toast.success("Saved successfully");
      } else {
        toast.error("Failed to save");
      }
    } catch (e) {
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const toggleSection = (sectionType: string) => {
    const current = config.settings.visibleSections || [];
    const updated = current.includes(sectionType)
      ? current.filter((s: string) => s !== sectionType)
      : [...current, sectionType];
    updateSetting("visibleSections", updated);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Head>
        <title>Portfolio Editor - Cloud9</title>
      </Head>

      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/portfolio")}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <h1 className="font-bold text-gray-900 truncate hidden md:block">
            {portfolio?.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium mr-2">
            {saving ? "Saving..." : "Unsaved Changes"}
          </span>
          <button
            onClick={saveChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <SaveIcon size={16} /> Save
          </button>
          <a
            href={`https://${
              portfolio?.repo ? portfolio.repo.split("/")[0] : "user"
            }.github.io/${portfolio?.repo?.split("/")[1] || ""}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-gray-500 hover:text-gray-900"
          >
            <GlobeIcon size={20} />
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-10">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.Icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* DESIGN TAB */}
            {activeTab === "design" && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Select Template
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, templateId: t.id }))
                        }
                        className={`group relative aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden text-left ${
                          config.templateId === t.id
                            ? "border-blue-600 ring-2 ring-blue-100"
                            : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`h-full w-full ${t.color} opacity-10 group-hover:opacity-20 transition`}
                        ></div>
                        <div className="absolute bottom-3 left-3 font-bold text-gray-700 text-sm">
                          {t.name}
                        </div>
                        {config.templateId === t.id && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                            <CheckIcon size={12} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Accent Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, themeColor: c }))
                        }
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          config.themeColor === c
                            ? "border-gray-900 scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={config.themeColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          themeColor: e.target.value,
                        }))
                      }
                      className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Profile Photo
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Show Photo</span>
                    <button
                      onClick={() =>
                        updateSetting("showPhoto", !config.settings.showPhoto)
                      }
                      className={`w-11 h-6 flex items-center rounded-full transition-colors ${
                        config.settings.showPhoto
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition hover:scale-110 ${
                          config.settings.showPhoto
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {config.settings.showPhoto && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Custom Photo URL (Optional)"
                        value={config.settings.photoUrl || ""}
                        onChange={(e) =>
                          updateSetting("photoUrl", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <p className="text-xs text-gray-400">
                        Leave blank to use resume photo.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Page Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Custom Title
                      </label>
                      <input
                        type="text"
                        placeholder={resume?.title || "My Portfolio"}
                        value={config.settings.customTitle || ""}
                        onChange={(e) =>
                          updateSetting("customTitle", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Visible Sections
                  </h3>
                  <div className="space-y-2">
                    {[
                      "experience",
                      "education",
                      "skills",
                      "projects",
                      "languages",
                    ].map((sec) => (
                      <label
                        key={sec}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={config.settings.visibleSections?.includes(
                            sec
                          )}
                          onChange={() => toggleSection(sec)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium capitalize">
                          {sec}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="text-sm font-bold text-red-700 mb-2">
                    Delete Portfolio
                  </h3>
                  <p className="text-xs text-red-600 mb-4">
                    This action cannot be undone.
                  </p>
                  <button className="w-full py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition">
                    Delete Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Live Preview Area */}
        <div className="flex-1 bg-gray-100 p-8 overflow-hidden relative flex items-center justify-center">
          {previewUrl ? (
            <div className="w-full h-full max-w-[1400px] bg-white shadow-2xl rounded-xl overflow-hidden ring-1 ring-black/5">
              <iframe
                srcDoc={previewUrl}
                className="w-full h-full border-0"
                title="Portfolio Preview"
              />
            </div>
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <div className="animate-spin mb-4">
                <SettingsIcon size={24} />
              </div>
              <p>Generating Preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
