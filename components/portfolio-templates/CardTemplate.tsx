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

const CardTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  const styles = {
    container: "min-h-full bg-gray-100 font-sans text-gray-800 p-6",
    header: "bg-white rounded-2xl shadow-lg p-8 mb-6 text-center",
    avatar:
      "w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg",
    name: "text-2xl font-bold text-gray-900 mb-1",
    title: "text-blue-600 font-medium mb-3",
    contact: "text-sm text-gray-500 flex flex-wrap justify-center gap-3",
    grid: "grid md:grid-cols-2 gap-4",
    card: "bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow",
    sectionTitle:
      "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4",
    itemTitle: "font-semibold text-gray-900",
    itemSubtitle: "text-blue-600 text-sm",
    itemDate: "text-gray-400 text-xs",
    itemDesc: "text-gray-600 text-sm mt-2 leading-relaxed",
    skillTag:
      "inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg mr-2 mb-2",
    summary: "text-gray-600 leading-relaxed",
  };

  const renderExperience = (data: any) => (
    <div className="space-y-4">
      {(data?.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
        >
          <div className={styles.itemTitle}>{item.title || item.position}</div>
          <div className={styles.itemSubtitle}>{item.company}</div>
          <div className={styles.itemDate}>
            {item.startDate} - {item.endDate || "Present"}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducation = (data: any) => (
    <div className="space-y-3">
      {(data?.items || []).map((item: any, idx: number) => (
        <div key={idx}>
          <div className={styles.itemTitle}>{item.degree}</div>
          <div className={styles.itemSubtitle}>
            {item.institution || item.school}
          </div>
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

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {getInitials(personalInfo.name || settings?.name || "")}
        </div>
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
      </div>

      {/* Cards Grid */}
      <div className={styles.grid}>
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <div key={section.id} className={styles.card}>
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
    summary: "About",
    experience: "Work",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
  };
  return labels[type] || type;
}

export default CardTemplate;
