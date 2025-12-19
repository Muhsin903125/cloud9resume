import React, { useState, useEffect, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import SharedModal from "./SharedModal";
import { ResumeRenderer } from "./ResumeRenderer";
import { TEMPLATE_REGISTRY, getAtsTemplates } from "../lib/template-registry";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import {
  DownloadIcon,
  CheckIcon,
  TemplateIcon,
  PaletteIcon,
  LayoutIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GripVerticalIcon,
} from "./Icons";
import { toast } from "react-hot-toast";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: any;
  sections: any[];
  template?: string;
  themeColor?: string;
  settings?: any;
  onSave?: (template: string, color: string, settings: any) => Promise<boolean>;
}

// Helper to render mini template preview
const MiniTemplatePreview = ({
  templateId,
  color,
}: {
  templateId: string;
  color: string;
}) => {
  // Determine layout based on template ID
  const isSidebarLeft = [
    "modern",
    "creative",
    "timeline",
    "modern-ats",
    "creative-ats",
    "vibrant-creative",
  ].includes(templateId);
  const isSidebarRight = ["tech", "bold"].includes(templateId);
  const isGrid = ["grid", "compact", "dense", "geometric-creative"].includes(
    templateId
  );

  const accentStyle = { backgroundColor: color };
  const lightAccentStyle = { backgroundColor: color, opacity: 0.1 };
  const textAccentStyle = { backgroundColor: color, opacity: 0.4 };

  return (
    <div className="w-full h-24 bg-white rounded-lg mb-2 shadow-sm border border-gray-100 overflow-hidden relative flex flex-col p-1.5 gap-1 select-none pointer-events-none">
      {/* Header Area */}
      {!isSidebarLeft && !isSidebarRight && (
        <div className="w-full h-4 bg-gray-50 rounded-sm mb-0.5 flex flex-col gap-0.5 justify-center px-1">
          <div className="w-1/3 h-1 rounded-full" style={textAccentStyle}></div>
          <div className="w-1/4 h-0.5 bg-gray-200 rounded-full"></div>
        </div>
      )}

      <div className="flex-1 flex gap-1 h-full overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarLeft && (
          <div className="w-[28%] h-full bg-slate-50 rounded-sm p-1 flex flex-col gap-1">
            <div
              className="w-4 h-4 rounded-full mb-1 mx-auto"
              style={accentStyle}
            ></div>
            <div className="w-full h-0.5 bg-gray-200 rounded"></div>
            <div className="w-full h-0.5 bg-gray-200 rounded"></div>
            <div className="w-2/3 h-0.5 bg-gray-200 rounded"></div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col gap-1 ${
            isGrid ? "grid grid-cols-2 gap-1" : ""
          }`}
        >
          {/* If Sidebar Layout, add a small header in main area */}
          {(isSidebarLeft || isSidebarRight) && (
            <div className="w-full h-2.5 bg-gray-50 rounded-sm"></div>
          )}

          {isGrid ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-sm p-0.5 flex flex-col gap-0.5"
                  style={lightAccentStyle}
                >
                  <div className="w-full h-0.5 bg-gray-200"></div>
                  <div className="w-2/3 h-0.5 bg-gray-200"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div
                className="w-full h-1 rounded-sm"
                style={textAccentStyle}
              ></div>
              <div className="w-full h-10 bg-gray-50/50 rounded-sm border border-dashed border-gray-200"></div>
              <div className="w-3/4 h-1 bg-gray-100 rounded-sm"></div>
              <div className="w-full h-4 bg-gray-50/50 rounded-sm border border-dashed border-gray-200"></div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        {isSidebarRight && (
          <div
            className="w-[28%] h-full rounded-sm p-1 flex flex-col gap-1"
            style={accentStyle}
          >
            <div className="w-full h-0.5 bg-white/40 rounded"></div>
            <div className="w-full h-0.5 bg-white/40 rounded"></div>
            <div className="w-2/3 h-0.5 bg-white/40 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const DEFAULT_SETTINGS = {};

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resume,
  sections,
  onSave,
}) => {
  const { get: getAuth } = useAPIAuth();
  const isInitialized = useRef(false);

  // Local states
  const [template, setTemplate] = useState("ats");
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#3b82f6");
  const [font, setFont] = useState("inter");
  const [localSections, setLocalSections] = useState<any[]>(sections);
  const [hiddenSectionIds, setHiddenSectionIds] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<"design" | "content">("design");
  const [mobileTab, setMobileTab] = useState<"controls" | "preview">("preview");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset initialization when modal closes
  useEffect(() => {
    if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen]);

  // Fetch the latest resume details on open
  useEffect(() => {
    const fetchLatestDetails = async () => {
      if (!isOpen || !resume?.id || isInitialized.current) return;

      setIsLoading(true);
      try {
        const result = await getAuth(`/api/resumes/${resume.id}`);

        if (result.success && result.data) {
          const r = result.data;
          const settings = r.settings || {};

          setTemplate(settings.template_id || r.template_id || "ats");
          setThemeColor(r.theme_color || "#3b82f6");
          setSecondaryColor(
            settings.secondary_color || r.theme_color || "#3b82f6"
          );
          setFont(settings.font || "inter");
          setHiddenSectionIds(settings.hidden_sections || []);

          // Reorder the current WIP sections based on saved order
          const savedOrder = settings.section_order || [];
          const safeSections = Array.isArray(sections) ? sections : [];
          const currentSectionsOrder = [...safeSections].sort((a, b) => {
            const idxA = savedOrder.indexOf(a.section_type);
            const idxB = savedOrder.indexOf(b.section_type);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });

          setLocalSections(currentSectionsOrder);
          isInitialized.current = true;
        }
      } catch (error) {
        console.error("Failed to fetch latest resume details:", error);
        setLocalSections(Array.isArray(sections) ? sections : []);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      if (!isInitialized.current) {
        fetchLatestDetails();
      } else {
        // Already initialized, but we might need to sync the prop data
        // while maintaining our local order
        const currentOrder = localSections.map((s) => s.section_type);
        const safeSections = Array.isArray(sections) ? sections : [];
        const synced = [...safeSections].sort((a, b) => {
          const idxA = currentOrder.indexOf(a.section_type);
          const idxB = currentOrder.indexOf(b.section_type);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
        setLocalSections(synced);
      }
    }
  }, [isOpen, resume?.id, sections, getAuth]);

  const handleSave = async (
    currentTemplate = template,
    currentColor = themeColor,
    currentSections = localSections,
    currentHidden = hiddenSectionIds,
    currentFont = font
  ) => {
    if (!onSave) return;

    // We send template explicitly and also in settings for redundancy/safety
    return await onSave(currentTemplate, currentColor, {
      template_id: currentTemplate, // Unified storage
      font: currentFont,
      secondary_color: secondaryColor,
      hidden_sections: currentHidden,
      section_order: currentSections.map((s) => s.section_type),
    });
  };

  const handleTabSwitch = async (tab: "design" | "content") => {
    if (activeTab === tab) return;
    setActiveTab(tab);
  };

  const handlePrint = async (type: "visual" | "standard" = "visual") => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await handleSave();

      const exportParams = {
        resumeId: resume.id,
        format: "pdf",
        template: template,
        themeColor: themeColor,
        font: font,
        sections: previewSections,
        resumeData: { ...resume, theme_color: themeColor },
      };

      const response = await fetch("/api/resume/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportParams),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resume.title || "resume").replace(
        /[^a-z0-9]/gi,
        "_"
      )}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const fonts = [
    { name: "Inter", value: "inter" },
    { name: "Manrope", value: "manrope" },
    { name: "Poppins", value: "poppins" },
    { name: "Roboto", value: "roboto" },
    { name: "Calibri", value: "calibri" },
    { name: "Arial", value: "arial" },
  ];

  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Emerald", value: "#10b981" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Slate", value: "#64748b" },
    { name: "Black", value: "#000000" },
  ];

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...localSections];
    if (direction === "up") {
      if (index === 0) return;
      [newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ];
    } else {
      if (index === newSections.length - 1) return;
      [newSections[index + 1], newSections[index]] = [
        newSections[index],
        newSections[index + 1],
      ];
    }
    setLocalSections(newSections);
    handleSave(template, themeColor, newSections);
  };

  const toggleSectionVisibility = (sectionType: string) => {
    const newHidden = hiddenSectionIds.includes(sectionType)
      ? hiddenSectionIds.filter((x) => x !== sectionType)
      : [...hiddenSectionIds, sectionType];
    setHiddenSectionIds(newHidden);
    handleSave(template, themeColor, localSections, newHidden);
  };

  const previewSections = localSections.filter(
    (s) => !hiddenSectionIds.includes(s.section_type)
  );

  const categories = [
    {
      name: "Professional (ATS Optimized)",
      items: TEMPLATE_REGISTRY.filter((t) => t.category === "ATS").map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
      })),
    },
    {
      name: "Creative Designs",
      items: TEMPLATE_REGISTRY.filter((t) => t.category === "CREATIVE").map(
        (t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        })
      ),
    },
  ];

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} size="xl">
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            width: 100% !important;
          }
          body * {
            visibility: hidden; 
          }
          .shared-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            display: block !important;
            padding: 0 !important;
            visibility: visible !important;
            z-index: 9999 !important;
          }
          .shared-modal-content {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
            background: transparent !important;
          }
          .shared-modal-header, .shared-modal-close {
            display: none !important;
          }
          .shared-modal-body {
             padding: 0 !important;
             overflow: visible !important;
             visibility: visible !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .resume-page {
            transform: none !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
          }
          .sidebar, header, button {
             display: none !important;
          }
        }
      `}</style>

      {isLoading ? (
        <div className="flex items-center justify-center h-[85vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium font-inter">
              Loading latest preferences...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-0 h-[85vh] overflow-hidden relative">
          {/* Mobile Toggle Bar */}
          <div className="lg:hidden flex border-b border-gray-200 bg-white shrink-0 z-30">
            <button
              onClick={() => setMobileTab("controls")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mobileTab === "controls"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Edit Design
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mobileTab === "preview"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Live Preview
            </button>
          </div>

          {/* Sidebar Controls */}
          <div
            className={`w-full lg:w-80 flex-shrink-0 bg-white border-r border-gray-200 flex-col z-20 transition-all ${
              mobileTab === "preview" ? "hidden lg:flex" : "flex h-full"
            }`}
          >
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabSwitch("design")}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "design"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <TemplateIcon size={16} /> Design
              </button>
              <button
                onClick={() => handleTabSwitch("content")}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "content"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <LayoutIcon size={16} /> Content
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === "design" ? (
                <div className="space-y-8">
                  {/* Font Selection */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">
                      Typography
                    </h4>
                    <select
                      value={font}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFont(val);
                        handleSave(
                          template,
                          themeColor,
                          localSections,
                          hiddenSectionIds,
                          val
                        );
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {fonts.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Templates */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-wider">
                      Templates
                    </h4>
                    <div className="space-y-6">
                      {categories.map((category) => (
                        <div key={category.name}>
                          <h5 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
                            {category.name}
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            {category.items.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setTemplate(t.id);
                                  handleSave(t.id);
                                }}
                                className={`relative p-2 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${
                                  template === t.id
                                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 ring-offset-1 shadow-sm"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                }`}
                              >
                                {template === t.id && (
                                  <div className="absolute top-2 right-2 text-blue-600 bg-white rounded-full p-0.5 shadow-sm z-10">
                                    <CheckIcon size={12} />
                                  </div>
                                )}

                                <MiniTemplatePreview
                                  templateId={t.id}
                                  color={themeColor}
                                />

                                <div className="font-bold text-xs text-gray-900 truncate px-1">
                                  {t.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-black tracking-[0.1em] mb-2 px-1">
                    <span>Reorder (Drag & Drop)</span>
                    <span>Visible</span>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={localSections}
                    onReorder={(newOrder) => {
                      setLocalSections(newOrder);
                      console.log("newOrder", newOrder);
                      handleSave(template, themeColor, newOrder);
                    }}
                    className="space-y-2"
                  >
                    {localSections.map((section, index) => {
                      const isHidden = hiddenSectionIds.includes(
                        section.section_type
                      );
                      return (
                        <Reorder.Item
                          key={section.section_type}
                          value={section}
                          className={`group flex items-center gap-2 p-2 rounded-xl border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                            isHidden
                              ? "bg-gray-50/50 border-gray-100 opacity-60 grayscale-[0.8]"
                              : "bg-white border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md"
                          }`}
                        >
                          <div className="text-gray-300 group-hover:text-blue-400 transition-colors">
                            <GripVerticalIcon size={14} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-blue-600/70 bg-blue-50/50 px-1 py-0.5 rounded">
                                {section.section_type.replace("_", " ")}
                              </span>
                            </div>
                            <div className="font-bold text-xs text-gray-800 truncate">
                              {section.title}
                            </div>
                          </div>

                          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(index, "up");
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-all disabled:opacity-10"
                              title="Move Up"
                            >
                              <ArrowUpIcon size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(index, "down");
                              }}
                              disabled={index === localSections.length - 1}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-all disabled:opacity-10"
                              title="Move Down"
                            >
                              <ArrowDownIcon size={12} />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionVisibility(section.section_type);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isHidden
                                ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                            }`}
                            title={isHidden ? "Show Section" : "Hide Section"}
                          >
                            {isHidden ? (
                              <EyeOffIcon size={16} />
                            ) : (
                              <EyeIcon size={16} />
                            )}
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>

                  <div className="pt-3 border-t border-gray-100 mt-4 text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.05em] leading-relaxed">
                      ✨ Drag sections to reorder <br />
                      Changes are saved automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div
            className={`flex-1 bg-slate-100 rounded-none overflow-hidden flex-col relative shadow-inner ${
              mobileTab === "controls" ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="bg-white border-b border-gray-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Primary Color
                  </div>
                  <div className="flex gap-1.5">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setThemeColor(c.value);
                          handleSave(template, c.value);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none relative ring-1 ring-black/5 ${
                          themeColor === c.value
                            ? "ring-2 ring-offset-1 ring-gray-900 scale-110 z-10"
                            : ""
                        }`}
                        title={c.name}
                        style={{ backgroundColor: c.value }}
                      >
                        {themeColor === c.value && (
                          <CheckIcon
                            size={10}
                            className="text-white drop-shadow-md"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePrint("visual")}
                disabled={isSaving}
                className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-bold shadow-lg shadow-gray-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isSaving ? (
                  <span className="animate-pulse">Generating PDF...</span>
                ) : (
                  <>
                    <DownloadIcon size={16} />
                    Download PDF
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 flex justify-center custom-scrollbar bg-slate-100/50 print-area">
              <div
                className={`transform origin-top transition-all duration-300 w-[210mm] translate-x-0 resume-page`}
                style={{ transform: "scale(0.65)" }}
              >
                <div className="bg-white shadow-2xl rounded-sm overflow-hidden min-h-[297mm]">
                  <ResumeRenderer
                    resume={resume}
                    sections={previewSections}
                    template={template as any}
                    themeColor={themeColor}
                    settings={{
                      font: font,
                      secondary_color: secondaryColor,
                      hidden_sections: hiddenSectionIds,
                      section_order: localSections.map((s) => s.section_type),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SharedModal>
  );
};
