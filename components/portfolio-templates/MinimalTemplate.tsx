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

const MinimalTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  const styles = {
    container: "min-h-full bg-white font-serif text-gray-800",
    header: "py-16 px-8 text-center border-b border-gray-100",
    name: "text-3xl font-normal text-gray-900 mb-2 tracking-wide",
    title: "text-lg text-gray-500 font-light mb-4 italic",
    contact: "text-sm text-gray-400 space-x-3",
    contentWrapper: "max-w-2xl mx-auto px-8 py-12",
    section: "mb-12",
    sectionTitle:
      "text-xs font-normal text-gray-400 uppercase tracking-[0.3em] mb-6 text-center",
    divider: "w-12 h-px bg-gray-200 mx-auto mb-8",
    itemTitle: "font-medium text-gray-900",
    itemSubtitle: "text-gray-500 text-sm",
    itemDate: "text-gray-400 text-xs italic",
    itemDesc: "text-gray-600 text-sm mt-2 leading-loose",
    skillTag:
      "inline-block text-sm text-gray-600 after:content-['·'] after:mx-2 after:text-gray-300 last:after:content-none",
    summary: "text-gray-600 leading-loose text-center italic",
  };

  const renderExperience = (data: any) => (
    <div className="space-y-8">
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx} className="text-center">
          <div className={styles.itemTitle}>{item.title || item.position}</div>
          <div className={styles.itemSubtitle}>{item.company}</div>
          <div className={styles.itemDate}>
            {item.startDate} — {item.endDate || "Present"}
          </div>
          {item.description && (
            <p className={styles.itemDesc}>{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderEducation = (data: any) => (
    <div className="space-y-6 text-center">
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx}>
          <div className={styles.itemTitle}>{item.degree}</div>
          <div className={styles.itemSubtitle}>
            {item.institution || item.school}
          </div>
          {item.field && (
            <div className="text-gray-400 text-sm italic">{item.field}</div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSkills = (data: any) => (
    <div className="text-center">
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
          {personalInfo.phone && <span>·</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
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
              <div className={styles.divider}></div>

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
    summary: "About",
    experience: "Experience",
    education: "Education",
    skills: "Expertise",
    projects: "Projects",
    certifications: "Credentials",
  };
  return labels[type] || type;
}

export default MinimalTemplate;
