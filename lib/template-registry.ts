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
  // Deprecated / Hidden Templates:
  // Modern, Minimal, Compact, Dense, Professional, Creative, Bold, Tech, Grid, Timeline, Elegant
];

export const getAtsTemplates = () =>
  TEMPLATE_REGISTRY.filter((t) => t.isAtsSafe);
