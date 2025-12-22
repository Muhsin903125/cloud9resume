import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import { toast } from "react-hot-toast";
import {
  ChevronLeftIcon,
  PaletteIcon,
  SettingsIcon,
  EyeIcon,
  CheckIcon,
  GlobeIcon,
  SaveIcon,
  LayoutIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  DeleteIcon,
} from "@/components/Icons";
import { ResumeRenderer } from "@/components/ResumeRenderer";
import { PortfolioRenderer } from "@/lib/portfolio-templates";
import { Resume, Portfolio } from "@/lib/types";

const TABS = [
  { id: "design", label: "Design", Icon: PaletteIcon },
  { id: "content", label: "Content", Icon: LayoutIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "bg-blue-500" },
  { id: "professional", name: "Professional", color: "bg-slate-700" },
  { id: "minimal", name: "Minimal", color: "bg-gray-100" },
  { id: "creative", name: "Creative", color: "bg-purple-600" },
  { id: "grid", name: "Grid", color: "bg-orange-500" },
  { id: "glass", name: "Glass", color: "bg-black" },
];

const COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#16A34A",
  "#000000",
];

export default function PortfolioEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch, post, del } = useAPIAuth();

  const [activeTab, setActiveTab] = useState("design");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Data State
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [sections, setSections] = useState<any[]>([]);

  // Editor State
  const [config, setConfig] = useState({
    templateId: "modern",
    themeColor: "#2563EB",
    settings: {
      visibleSections: ["experience", "education", "skills", "projects"],
      showPhoto: true,
      customTitle: "",
    } as any,
  });

  const [slugCheck, setSlugCheck] = useState({
    available: null as boolean | null,
    checking: false,
    value: "",
  });

  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // --- Handle "NEW" mode ---
      if (id === "new") {
        const { resumeId } = router.query;
        if (!resumeId) throw new Error("Missing resume ID");

        const resumeRes = await get<any>(
          `/api/resumes/${resumeId}?_t=${Date.now()}`
        );
        if (!resumeRes.success || !resumeRes.data)
          throw new Error("Failed to load resume");

        const resumeData = resumeRes.data;
        setResume(resumeData);

        // Map resume sections
        const fetchedSections = (resumeData.sections || []).map((s: any) => ({
          ...s,
          content: s.section_data,
        }));
        setSections(fetchedSections);

        // Generate default slug
        const baseSlug = (resumeData.title || "portfolio")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const defaultSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
        setSlugCheck((prev) => ({ ...prev, value: defaultSlug }));

        setConfig({
          templateId: "modern",
          themeColor: "#2563EB",
          settings: {
            visibleSections: ["experience", "education", "skills", "projects"],
            showPhoto: true,
            customTitle: resumeData.title || "My Portfolio",
          },
        });

        return;
      }

      // --- Regular "EDIT" mode ---
      const portRes = await get<any>(`/api/portfolios/${id}`);
      if (!portRes.success || !portRes.data)
        throw new Error("Failed to load portfolio");

      const portData = portRes.data;
      setPortfolio(portData);
      setSlugCheck((prev) => ({ ...prev, value: portData.slug || "" }));

      // Priority 1: Use persisted 'content' snapshot
      if (portData.content && portData.content.sections) {
        setResume(portData.content.resume || {});
        setSections(portData.content.sections || []);
        setConfig({
          templateId: portData.template_id || "modern",
          themeColor: portData.theme_color || "#2563EB",
          settings: portData.settings || {},
        });
      } else {
        // Priority 2: Fallback to Resume (Initial load or legacy)
        const resumeRes = await get<any>(
          `/api/resumes/${portData.resume_id}?_t=${Date.now()}`
        );
        if (resumeRes.success) {
          const resumeData = resumeRes.data;
          setResume(resumeData);
          const fetchedSections = (resumeData.sections || []).map((s: any) => ({
            ...s,
            content: s.section_data,
          }));
          setSections(fetchedSections);

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
              customTitle:
                portData.settings?.customTitle || resumeData.title || "",
              ...portData.settings,
            },
          });
        }
      }
    } catch (e) {
      toast.error("Failed to load editor");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Prepare section order and custom sections
      const sectionOrder = sections.map((s) => s.section_type);
      const customSections = sections.filter((s) => s.isCustom);

      // Prepare the "content" snapshot for persistence
      const contentSnapshot = {
        resume: resume,
        sections: sections,
        config: config,
      };

      const payload = {
        title:
          config.settings?.customTitle || portfolio?.title || "My Portfolio",
        template_id: config.templateId,
        theme_color: config.themeColor,
        settings: {
          ...config.settings,
          sectionOrder,
          customSections,
        },
        slug: slugCheck.value,
        content: contentSnapshot, // The snapshot for live website loading
      };

      let res;
      if (id === "new") {
        // Create new portfolio
        res = await post("/api/portfolios", {
          ...payload,
          resume_id: router.query.resumeId,
          is_active: true,
        });
      } else {
        // Update existing
        res = await patch(`/api/portfolios/${id}`, payload);
      }

      if (res.success && res.data) {
        toast.success(
          id === "new" ? "Portfolio launched!" : "Saved successfully"
        );
        setIsDirty(false);
        setPortfolio(res.data);

        if (id === "new") {
          // Transition from 'new' to the actual ID without a full page reload if possible,
          // but pushing to the new ID is safest for router consistency.
          router.push(`/dashboard/portfolio/${res.data.id}`, undefined, {
            shallow: true,
          });
        }
      } else {
        toast.error(res.error || "Failed to save");
      }
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkSlug = async (val: string) => {
    // Allow letters, numbers, hyphens
    const sanitized = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugCheck((prev) => ({ ...prev, value: sanitized, available: null })); // Reset availability while typing

    if (!sanitized || sanitized === portfolio?.slug) {
      setSlugCheck((prev) => ({
        ...prev,
        value: sanitized,
        available: true,
        checking: false,
      }));
      return;
    }

    setSlugCheck((prev) => ({ ...prev, checking: true }));

    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/portfolio/check-slug?slug=${sanitized}`);
        const data = await res.json();
        setSlugCheck((prev) => ({
          ...prev,
          checking: false,
          available: data.available,
        }));
      } catch (e) {
        setSlugCheck((prev) => ({ ...prev, checking: false, available: null })); // Error state
      }
    }, 500);
  };

  // --- Content Tab Actions ---
  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];
    setSections(newSections);
    setIsDirty(true);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
    setIsDirty(true);
  };

  const toggleVisibility = (sectionType: string) => {
    const current = config.settings.visibleSections || [];
    const updated = current.includes(sectionType)
      ? current.filter((s: string) => s !== sectionType)
      : [...current, sectionType];

    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, visibleSections: updated },
    }));
    setIsDirty(true);
  };

  const addCustomSection = () => {
    const newSection = {
      id: `custom-${Date.now()}`,
      section_type: `custom-${Date.now()}`,
      isCustom: true,
      title: "New Section",
      section_data: { text: "Add your content here..." },
      order_index: sections.length,
    };
    setSections([...sections, newSection]);
    // Also make it visible by default
    toggleVisibility(newSection.section_type);
    setIsDirty(true);
  };

  const removeSection = (sectionType: string) => {
    if (!confirm("Remove this section?")) return;
    setSections(sections.filter((s) => s.section_type !== sectionType));
    setIsDirty(true);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const activeTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const progress = ((activeTabIndex + 1) / TABS.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <Head>
        <title>Portfolio Editor - {portfolio?.title}</title>
      </Head>

      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/portfolio")}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors border border-transparent hover:border-gray-200"
          >
            <ChevronLeftIcon size={18} />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-900 truncate max-w-[200px] text-base">
              {portfolio?.title || "Untitled Portfolio"}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Live Editing
              </span>
            </div>
          </div>
        </div>

        {/* Stepper (Desktop) */}
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="bg-gray-50 p-1 rounded-xl border border-gray-100 flex gap-1">
            {TABS.map((t) => {
              const isActive = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <t.Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>
              UNSAVED
            </div>
          )}
          <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={
              saving || slugCheck.available === false || slugCheck.checking
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-xs disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 translate-y-0"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SaveIcon size={14} />
            )}
            {saving ? "Saving..." : "Publish Site"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
        {/* LEFT: Sidebar Controls (380px) */}
        <div className="w-[380px] flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden relative z-20 shadow-[8px_0_32px_rgba(0,0,0,0.02)]">
          {/* Mobile Tabs */}
          <div className="lg:hidden p-4 border-b border-gray-100 bg-white overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  activeTab === t.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-2xl mx-auto pb-4">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Configure your portfolio {activeTab}.
                </p>
              </div>

              {/* DESIGN TAB */}
              {activeTab === "design" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                      Template
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setConfig((p) => ({ ...p, templateId: t.id }));
                            setIsDirty(true);
                          }}
                          className={`group relative aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden text-left shadow-sm hover:shadow-md ${
                            config.templateId === t.id
                              ? "border-blue-600 ring-2 ring-blue-100"
                              : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="absolute inset-0 overflow-hidden bg-white pointer-events-none select-none">
                            <div className="transform scale-[0.25] origin-top-left w-[400%] h-[400%] p-4">
                              <PortfolioRenderer
                                resume={resume || ({} as any)}
                                sections={sections}
                                template={t.id}
                                settings={{
                                  themeColor: config.themeColor,
                                  isMobile: false,
                                }}
                              />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-10">
                            <div className="font-black text-gray-900 text-[9px] uppercase tracking-wider truncate">
                              {t.name}
                            </div>
                          </div>
                          {config.templateId === t.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                              <CheckIcon size={10} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT TAB */}
              {activeTab === "content" && (
                <div className="space-y-6 animate-fade-in px-2">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                      Section Visibility & Order
                    </h3>
                    <div className="space-y-3">
                      {sections.map((section, idx) => (
                        <div
                          key={section.id || section.section_type}
                          className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 text-gray-300">
                              <button
                                onClick={() => moveSection(idx, "up")}
                                className="hover:text-gray-600 disabled:opacity-20 p-1 hover:bg-gray-100 rounded"
                                disabled={idx === 0}
                              >
                                <ArrowUpIcon size={14} />
                              </button>
                              <button
                                onClick={() => moveSection(idx, "down")}
                                className="hover:text-gray-600 disabled:opacity-20 p-1 hover:bg-gray-100 rounded"
                                disabled={idx === sections.length - 1}
                              >
                                <ArrowDownIcon size={14} />
                              </button>
                            </div>
                            <div className="flex-1">
                              {section.isCustom ? (
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) =>
                                    updateSection(idx, "title", e.target.value)
                                  }
                                  className="text-xs font-black text-gray-800 bg-transparent border-none p-0 focus:ring-0 w-full placeholder-gray-400"
                                  placeholder="Section Title"
                                />
                              ) : (
                                <div className="text-xs font-black text-gray-800 capitalize tracking-tight">
                                  {section.title || section.section_type}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                {section.isCustom ? (
                                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">
                                    CUSTOM
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                                    RESUME
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 border-l pl-3 border-gray-100">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.settings.visibleSections?.includes(
                                    section.section_type
                                  )}
                                  onChange={() =>
                                    toggleVisibility(section.section_type)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>

                              {section.isCustom && (
                                <button
                                  onClick={() =>
                                    removeSection(section.section_type)
                                  }
                                  className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                  title="Remove Section"
                                >
                                  <DeleteIcon size={16} />
                                </button>
                              )}
                            </div>
                          </div>

                          {section.isCustom && (
                            <div className="pl-8">
                              <textarea
                                value={section.section_data?.text || ""}
                                onChange={(e) =>
                                  updateSection(idx, "section_data", {
                                    ...section.section_data,
                                    text: e.target.value,
                                  })
                                }
                                className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition resize-y min-h-[80px]"
                                placeholder="Enter your content here..."
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addCustomSection}
                      className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider"
                    >
                      <PlusIcon size={14} /> Add Custom Section
                    </button>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Public URL Selection */}
                  <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <GlobeIcon size={12} className="text-blue-500" /> Public
                        Address
                      </h3>
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xs pointer-events-none group-focus-within:text-blue-500 transition-colors">
                            cloud9profile.com/
                          </div>
                          <input
                            type="text"
                            value={slugCheck.value}
                            onChange={(e) => checkSlug(e.target.value)}
                            placeholder="yourname"
                            className={`w-full pl-[110px] pr-4 py-3.5 bg-gray-50 border rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                              slugCheck.available === false
                                ? "border-red-200 focus:border-red-500"
                                : slugCheck.available === true
                                ? "border-green-200 focus:border-green-500"
                                : "border-gray-100 focus:border-blue-500"
                            }`}
                          />
                        </div>

                        {/* Status Messages - Below the input */}
                        <div className="px-1 min-h-[16px]">
                          {slugCheck.checking ? (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold animate-pulse">
                              <div className="w-2 h-2 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                              Checking availability...
                            </div>
                          ) : slugCheck.available === true ? (
                            <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-black uppercase tracking-wider">
                              <CheckIcon size={12} />
                              Username Available
                            </div>
                          ) : slugCheck.available === false ? (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-black uppercase tracking-wider">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              Username Already Taken
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm space-y-5">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <LayoutIcon size={12} className="text-blue-500" /> Display
                      Options
                    </h3>
                    <label className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition cursor-pointer border border-transparent hover:border-gray-200 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                          <EyeIcon size={14} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">
                          Show Profile Photo
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.settings.showPhoto}
                        onChange={(e) => {
                          setConfig((p) => ({
                            ...p,
                            settings: {
                              ...p.settings,
                              showPhoto: e.target.checked,
                            },
                          }));
                          setIsDirty(true);
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-200 rounded focus:ring-blue-500 transition-all cursor-pointer"
                      />
                    </label>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
                        Browser Title
                      </span>
                      <input
                        type="text"
                        value={config.settings.customTitle}
                        onChange={(e) => {
                          setConfig((p) => ({
                            ...p,
                            settings: {
                              ...p.settings,
                              customTitle: e.target.value,
                            },
                          }));
                          setIsDirty(true);
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-200"
                        placeholder={portfolio?.title || "My Portfolio"}
                      />
                      <p className="text-[10px] text-gray-400 ml-1">
                        Appears on the browser tab.
                      </p>
                    </div>
                  </div>

                  {/* Domain Section */}
                  <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <GlobeIcon size={12} className="text-blue-400" /> Custom
                      Domain
                    </h3>
                    <p className="text-[10px] text-gray-400 mb-4 leading-relaxed font-medium">
                      Connect your own domain to your portfolio. This feature is
                      coming soon for Pro users.
                    </p>
                    <button
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-not-allowed text-gray-500"
                      disabled
                    >
                      Coming Soon
                    </button>
                  </div>

                  {id !== "new" && (
                    <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 space-y-4">
                      <div>
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-wider">
                          Danger Zone
                        </h3>
                        <p className="text-[10px] text-red-400 mt-1 font-medium leading-relaxed">
                          Deleting your portfolio is permanent and cannot be
                          undone.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure? This will delete your portfolio permanently."
                            )
                          ) {
                            await del(`/api/portfolios/${id}`);
                            router.push("/dashboard/portfolio");
                          }
                        }}
                        className="w-full py-3 bg-white border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition text-[10px] uppercase tracking-wider"
                      >
                        Delete Portfolio
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer Stepper Navigation (Fixed) */}
          <div className="p-4 border-t border-gray-100 bg-white z-30">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  const prevTab = TABS[activeTabIndex - 1];
                  if (prevTab) setActiveTab(prevTab.id);
                }}
                disabled={activeTabIndex === 0}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all flex items-center gap-2"
              >
                <ChevronLeftIcon size={14} /> Back
              </button>
              {activeTabIndex < TABS.length - 1 ? (
                <button
                  onClick={() => {
                    const nextTab = TABS[activeTabIndex + 1];
                    if (nextTab) setActiveTab(nextTab.id);
                  }}
                  className="px-6 py-2.5 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  Ready to Publish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview (Centered) */}
        <div className="flex-1 bg-[#F1F5F9] flex flex-col items-center justify-start p-8 relative overflow-hidden">
          {/* View Toolbar */}
          <div className="mb-6 bg-white p-1 rounded-2xl shadow-sm border border-gray-200 flex gap-1 z-10 max-w-fit flex-shrink-0">
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "desktop"
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Desktop
            </button>
            <div className="w-px h-4 bg-gray-200 self-center mx-1"></div>
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "mobile"
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Mobile
            </button>
            <div className="w-px h-4 bg-gray-200 self-center mx-1"></div>
            <a
              href={`/${portfolio?.slug || id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-blue-600 rounded-xl text-xs font-bold group"
            >
              <GlobeIcon
                size={14}
                className="group-hover:rotate-12 transition-transform"
              />
              Visit Site
            </a>
          </div>

          <div className="w-full flex-1 flex items-start justify-center overflow-hidden pb-4">
            <div
              className={`h-full bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-200 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
                viewMode === "mobile"
                  ? "w-[475px] rounded-[3rem] border-[12px] border-gray-900 ring-4 ring-gray-800"
                  : "w-full rounded-2xl"
              }`}
              style={viewMode === "desktop" ? { maxWidth: "1000px" } : {}}
            >
              {/* Mockup Header */}
              <div
                className={`bg-gray-50 border-b border-gray-200 flex items-center shrink-0 ${
                  viewMode === "mobile"
                    ? "h-8 justify-center"
                    : "px-4 py-3 justify-between"
                }`}
              >
                {viewMode === "desktop" ? (
                  <>
                    <div className="flex gap-2 text-gray-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                    </div>
                    <div className="flex-1 max-w-[400px] mx-4">
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-[11px] text-gray-400 font-mono flex items-center gap-2 shadow-sm truncate">
                        <GlobeIcon size={10} className="text-gray-300" />
                        cloud9profile.com/{slugCheck.value || "yourname"}
                      </div>
                    </div>
                    <div className="w-12"></div>
                  </>
                ) : (
                  <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
                )}
              </div>

              {/* Real Preview Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col">
                <PortfolioRenderer
                  resume={resume || ({} as any)}
                  sections={sections.filter(
                    (s) =>
                      s.section_type === "personal_info" ||
                      s.section_type === "summary" ||
                      config.settings.visibleSections?.includes(s.section_type)
                  )}
                  template={config.templateId}
                  settings={{
                    ...config.settings,
                    themeColor: config.themeColor,
                    isMobile: viewMode === "mobile",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto ring-8 ring-blue-50/50">
                <GlobeIcon size={40} className="animate-bounce-subtle" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">
                {!slugCheck.value || slugCheck.available === false
                  ? "Choose your address"
                  : "Ready to go live?"}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {!slugCheck.value || slugCheck.available === false
                  ? "You need to set a valid username before publishing your site."
                  : "Your portfolio will be published to the web. You can still make changes later."}
              </p>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
                  Public Site Address
                </p>
                <div className="relative mb-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none">
                    cloud9profile.com/
                  </div>
                  <input
                    type="text"
                    value={slugCheck.value}
                    onChange={(e) => checkSlug(e.target.value)}
                    placeholder="yourname"
                    className={`w-full pl-[110px] pr-4 py-3 bg-white border rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                      slugCheck.available === false
                        ? "border-red-200 focus:border-red-500"
                        : slugCheck.available === true
                        ? "border-green-200 focus:border-green-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                <div className="min-h-[16px]">
                  {slugCheck.checking ? (
                    <p className="text-[10px] text-gray-400 font-bold animate-pulse px-1">
                      Checking...
                    </p>
                  ) : slugCheck.available === true ? (
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-wider px-1">
                      Available!
                    </p>
                  ) : slugCheck.available === false ? (
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-wider px-1">
                      Already taken
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="w-full py-4 px-6 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    saveChanges();
                  }}
                  disabled={
                    !slugCheck.value ||
                    slugCheck.available === false ||
                    slugCheck.checking
                  }
                  className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  <CheckIcon size={18} />
                  Confirm
                </button>
              </div>
            </div>
            <div className="bg-blue-600 h-1.5 w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
