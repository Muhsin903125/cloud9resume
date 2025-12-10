/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { TechTemplate } from "./templates/TechTemplate";
import { BoldTemplate } from "./templates/BoldTemplate";
import { CompactTemplate } from "./templates/CompactTemplate";
import { GridTemplate } from "./templates/GridTemplate";
import { TimelineTemplate } from "./templates/TimelineTemplate";
import { ElegantTemplate } from "./templates/ElegantTemplate";

interface ResumeRendererProps {
  resume: any;
  sections: any[];
  template?: string; // Changed to string to support many templates
  themeColor?: string;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  resume,
  sections,
  template = "modern",
  themeColor = "#3b82f6",
}) => {
  if (!resume || !sections) return null;

  // Helper to hex to rgba for backgrounds (shared across templates)
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const props = {
    resume,
    sections,
    themeColor,
    hexToRgba,
  };

  switch (template) {
    case "modern":
      return <ModernTemplate {...props} />;
    case "classic":
      return <ClassicTemplate {...props} />;
    case "minimal":
      return <MinimalTemplate {...props} />;
    case "professional":
      return <ProfessionalTemplate {...props} />;
    case "executive":
      return <ExecutiveTemplate {...props} />;
    case "creative":
      return <CreativeTemplate {...props} />;
    case "tech":
      return <TechTemplate {...props} />;
    case "bold":
      return <BoldTemplate {...props} />;
    case "compact":
      return <CompactTemplate {...props} />;
    case "grid":
      return <GridTemplate {...props} />;
    case "timeline":
      return <TimelineTemplate {...props} />;
    case "elegant":
      return <ElegantTemplate {...props} />;
    default:
      return <ModernTemplate {...props} />;
  }
};
