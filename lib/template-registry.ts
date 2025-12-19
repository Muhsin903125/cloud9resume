export interface TemplateContract {
  id: string;
  name: string;
  description: string;
  component: string; // The key used in index.ts exports or ResumeRenderer
  isAtsSafe: boolean;
  category: "ATS" | "MODERN" | "CREATIVE";
  version: string;
}

export const TEMPLATE_REGISTRY: TemplateContract[] = [
  {
    id: "ats",
    name: "Standard ATS",
    description:
      "Highly optimized for Applicant Tracking Systems. Text-first layout.",
    component: "AtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
  },
  {
    id: "modern-ats",
    name: "Modern ATS",
    description:
      "Sleek, minimalist layout with high readability. Built for tech and design.",
    component: "ModernAtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
  },
  {
    id: "pro-ats",
    name: "Professional ATS",
    description:
      "Traditional corporate layout with a refined serif touch. Best for executive roles.",
    component: "ProfessionalAtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
  },
  {
    id: "creative-ats",
    name: "Creative ATS",
    description:
      "Linear layout with bold headers and dynamic styling. 100% ATS safe.",
    component: "CreativeAtsTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout. ATS-friendly.",
    component: "ClassicTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Senior roles. Serif fonts. ATS-friendly.",
    component: "ExecutiveTemplate",
    isAtsSafe: true,
    category: "ATS",
    version: "1.0.0",
  },
  {
    id: "vibrant-creative",
    name: "Vibrant Creative",
    description:
      "Bold, high-contrast design with modern accents. Ideal for high-impact roles.",
    component: "VibrantCreativeTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
  },
  {
    id: "geometric-creative",
    name: "Geometric Creative",
    description:
      "Structured, boxed layout with bold borders and modern typography.",
    component: "GeometricCreativeTemplate",
    isAtsSafe: true,
    category: "CREATIVE",
    version: "1.0.0",
  },
];

export const getAtsTemplates = () =>
  TEMPLATE_REGISTRY.filter((t) => t.isAtsSafe);
