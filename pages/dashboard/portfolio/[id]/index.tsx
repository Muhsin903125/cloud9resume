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

        setResume(resumeRes.data);
        const fetchedSections = (resumeRes.data.sections || []).map(
          (s: any) => ({
            ...s,
            content: s.section_data,
          })
        );
        setSections(fetchedSections);

        // Generate default slug
        const baseSlug = (resumeRes.data.title || "portfolio")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const defaultSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
        setSlugCheck((prev) => ({ ...prev, value: defaultSlug }));

        // Initial Config
        setConfig({
          templateId: "modern",
          themeColor: "#2563EB",
          settings: {
            visibleSections: ["experience", "education", "skills", "projects"],
            showPhoto: true,
            customTitle: resumeRes.data.title || "My Portfolio",
          },
        });

        setPortfolio({
          title: resumeRes.data.title || "My Portfolio",
          resume_id: resumeId as string,
          template_id: "modern",
          slug: defaultSlug,
          is_active: true,
        } as any);

        return; // Skip the rest of regular loading
      }

      // --- Regular "EDIT" mode ---
      const portRes = await get<Portfolio>(`/api/portfolios/${id}`);
      if (!portRes.success || !portRes.data)
        throw new Error("Failed to load portfolio");

      const portData = portRes.data;
      setPortfolio(portData);
      setSlugCheck((prev) => ({ ...prev, value: portData.slug || "" }));

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
          customTitle: portData.settings?.customTitle || "",
          ...portData.settings,
        },
      });

      // Fetch Resume
      const resumeRes = await get<any>(
        `/api/resumes/${portData.resume_id}?_t=${Date.now()}`
      );
      if (resumeRes.success) {
        setResume(resumeRes.data);
        const fetchedSections = (resumeRes.data.sections || []).map(
          (s: any) => ({
            ...s,
            content: s.section_data, // Ensure templates find data in 'content'
          })
        );

        // Check for custom sections in portfolio settings
        const customSectionsRaw = portData.settings?.customSections || [];
        const customSections = customSectionsRaw.map((s: any) => ({
          ...s,
          section_data: s.section_data || s.content, // Migrate legacy 'content'
          content: s.section_data || s.content, // Ensure templates find data
        }));

        const allSections = [...fetchedSections, ...customSections];

        // Sort
        const orderMap = portData.settings?.sectionOrder || [];
        if (orderMap.length > 0) {
          allSections.sort((a, b) => {
            const idxA =
              orderMap.indexOf(a.section_type) > -1
                ? orderMap.indexOf(a.section_type)
                : 999;
            const idxB =
              orderMap.indexOf(b.section_type) > -1
                ? orderMap.indexOf(b.section_type)
                : 999;
            return idxA - idxB;
          });
        }

        setSections(allSections);
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
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/portfolio")}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-900 truncate max-w-[200px] text-lg">
              {portfolio?.title}
            </h1>
          </div>
        </div>

        {/* Stepper (Desktop) */}
        <div className="flex-1 max-w-xl mx-8 hidden lg:block">
          <div className="flex justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>

            {TABS.map((t, idx) => {
              const isActive = t.id === activeTab;
              const isCompleted = idx < activeTabIndex;

              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex flex-col items-center gap-1 group focus:outline-none"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 bg-white ${
                      isActive
                        ? "border-blue-600 text-blue-600 ring-2 ring-blue-100"
                        : isCompleted
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-gray-300 text-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    <t.Icon size={14} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
              Unsaved changes
            </span>
          )}
          {id !== "new" && (
            <a
              href={`/${portfolio?.slug || id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-300 rounded-lg flex items-center justify-center gap-2 transition font-medium text-sm"
              title="Open in new tab"
            >
              <EyeIcon size={16} /> Preview
            </a>
          )}
          <button
            onClick={saveChanges}
            disabled={
              saving || slugCheck.available === false || slugCheck.checking
            }
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition font-medium disabled:opacity-50 shadow-lg shadow-gray-900/10"
          >
            {saving ? "Saving..." : <>Save & Publish</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Form / Controls (60%) */}
        <div className="w-full lg:w-3/5 flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
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

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-2xl mx-auto pb-20">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500">
                  Configure your portfolio {activeTab}.
                </p>
              </div>

              {/* DESIGN TAB */}
              {activeTab === "design" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Template
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                settings={{ themeColor: config.themeColor }}
                              />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-10">
                            <div className="font-bold text-gray-900 text-sm">
                              {t.name}
                            </div>
                          </div>
                          {config.templateId === t.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-sm">
                              <CheckIcon size={12} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Theme Color
                    </h3>
                    <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setConfig((p) => ({ ...p, themeColor: c }));
                            setIsDirty(true);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${
                            config.themeColor === c
                              ? "border-white ring-2 ring-gray-900 scale-110"
                              : "border-transparent hover:border-gray-300"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <div className="w-px h-8 bg-gray-300 mx-2"></div>
                      <input
                        type="color"
                        value={config.themeColor}
                        onChange={(e) => {
                          setConfig((p) => ({
                            ...p,
                            themeColor: e.target.value,
                          }));
                          setIsDirty(true);
                        }}
                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200"
                        title="Custom Color"
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
                                  className="text-base font-bold text-gray-800 bg-transparent border-none p-0 focus:ring-0 w-full placeholder-gray-400"
                                  placeholder="Section Title"
                                />
                              ) : (
                                <div className="text-base font-bold text-gray-800 capitalize">
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
                      className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <PlusIcon size={18} /> Add Custom Section (Text/Image)
                    </button>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GlobeIcon size={16} className="text-blue-600" /> Public
                        URL
                      </h3>
                      <div className="flex relative">
                        <span className="px-4 py-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm flex items-center font-mono">
                          cloud9profile.com/
                        </span>
                        <input
                          type="text"
                          value={slugCheck.value}
                          onChange={(e) => checkSlug(e.target.value)}
                          className={`flex-1 px-4 py-3 border rounded-r-xl outline-none focus:ring-2 transition-all font-mono text-sm ${
                            slugCheck.available === false
                              ? "border-red-300 focus:ring-red-200 bg-red-50"
                              : slugCheck.available === true
                              ? "border-green-300 focus:ring-green-200 bg-green-50"
                              : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                        <div className="absolute right-3 top-3.5">
                          {slugCheck.checking ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          ) : slugCheck.available === true ? (
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 font-bold text-xs">
                                Available
                              </span>
                              <CheckIcon size={20} className="text-green-600" />
                            </div>
                          ) : slugCheck.available === false ? (
                            <span className="text-red-500 font-bold text-xs">
                              Taken
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {slugCheck.available === false && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                          Username is already taken.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <LayoutIcon size={16} className="text-blue-600" /> Display
                      Options
                    </h3>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
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
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Show Profile Photo
                      </span>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder={portfolio?.title}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Appears in the browser tab.
                      </p>
                    </label>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg text-white">
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                      <GlobeIcon size={16} /> Custom Domain
                    </h3>
                    <p className="text-xs text-gray-300 mb-4 leading-relaxed max-w-md">
                      Connect your own domain (e.g.{" "}
                      <code>www.yourname.com</code>) to your portfolio. This
                      feature is coming soon for Pro users.
                    </p>
                    <button
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-not-allowed text-white/50"
                      disabled
                    >
                      Connect Domain (Coming Soon)
                    </button>
                  </div>

                  {id !== "new" && (
                    <div className="p-6 bg-red-50 rounded-xl border border-red-100 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-red-700">
                          Danger Zone
                        </h3>
                        <p className="text-xs text-red-600 mt-1">
                          Once you delete your portfolio, there is no going
                          back. Please be certain.
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
                        className="w-full py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm"
                      >
                        Delete Portfolio
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview (40%) */}
        <div className="hidden lg:flex w-2/5 bg-slate-100 items-start justify-center p-8 relative overflow-hidden custom-scrollbar">
          <div className="w-full h-full relative flex flex-col items-center">
            <div
              className="sticky top-0 w-full max-h-full overflow-hidden flex flex-col shadow-2xl rounded-xl ring-1 ring-black/5 bg-white"
              style={{ maxWidth: "600px", height: "90%" }}
            >
              {/* Browser Mockup Header */}
              <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between text-xs text-gray-400 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white rounded-md shadow-sm border border-gray-100 font-mono text-[10px] flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {portfolio?.slug
                      ? `cloud9profile.com/${portfolio.slug}`
                      : "preview"}
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        `/dashboard/portfolio/${id}/preview`,
                        "_blank"
                      )
                    }
                    title="Open in new tab"
                    className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-400 hover:text-primary"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
                <div></div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <PortfolioRenderer
                  resume={resume || ({} as any)}
                  sections={sections.filter((s) =>
                    config.settings.visibleSections?.includes(s.section_type)
                  )}
                  template={config.templateId}
                  settings={{
                    ...config.settings,
                    themeColor: config.themeColor,
                  }}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400 font-medium flex items-center gap-1">
              <EyeIcon size={12} /> Live Preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
