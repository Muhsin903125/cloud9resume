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

const DarkTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  const styles = {
    container: "min-h-full bg-gray-900 font-sans text-gray-100",
    header:
      "bg-gradient-to-b from-cyan-900/30 to-transparent py-20 px-8 text-center",
    name: "text-5xl font-bold text-white mb-3 tracking-tight",
    title: "text-xl text-cyan-400 font-medium mb-6",
    contact: "text-sm text-gray-400 space-x-4",
    contentWrapper: "max-w-3xl mx-auto px-8 py-10",
    section: "mb-12",
    sectionTitle:
      "text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6",
    card: "bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700/50 backdrop-blur",
    itemTitle: "font-semibold text-white text-lg",
    itemSubtitle: "text-cyan-400 text-sm",
    itemDate: "text-gray-500 text-xs",
    itemDesc: "text-gray-400 text-sm mt-3 leading-relaxed",
    skillTag:
      "inline-block px-4 py-2 bg-cyan-900/40 text-cyan-300 text-sm rounded-lg mr-2 mb-2 border border-cyan-800/50",
    summary: "text-gray-300 leading-relaxed text-lg",
  };

  const renderExperience = (data: any) => (
    <div className="space-y-4">
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx} className={styles.card}>
          <div className="flex justify-between items-start mb-2">
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
            <div className="text-gray-500 text-sm mt-1">{item.field}</div>
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
                <div className={styles.card}>
                  <p className="text-gray-300">
                    {section.section_data?.content}
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    summary: "About",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
  };
  return labels[type] || type;
}

export default DarkTemplate;
