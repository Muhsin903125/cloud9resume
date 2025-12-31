import React from "react";

interface Section {
  id: string;
  section_type: string;
  section_data: any;
  is_visible: boolean;
}

interface TemplateProps {
  sections: Section[];
  settings?: { name?: string; jobTitle?: string; email?: string };
}

const ModernTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  const styles = {
    container: "min-h-full bg-white font-sans text-gray-800",
    header: "bg-gradient-to-br from-blue-50 to-white py-16 px-8 text-center",
    name: "text-4xl font-bold text-gray-900 mb-2",
    title: "text-xl text-blue-600 font-medium mb-4",
    contact: "text-sm text-gray-500 space-x-4",
    contentWrapper: "max-w-3xl mx-auto px-8 py-10",
    section: "mb-10",
    sectionTitle:
      "text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 pb-2 border-b-2 border-blue-100",
    card: "mb-4",
    itemTitle: "font-semibold text-gray-900",
    itemSubtitle: "text-blue-600 text-sm",
    itemDate: "text-gray-400 text-xs",
    itemDesc: "text-gray-600 text-sm mt-2 leading-relaxed",
    skillTag:
      "inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full mr-2 mb-2 font-medium",
    summary: "text-gray-600 leading-relaxed text-lg",
  };

  const renderExperience = (data: any) => (
    <div className="space-y-6">
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx} className={styles.card}>
          <div className="flex justify-between items-start">
            <div>
              <div className={styles.itemTitle}>
                {item.title || item.position}
              </div>
              <div className={styles.itemSubtitle}>{item.company}</div>
            </div>
            <div className={styles.itemDate}>
              {item.startDate} - {item.endDate || "Present"}
            </div>
          </div>
          {item.description && (
            <p className={styles.itemDesc}>{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderEducation = (data: any) => (
    <div className="space-y-4">
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx} className={styles.card}>
          <div className={styles.itemTitle}>{item.degree}</div>
          <div className={styles.itemSubtitle}>
            {item.institution || item.school}
          </div>
          {item.field && (
            <div className="text-gray-500 text-sm">{item.field}</div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSkills = (data: any) => (
    <div className="flex flex-wrap">
      {(data?.items || []).map((item: any, idx: number) => (
        <span key={idx} className={styles.skillTag}>
          {item.name || item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.name}>
          {personalInfo.name || settings?.name || "Your Name"}
        </h1>
        <p className={styles.title}>
          {personalInfo.jobTitle || settings?.jobTitle || "Professional Title"}
        </p>
        <div className={styles.contact}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && (
            <span>
              {typeof personalInfo.location === "string"
                ? personalInfo.location
                : personalInfo.location?.city}
            </span>
          )}
        </div>
      </header>

      <div className={styles.contentWrapper}>
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <div key={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {section.section_data?.title ||
                  getSectionLabel(section.section_type)}
              </h2>

              {section.section_type === "summary" && (
                <p className={styles.summary}>
                  {section.section_data?.text || section.section_data?.summary}
                </p>
              )}
              {(section.section_type === "experience" ||
                section.section_type === "projects") &&
                renderExperience(section.section_data)}
              {(section.section_type === "education" ||
                section.section_type === "certifications") &&
                renderEducation(section.section_data)}
              {section.section_type === "skills" &&
                renderSkills(section.section_data)}
              {![
                "personal_info",
                "summary",
                "experience",
                "education",
                "skills",
                "projects",
                "certifications",
              ].includes(section.section_type) && (
                <p className={styles.summary}>
                  {section.section_data?.content}
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    summary: "About Me",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
  };
  return labels[type] || type;
}

export default ModernTemplate;
