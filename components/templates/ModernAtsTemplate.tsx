import React from "react";

interface ModernAtsTemplateProps {
  resume: any;
  sections: any[];
  themeColor?: string;
  font?: string;
  hexToRgba?: (hex: string, alpha: number) => string;
}

export const ModernAtsTemplate: React.FC<ModernAtsTemplateProps> = ({
  resume,
  sections,
  themeColor = "#3b82f6",
  font = "'Inter', sans-serif",
}) => {
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      className="bg-white text-slate-900 p-[20mm] mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font,
        lineHeight: "1.6",
      }}
    >
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
          {personalInfo.name ||
            personalInfo.fullName ||
            resume.title ||
            "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              {personalInfo.phone}
            </span>
          )}
          {(personalInfo.city || personalInfo.address) && (
            <span>
              {[personalInfo.city || personalInfo.address, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              LinkedIn:{" "}
              {personalInfo.linkedin.replace(
                /^https?:\/\/(www\.)?linkedin\.com\/in\//,
                ""
              )}
            </span>
          )}
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section: any) => {
          const { section_type, section_data } = section;
          if (!section_data || section_type === "personal_info") return null;

          return (
            <section key={section.id} className="break-inside-avoid">
              <div className="flex items-center gap-4 mb-5">
                <h2
                  className="text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                  style={{ color: themeColor }}
                >
                  {section.title || section_type.replace("_", " ")}
                </h2>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              {/* Summary / Text Sections */}
              {(section_type === "summary" ||
                section_type === "declaration") && (
                <p className="text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">
                  {section_data.text || section_data}
                </p>
              )}

              {/* List based sections */}
              {!["summary", "skills", "languages", "declaration"].includes(
                section_type
              ) && (
                <div className="space-y-8">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {item.position ||
                              item.title ||
                              item.degree ||
                              item.school ||
                              item.institution ||
                              item.language}
                          </h3>
                          <div
                            className="text-sm font-medium"
                            style={{ color: themeColor }}
                          >
                            {item.company ||
                              item.issuer ||
                              item.school ||
                              item.institution ||
                              item.degree}
                            {item.location && (
                              <span className="text-slate-400 font-normal ml-2">
                                / {item.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                          {item.startDate ? `${item.startDate} — ` : ""}
                          {item.endDate || item.date || item.graduationDate}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed text-justify whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {item.points && Array.isArray(item.points) && (
                        <ul className="list-disc ml-5 text-sm mt-3 space-y-1.5 text-slate-600">
                          {item.points.map((pt: string, i: number) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills / Languages */}
              {(section_type === "skills" || section_type === "languages") && (
                <div className="flex flex-wrap gap-2">
                  {typeof section_data === "object" &&
                    !Array.isArray(section_data) && (
                      <div className="w-full space-y-3">
                        {Object.keys(section_data).map((category, idx) => {
                          if (category === "items") return null;
                          const skills = section_data[category];
                          if (!Array.isArray(skills)) return null;
                          return (
                            <div
                              key={idx}
                              className="flex gap-4 items-baseline"
                            >
                              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[100px]">
                                {category}
                              </span>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-700">
                                {skills.map((s, i) => (
                                  <span
                                    key={i}
                                    className="flex items-center gap-2"
                                  >
                                    {typeof s === "string"
                                      ? s
                                      : s.name || s.language}
                                    {i < skills.length - 1 && (
                                      <span className="text-slate-200">|</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {(Array.isArray(section_data) ||
                    Array.isArray(section_data?.items)) && (
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(section_data)
                        ? section_data
                        : section_data.items
                      ).map((item: any, i: number) => (
                        <span
                          key={i}
                          className="text-sm text-slate-700 px-3 py-1 bg-slate-50 rounded-full border border-slate-100"
                        >
                          {typeof item === "string"
                            ? item
                            : section_type === "languages"
                            ? `${item.language} (${item.proficiency})`
                            : item.name || item.skill || item.language}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
