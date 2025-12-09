import React, { useState } from "react";
import SharedModal from "./SharedModal";
import { ResumeRenderer } from "./ResumeRenderer";
import { DownloadIcon, EyeIcon } from "./Icons";
import { toast } from "react-hot-toast";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: any;
  sections: any[];
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resume,
  sections,
}) => {
  const [template, setTemplate] = useState<"modern" | "classic" | "minimal">(
    "modern"
  );

  const handlePrint = () => {
    // Create a print-friendly window or use current window styles
    const printContent = document.getElementById("resume-preview-content");
    if (!printContent) {
      toast.error("Preview not ready");
      return;
    }

    // Temporary print styles
    const originalTitle = document.title;
    document.title = `${resume.title || "Resume"} - Cloud9`;

    // Add print class to body to hide other elements (needs CSS support or just simplistic window.print)
    // For now, simple window print usage - user might need to use browser print dialog
    window.print();

    document.title = originalTitle;
    toast.success("Download started");
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Preview"
      size="xl"
    >
      <div className="flex flex-col md:flex-row gap-6 h-[80vh]">
        {/* Sidebar Controls */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6 overflow-y-auto pr-2">
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
              Select Template
            </h4>
            <div className="space-y-2">
              {["modern", "classic"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    template === t
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="font-medium capitalize">{t}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t === "modern"
                      ? "Clean & Professional"
                      : "Traditional & Elegant"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
              Actions
            </h4>
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-all"
            >
              <DownloadIcon size={18} />
              Download PDF
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Opens browser print dialog. Select "Save as PDF".
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="transform scale-[0.6] md:scale-[0.85] origin-top transition-transform">
            <ResumeRenderer
              resume={resume}
              sections={sections}
              template={template}
            />
          </div>
        </div>
      </div>
    </SharedModal>
  );
};
