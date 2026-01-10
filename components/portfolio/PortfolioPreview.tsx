import React from "react";
import { TEMPLATE_COMPONENTS } from "../portfolio-templates";
import { PORTFOLIO_TEMPLATES } from "./TemplateSelector";

interface Section {
  id: string;
  section_type: string;
  section_data: any;
  is_visible: boolean;
}

interface PortfolioPreviewProps {
  sections: Section[];
  templateId: string;
  portfolioSettings?: {
    name?: string;
    jobTitle?: string;
    email?: string;
  };
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  sections,
  templateId,
  portfolioSettings,
}) => {
  // Get the template component for this templateId
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId];

  // If we have a matching template component, use it
  if (TemplateComponent) {
    return (
      <TemplateComponent sections={sections} settings={portfolioSettings} />
    );
  }

  // Fallback to inline rendering if no template found
  const template =
    PORTFOLIO_TEMPLATES.find((t) => t.id === templateId) ||
    PORTFOLIO_TEMPLATES[0];
  const colors = template.previewColors;
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: "100%",
        padding: "40px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
          {personalInfo.name || portfolioSettings?.name || "Your Name"}
        </h1>
        <p style={{ color: colors.accent, fontSize: "16px" }}>
          {personalInfo.jobTitle ||
            portfolioSettings?.jobTitle ||
            "Professional Title"}
        </p>
      </div>

      {visibleSections
        .filter((s) => s.section_type !== "personal_info")
        .map((section) => (
          <div key={section.id} style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: colors.accent,
                textTransform: "uppercase",
                marginBottom: "16px",
                letterSpacing: "0.05em",
              }}
            >
              {section.section_data?.title || section.section_type}
            </h2>
            {section.section_type === "custom" &&
            section.section_data?.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: section.section_data.content,
                }}
                className="prose prose-sm max-w-none text-current"
                style={{ color: "inherit" }}
              />
            ) : (
              <p style={{ opacity: 0.8 }}>
                {section.section_data?.text ||
                  section.section_data?.summary ||
                  section.section_data?.content ||
                  "No content"}
              </p>
            )}
          </div>
        ))}
    </div>
  );
};

export default PortfolioPreview;
