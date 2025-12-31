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

const CreativeTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  const styles = {
    container:
      "min-h-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 font-sans text-gray-800",
    header:
      "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 py-20 px-8 text-center text-white",
    name: "text-5xl font-extrabold mb-3 drop-shadow-lg",
    title: "text-xl font-medium mb-6 opacity-90",
    contact: "text-sm opacity-80 space-x-4",
    contentWrapper: "max-w-3xl mx-auto px-8 py-12 -mt-8",
    section: "mb-10 bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-8",
    sectionTitle:
      "text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-6",
    itemTitle: "font-bold text-gray-900 text-lg",
    itemSubtitle: "text-purple-600 font-medium",
    itemDate: "text-gray-400 text-sm",
    itemDesc: "text-gray-600 text-sm mt-2 leading-relaxed",
    skillTag:
      "inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full mr-2 mb-2 font-medium shadow-sm",
    summary: "text-gray-600 leading-relaxed text-lg",
  };

  const renderExperience = (data: any) => (
    <div className="space-y-6">
      {(data?.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="border-l-4 border-gradient-to-b from-purple-400 to-pink-400 pl-4 border-purple-300"
        >
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
        <div key={idx} className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold">
            {(item.degree || "?")[0]}
          </div>
          <div>
            <div className={styles.itemTitle}>{item.degree}</div>
            <div className={styles.itemSubtitle}>
              {item.institution || item.school}
            </div>
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
    summary: "Hey There!",
    experience: "My Journey",
    education: "Learning",
    skills: "What I Do",
    projects: "Cool Stuff",
    certifications: "Achievements",
  };
  return labels[type] || type;
}

export default CreativeTemplate;
