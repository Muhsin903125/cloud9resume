import React, { useState, useEffect } from "react";
import SharedModal from "./SharedModal";
import { ResumeRenderer } from "./ResumeRenderer";
import { DownloadIcon, CheckIcon, TemplateIcon, PaletteIcon } from "./Icons";
import { toast } from "react-hot-toast";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: any;
  sections: any[];
  template?: string;
  themeColor?: string;
  onSave?: (template: string, color: string) => Promise<boolean>;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resume,
  sections,
  template: initialTemplate = "modern",
  themeColor: initialColor = "#3b82f6",
  onSave,
}) => {
  const [template, setTemplate] = useState(initialTemplate);
  const [themeColor, setThemeColor] = useState(initialColor);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with props ONLY when modal opens to prevent overwriting user selection during save/print cycle
  useEffect(() => {
    if (isOpen) {
      setTemplate(initialTemplate);
      setThemeColor(initialColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handlePrint = async () => {
    if (onSave) {
      setIsSaving(true);
      const success = await onSave(template, themeColor);
      setIsSaving(false);
      if (!success) return;
    }

    // Small delay to ensure React state and DOM are fully settled after save-triggered re-renders
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = `${resume.title || "Resume"} - Cloud9`;
      window.print();
      document.title = originalTitle;
      toast.success("Download started");
    }, 500);
  };

  // Categorized Templates
  const categories = [
    {
      name: "Simple & Clean",
      items: [
        { id: "modern", name: "Modern", description: "Clean & professional" },
        { id: "minimal", name: "Minimal", description: "Focused on content" },
        { id: "compact", name: "Compact", description: "Space efficient" },
        { id: "dense", name: "Dense", description: "Maximized density" },
      ],
    },
    {
      name: "Professional",
      items: [
        {
          id: "classic",
          name: "Classic",
          description: "Traditional & elegant",
        },
        {
          id: "professional",
          name: "Professional",
          description: "Corporate style",
        },
        {
          id: "executive",
          name: "Executive",
          description: "Commanding presence",
        },
        { id: "elegant", name: "Elegant", description: "Refined serif look" },
      ],
    },
    {
      name: "Creative",
      items: [
        { id: "creative", name: "Creative", description: "Artistic sidebar" },
        { id: "bold", name: "Bold", description: "High contrast type" },
      ],
    },
    {
      name: "Technical",
      items: [
        { id: "tech", name: "Tech", description: "Monospace / Terminal" },
        { id: "grid", name: "Grid", description: "Structured boxes" },
        { id: "timeline", name: "Timeline", description: "Vertical timeline" },
      ],
    },
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

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="flex flex-col lg:flex-row gap-8 h-[80vh]">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-8 overflow-y-auto pr-2 custom-scrollbar no-print">
          {/* Templates */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <TemplateIcon size={16} className="text-blue-500" /> Select
              Template
            </h4>

            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.name}>
                  <h5 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    {category.name}
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {category.items.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                          template === t.id
                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 ring-offset-1"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        {template === t.id && (
                          <div className="absolute top-2 right-2 text-blue-600 bg-white rounded-full p-0.5 shadow-sm">
                            <CheckIcon size={12} />
                          </div>
                        )}
                        <div
                          className={`w-full h-16 rounded-lg mb-2 flex items-center justify-center ${
                            template === t.id ? "bg-blue-200/50" : "bg-gray-100"
                          }`}
                        >
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.id.substring(0, 2)}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-gray-900">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {t.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <PaletteIcon size={16} className="text-purple-500" /> Theme Color
            </h4>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setThemeColor(c.value)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none relative ${
                    themeColor === c.value
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  title={c.name}
                >
                  <div
                    className="w-full h-full rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: c.value }}
                  />
                  {themeColor === c.value && (
                    <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                      <CheckIcon size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              Actions
            </h4>
            <button
              onClick={handlePrint}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="animate-pulse">Saving Preferences...</span>
              ) : (
                <>
                  <DownloadIcon size={18} />
                  Download PDF
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center px-4">
              Your preferences are saved automatically when you download.
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-100 rounded-2xl border border-gray-200 overflow-hidden flex flex-col relative shadow-inner">
          {/* Preview Toolbar */}
          <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Live Preview
            </span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar bg-slate-100/50">
            <div
              className="transform origin-top transition-transform duration-300 w-[210mm]"
              style={{ transform: "scale(0.65)" }}
            >
              <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
                <ResumeRenderer
                  resume={resume}
                  sections={sections}
                  template={template as any}
                  themeColor={themeColor}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedModal>
  );
};
