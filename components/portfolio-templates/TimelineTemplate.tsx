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

const TimelineTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  const styles = {
    container: "min-h-full bg-white font-sans text-gray-800",
    header: "bg-emerald-600 py-16 px-8 text-center text-white",
    name: "text-4xl font-bold mb-2",
    title: "text-lg opacity-90 mb-4",
    contact: "text-sm opacity-80 space-x-4",
    contentWrapper: "max-w-3xl mx-auto px-8 py-12",
    section: "mb-12",
    sectionTitle:
      "text-sm font-bold text-emerald-600 uppercase tracking-wider mb-6 flex items-center gap-3",
    titleLine: "flex-1 h-px bg-emerald-200",
    timeline: "relative pl-8 border-l-2 border-emerald-200",
    timelineItem: "relative mb-8 last:mb-0",
    timelineDot:
      "absolute -left-[25px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow",
    itemTitle: "font-semibold text-gray-900",
    itemSubtitle: "text-emerald-600 text-sm",
    itemDate: "text-gray-400 text-xs mb-2",
    itemDesc: "text-gray-600 text-sm mt-2 leading-relaxed",
    skillTag:
      "inline-block px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg mr-2 mb-2 border border-emerald-100",
    summary:
      "text-gray-600 leading-relaxed text-lg border-l-4 border-emerald-300 pl-4 italic",
  };

  const renderExperience = (data: any) => (
    <div className={styles.timeline}>
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx} className={styles.timelineItem}>
          <div className={styles.timelineDot}></div>
          <div className={styles.itemDate}>
            {item.startDate} - {item.endDate || "Present"}
          </div>
          <div className={styles.itemTitle}>{item.title || item.position}</div>
          <div className={styles.itemSubtitle}>{item.company}</div>
          {item.description && (
            <p className={styles.itemDesc}>{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderEducation = (data: any) => (
    <div className={styles.timeline}>
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx} className={styles.timelineItem}>
          <div className={styles.timelineDot}></div>
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
        </div>
      </header>

      <div className={styles.contentWrapper}>
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <div key={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span>
                  {section.section_data?.title ||
                    getSectionLabel(section.section_type)}
                </span>
                <div className={styles.titleLine}></div>
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
    summary: "About",
    experience: "Career Timeline",
    education: "Education",
    skills: "Expertise",
    projects: "Projects",
    certifications: "Achievements",
  };
  return labels[type] || type;
}

export default TimelineTemplate;
