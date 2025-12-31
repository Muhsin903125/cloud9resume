import React from "react";

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  previewColors: { bg: string; accent: string; text: string };
  isPremium?: boolean;
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional",
    previewColors: { bg: "#ffffff", accent: "#3b82f6", text: "#1f2937" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
    previewColors: { bg: "#fafafa", accent: "#000000", text: "#374151" },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold and colorful",
    previewColors: { bg: "#f3e8ff", accent: "#7c3aed", text: "#1f2937" },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark theme with glow",
    previewColors: { bg: "#0f172a", accent: "#22d3ee", text: "#f1f5f9" },
  },
  {
    id: "card",
    name: "Card",
    description: "Grid-based layout",
    previewColors: { bg: "#f1f5f9", accent: "#0ea5e9", text: "#0f172a" },
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Chronological focus",
    previewColors: { bg: "#ffffff", accent: "#10b981", text: "#1f2937" },
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Choose Template</h3>
      <div className="grid grid-cols-3 gap-3">
        {PORTFOLIO_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`relative p-3 rounded-xl border-2 transition-all ${
              selectedTemplate === template.id
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Mini Preview */}
            <div
              className="h-16 rounded-lg mb-2 flex flex-col justify-center items-center overflow-hidden"
              style={{ backgroundColor: template.previewColors.bg }}
            >
              <div
                className="w-6 h-6 rounded-full mb-1"
                style={{ backgroundColor: template.previewColors.accent }}
              />
              <div
                className="w-10 h-1 rounded"
                style={{
                  backgroundColor: template.previewColors.text,
                  opacity: 0.3,
                }}
              />
              <div
                className="w-8 h-1 rounded mt-0.5"
                style={{
                  backgroundColor: template.previewColors.text,
                  opacity: 0.2,
                }}
              />
            </div>

            {/* Label */}
            <div className="text-xs font-medium text-gray-800">
              {template.name}
            </div>
            <div className="text-xs text-gray-500">{template.description}</div>

            {/* Selected indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}

            {/* Premium badge */}
            {template.isPremium && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                PRO
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
