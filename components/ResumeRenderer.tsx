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
import { DenseTemplate } from "./templates/DenseTemplate";
import { AtsTemplate } from "./templates/AtsTemplate";

interface ResumeRendererProps {
  resume: any;
  sections: any[];
  template?: string;
  themeColor?: string;
  settings?: {
    font?: string;
    secondary_color?: string;
    [key: string]: any;
  };
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  resume,
  sections,
  template = "modern",
  themeColor = "#3b82f6",
  settings = {},
}) => {
  if (!resume || !sections) return null;

  // Font mapping
  const fontMap: { [key: string]: string } = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    manrope: "'Manrope', sans-serif",
    poppins: "'Poppins', sans-serif",
    calibri: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
    arial: "Arial, Helvetica, sans-serif",
    lora: "'Lora', serif",
    merriweather: "'Merriweather', serif",
    playfair: "'Playfair Display', serif",
    roboto_mono: "'Roboto Mono', monospace",
  };

  const currentFont = settings.font
    ? fontMap[settings.font] || "inherit"
    : "inherit";

  // Filter and Sort Sections
  let processedSections = sections;

  if (settings.section_order && settings.section_order.length > 0) {
    processedSections = [...processedSections].sort((a, b) => {
      const idxA = settings.section_order!.indexOf(a.section_type);
      const idxB = settings.section_order!.indexOf(b.section_type);
      // If not in order list, push to end
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  if (settings.hidden_sections && settings.hidden_sections.length > 0) {
    processedSections = processedSections.filter(
      (s) => !settings.hidden_sections!.includes(s.section_type)
    );
  }

  // Helper to hex to rgba for backgrounds (shared across templates)
  const hexToRgba = (hex: string, alpha: number) => {
    // Basic hex support
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Filter out empty sections globally
  const filteredSections = processedSections.filter((section) => {
    const { section_type, section_data } = section;
    if (!section_data) return false;

    // Check for empty object
    if (
      typeof section_data === "object" &&
      !Array.isArray(section_data) &&
      Object.keys(section_data).length === 0
    ) {
      return false;
    }
    // Arrays
    if (Array.isArray(section_data)) {
      return section_data.length > 0;
    }
    // Object with items array
    if (section_data.items && Array.isArray(section_data.items)) {
      return section_data.items.length > 0;
    }
    // Text based
    if (section_type === "summary") {
      return section_data.text && section_data.text.trim().length > 0;
    }
    return true;
  });

  const props = {
    resume,
    sections: filteredSections,
    themeColor,
    secondaryColor: settings.secondary_color || themeColor,
    font: currentFont,
    hexToRgba,
  };

  return (
    <div style={{ fontFamily: currentFont }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Roboto+Mono:wght@400;500&family=Roboto:wght@300;400;500;700&display=swap');
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Ensure backgrounds print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {(() => {
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
          case "dense":
            return <DenseTemplate {...props} />;
          case "ats":
            return <AtsTemplate {...props} />;
          default:
            return <ModernTemplate {...props} />;
        }
      })()}
    </div>
  );
};
