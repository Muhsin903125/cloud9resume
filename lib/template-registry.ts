export interface TemplateContract {
  id: string;
  name: string;
  component: string;
  isAtsSafe: boolean;
  category: "ATS" | "MODERN" | "CREATIVE";
  version: string;
  previewUrl?: string;
}

export const TEMPLATE_REGISTRY: TemplateContract[] = [
  // ATS Templates
  {
    id: "ats",
    name: "Standard ATS",
    component: "AtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/ats-preview.png",
  },
  {
    id: "modern-ats",
    name: "Modern ATS",
    component: "ModernAtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/modern-ats-preview.png",
  },
  {
    id: "pro-ats",
    name: "Professional ATS",
    component: "ProfessionalAtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/professional-ats-preview.png",
  },
  {
    id: "creative-ats",
    name: "Creative ATS",
    component: "CreativeAtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/creative-ats-preview.png",
  },
  {
    id: "classic",
    name: "Classic",
    component: "ClassicTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/classic-preview.png",
  },
  {
    id: "executive",
    name: "Executive",
    component: "ExecutiveTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/executive-preview.png",
  },
  {
    id: "compact",
    name: "Compact",
    component: "CompactTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/compact-preview.png",
  },
  {
    id: "dense",
    name: "Dense",
    component: "DenseTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/dense-preview.png",
  },
  {
    id: "professional",
    name: "Professional",
    component: "ProfessionalTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
    previewUrl: "/templates/professional-preview.png",
  },

  // Modern Templates
  {
    id: "modern",
    name: "Modern",
    component: "ModernTemplate",
    isAtsSafe: true,
    category: "MODERN",
    version: "1.0.0",
    previewUrl: "/templates/modern-preview.png",
  },
  {
    id: "minimal",
    name: "Minimal",
    component: "MinimalTemplate",
    isAtsSafe: true,
    category: "MODERN",
    version: "1.0.0",
    previewUrl: "/templates/minimal-preview.png",
  },
  {
    id: "bold",
    name: "Bold",
    component: "BoldTemplate",
    isAtsSafe: true,
    category: "MODERN",
    version: "1.0.0",
    previewUrl: "/templates/bold-preview.png",
  },
  {
    id: "elegant",
    name: "Elegant",
    component: "ElegantTemplate",
    isAtsSafe: true,
    category: "MODERN",
    version: "1.0.0",
    previewUrl: "/templates/elegant-preview.png",
  },
  {
    id: "tech",
    name: "Tech",
    component: "TechTemplate",
    isAtsSafe: true,
    category: "MODERN",
    version: "1.0.0",
    previewUrl: "/templates/tech-preview.png",
  },

  // Creative Templates
  {
    id: "vibrant-creative",
    name: "Vibrant Creative",
    component: "VibrantCreativeTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
    previewUrl: "/templates/vibrant-creative-preview.png",
  },
  {
    id: "geometric-creative",
    name: "Geometric Creative",
    component: "GeometricCreativeTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
    previewUrl: "/templates/geometric-creative-preview.png",
  },
  {
    id: "creative",
    name: "Creative",
    component: "CreativeTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
    previewUrl: "/templates/creative-preview.png",
  },
  {
    id: "grid",
    name: "Grid",
    component: "GridTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
    previewUrl: "/templates/grid-preview.png",
  },
  {
    id: "timeline",
    name: "Timeline",
    component: "TimelineTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
    previewUrl: "/templates/timeline-preview.png",
  },
];

export const getAtsTemplates = () =>
  TEMPLATE_REGISTRY.filter((t) => t.isAtsSafe);
