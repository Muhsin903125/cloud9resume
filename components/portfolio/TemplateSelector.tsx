import React, { useState } from "react";
import {
  SparklesIcon,
  CheckIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  previewColors: { bg: string; accent: string; text: string };
  isPremium: boolean;
  category: "free" | "premium";
  previewStyle?:
    | "glassmorphism"
    | "gradient"
    | "terminal"
    | "elegant"
    | "neon"
    | "organic"
    | "standard";
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  // Free Templates
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional design",
    previewColors: { bg: "#ffffff", accent: "#3b82f6", text: "#1f2937" },
    isPremium: false,
    category: "free",
    previewStyle: "standard",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant layout",
    previewColors: { bg: "#fafafa", accent: "#000000", text: "#374151" },
    isPremium: false,
    category: "free",
    previewStyle: "standard",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark theme with glow effects",
    previewColors: { bg: "#0f172a", accent: "#22d3ee", text: "#f1f5f9" },
    isPremium: false,
    category: "free",
    previewStyle: "standard",
  },
  {
    id: "card",
    name: "Card",
    description: "Grid-based card layout",
    previewColors: { bg: "#f1f5f9", accent: "#0ea5e9", text: "#0f172a" },
    isPremium: false,
    category: "free",
    previewStyle: "standard",
  },
  // Premium Templates
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Frosted glass aesthetic",
    previewColors: { bg: "#1e1b4b", accent: "#a78bfa", text: "#f5f3ff" },
    isPremium: true,
    category: "premium",
    previewStyle: "glassmorphism",
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Bold gradient backgrounds",
    previewColors: { bg: "#7c3aed", accent: "#f472b6", text: "#ffffff" },
    isPremium: true,
    category: "premium",
    previewStyle: "gradient",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Terminal-inspired design",
    previewColors: { bg: "#0d1117", accent: "#58a6ff", text: "#c9d1d9" },
    isPremium: true,
    category: "premium",
    previewStyle: "terminal",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Luxury with gold accents",
    previewColors: { bg: "#1a1a2e", accent: "#d4af37", text: "#eaeaea" },
    isPremium: true,
    category: "premium",
    previewStyle: "elegant",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon futuristic style",
    previewColors: { bg: "#050505", accent: "#00ff9d", text: "#e4e4e7" },
    isPremium: true,
    category: "premium",
    previewStyle: "neon",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Organic and fresh look",
    previewColors: { bg: "#f0fdf4", accent: "#16a34a", text: "#14532d" },
    isPremium: true,
    category: "premium",
    previewStyle: "organic",
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
  userPlan?: "free" | "professional" | "premium" | "enterprise";
  onAIGenerate: () => void;
  isGenerating: boolean;
  resumeData: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
  userPlan = "free",
  onAIGenerate,
  isGenerating,
  resumeData,
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const canUsePremium = userPlan !== "free";

  // Sort templates: Premium first, then by name
  const sortedTemplates = [...PORTFOLIO_TEMPLATES].sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleTemplateClick = (template: PortfolioTemplate) => {
    onSelect(template.id);
  };

  const renderTemplatePreview = (template: PortfolioTemplate) => {
    const { previewColors, previewStyle } = template;

    if (previewStyle === "glassmorphism") {
      return (
        <div
          className="h-24 rounded-lg overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, ${previewColors.bg} 0%, #312e81 100%)`,
          }}
        >
          <div
            className="absolute inset-2 rounded-md backdrop-blur-sm flex flex-col justify-center items-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full mb-1"
              style={{ backgroundColor: previewColors.accent, opacity: 0.8 }}
            />
            <div
              className="w-12 h-1 rounded"
              style={{ backgroundColor: previewColors.text, opacity: 0.5 }}
            />
          </div>
        </div>
      );
    }

    if (previewStyle === "gradient") {
      return (
        <div
          className="h-24 rounded-lg overflow-hidden flex flex-col justify-center items-center"
          style={{
            background: `linear-gradient(135deg, ${previewColors.bg} 0%, ${previewColors.accent} 100%)`,
          }}
        >
          <div className="w-10 h-10 rounded-full mb-1 bg-white/20" />
          <div className="w-14 h-1.5 rounded bg-white/40" />
          <div className="w-10 h-1 rounded bg-white/20 mt-1" />
        </div>
      );
    }

    if (previewStyle === "terminal") {
      return (
        <div
          className="h-24 rounded-lg overflow-hidden p-2 font-mono text-xs"
          style={{ backgroundColor: previewColors.bg }}
        >
          <div className="flex gap-1 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div style={{ color: previewColors.accent }} className="opacity-80">
            <span style={{ color: "#7ee787" }}>→</span> portfolio.init()
          </div>
          <div
            style={{ color: previewColors.text }}
            className="opacity-50 mt-0.5"
          >
            <span style={{ color: previewColors.accent }}>const</span> name =
            "..."
          </div>
        </div>
      );
    }

    if (previewStyle === "elegant") {
      return (
        <div
          className="h-24 rounded-lg overflow-hidden flex flex-col justify-center items-center"
          style={{ backgroundColor: previewColors.bg }}
        >
          <div
            className="w-10 h-10 rounded-full mb-2 border-2"
            style={{ borderColor: previewColors.accent }}
          />
          <div
            className="w-16 h-0.5"
            style={{ backgroundColor: previewColors.accent }}
          />
          <div
            className="w-12 h-1 rounded mt-2"
            style={{ backgroundColor: previewColors.text, opacity: 0.3 }}
          />
        </div>
      );
    }

    if (previewStyle === "neon") {
      return (
        <div
          className="h-24 rounded-lg overflow-hidden flex flex-col justify-center items-center"
          style={{
            backgroundColor: previewColors.bg,
            border: `1px solid ${previewColors.accent}`,
          }}
        >
          <div
            className="w-10 h-10 rounded-full mb-2 border-2"
            style={{
              borderColor: previewColors.accent,
              boxShadow: `0 0 10px ${previewColors.accent}`,
            }}
          />
          <div className="w-12 h-1 rounded bg-gray-600" />
        </div>
      );
    }

    if (previewStyle === "organic") {
      return (
        <div
          className="h-24 rounded-lg overflow-hidden flex flex-col justify-center items-center relative"
          style={{ backgroundColor: previewColors.bg }}
        >
          <div
            className="absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8"
            style={{ backgroundColor: previewColors.accent, opacity: 0.2 }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-12 h-12 rounded-full -ml-4 -mb-4"
            style={{ backgroundColor: previewColors.accent, opacity: 0.2 }}
          ></div>
          <div
            className="w-10 h-10 rounded-full mb-2"
            style={{ backgroundColor: previewColors.accent }}
          />
          <div
            className="w-12 h-1 rounded"
            style={{ backgroundColor: previewColors.text, opacity: 0.6 }}
          />
        </div>
      );
    }

    // Standard preview
    return (
      <div
        className="h-24 rounded-lg flex flex-col justify-center items-center overflow-hidden"
        style={{ backgroundColor: previewColors.bg }}
      >
        <div
          className="w-8 h-8 rounded-full mb-1"
          style={{ backgroundColor: previewColors.accent }}
        />
        <div
          className="w-12 h-1 rounded"
          style={{ backgroundColor: previewColors.text, opacity: 0.3 }}
        />
        <div
          className="w-10 h-1 rounded mt-0.5"
          style={{ backgroundColor: previewColors.text, opacity: 0.2 }}
        />
      </div>
    );
  };

  const TemplateCard = ({ template }: { template: PortfolioTemplate }) => {
    const isSelected = selectedTemplate === template.id;
    const isPremiumPreview = template.isPremium && !canUsePremium;
    const isHovered = hoveredTemplate === template.id;

    return (
      <button
        onClick={() => handleTemplateClick(template)}
        onMouseEnter={() => setHoveredTemplate(template.id)}
        onMouseLeave={() => setHoveredTemplate(null)}
        className={`relative p-3 rounded-2xl border-2 transition-all duration-300 text-left group ${
          isSelected
            ? template.isPremium && !canUsePremium
              ? "border-amber-500 ring-4 ring-amber-100 shadow-lg"
              : "border-blue-500 ring-4 ring-blue-100 shadow-lg"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
      >
        {/* Preview */}
        <div className="relative">
          {renderTemplatePreview(template)}

          {/* Hover overlay for premium preview templates */}
          {isPremiumPreview && isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 to-transparent rounded-lg flex flex-col items-end justify-end p-2">
              <span className="text-white text-[10px] font-medium bg-amber-600 px-2 py-0.5 rounded shadow-sm">
                Preview Only • Upgrade to Publish
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              {template.name}
            </h4>
            {isSelected && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
        </div>

        {/* Premium Badge - Only show for free users to encourage upgrade */}
        {template.isPremium && !canUsePremium && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
            <SparklesIcon className="w-3 h-3" />
            PRO
          </div>
        )}

        {/* Preview badge for premium templates (for free users) */}
        {isPremiumPreview && isSelected && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-sm">
            PREVIEW
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Choose Workspace Design
        </h3>
        {!canUsePremium && (
          <a
            href="/plans"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
          >
            <SparklesIcon className="w-3 h-3" />
            Upgrade for all templates
          </a>
        )}
      </div>

      {/* Unified Template Grid + AI Card */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* AI Generator Card */}
        <button
          onClick={onAIGenerate}
          disabled={isGenerating}
          className={`relative p-3 rounded-2xl border-2 transition-all duration-500 text-left group overflow-hidden ${
            isGenerating
              ? "border-purple-200 bg-purple-50/30"
              : "border-purple-500/20 hover:border-purple-500 bg-gradient-to-br from-white to-purple-50/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
          }`}
        >
          <div className="h-24 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Sparkles effect */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>

            <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>

            {!resumeData && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
                <p className="text-[10px] font-bold text-white leading-tight">
                  Import Resume First
                </p>
              </div>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-gray-900 tracking-tight group-hover:text-purple-600 transition-colors">
                AI Agent Design
              </h4>
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-[10px]">✨</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 font-medium leading-tight">
              Let AI build a unique design from your data.
            </p>
          </div>

          {/* New Tag */}
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[8px] font-black rounded-full shadow-lg border border-white/10 uppercase tracking-widest z-20">
            Next Gen
          </div>
        </button>

        {sortedTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Image Upload Hint - Moved to bottom for cleaner look */}
      <div className="flex items-center gap-3 p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 mt-8">
        <div className="w-12 h-12 bg-white rounded-xl border border-blue-100 flex items-center justify-center shadow-sm">
          <PhotoIcon className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-800 font-bold">
            Looking for more visual impact?
          </p>
          <p className="text-xs text-gray-500">
            Upload project screenshots and certificates in the Content tab to
            make these templates truly shine.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
