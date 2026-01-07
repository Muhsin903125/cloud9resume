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
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      className="bg-white text-slate-900 p-[12mm] mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font,
        lineHeight: "1.6",
      }}
    >
      {/* Header */}
      <header className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900">
          {personalInfo.name ||
            personalInfo.fullName ||
            resume.title ||
            "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
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

      <div className="space-y-5">
        {/* Helper for sections */}
        {(() => {
          const renderListSection = (section: any) => {
            if (!section || !section.section_data) return null;
            const { section_type, section_data } = section;
            const items = Array.isArray(section_data)
              ? section_data
              : section_data?.items || [];
            if (items.length === 0) return null;

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

                <div className="space-y-4">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
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
              </section>
            );
          };

          const renderSkillsSection = (section: any) => {
            if (!section || !section.section_data) return null;
            return (
              <section key={section.id} className="break-inside-avoid">
                <div className="flex items-center gap-4 mb-5">
                  <h2
                    className="text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                    style={{ color: themeColor }}
                  >
                    Skills
                  </h2>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="text-sm text-slate-700">
                  {(() => {
                    const data = section.section_data;
                    const categories =
                      typeof data === "object" && !Array.isArray(data)
                        ? Object.keys(data).filter((k) => k !== "items")
                        : [];

                    if (categories.length > 0) {
                      return (
                        <div className="space-y-3">
                          {categories.map((category, idx) => {
                            const skills = data[category];
                            if (!Array.isArray(skills)) return null;
                            return (
                              <div key={idx} className="flex gap-4">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[120px] shrink-0">
                                  {category}
                                </span>
                                <div className="flex flex-wrap gap-x-2 gap-y-1">
                                  {skills.map((s, i) => (
                                    <React.Fragment key={i}>
                                      <span>
                                        {typeof s === "string" ? s : s.name}
                                      </span>
                                      {i < skills.length - 1 && (
                                        <span className="text-slate-200">
                                          |
                                        </span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    const items = Array.isArray(data) ? data : data.items || [];
                    return (
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {items.map((item: any, i: number) => (
                          <React.Fragment key={i}>
                            <span>
                              {typeof item === "string" ? item : item.name}
                            </span>
                            {i < items.length - 1 && (
                              <span className="text-slate-200">|</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </section>
            );
          };

          const experience = sortedSections.find(
            (s) => s.section_type === "experience"
          );
          const skills = sortedSections.find(
            (s) => s.section_type === "skills"
          );
          const education = sortedSections.find(
            (s) => s.section_type === "education"
          );
          const summary = sortedSections.find(
            (s) => s.section_type === "summary"
          );

          return (
            <>
              {/* 1. Summary */}
              {summary && (
                <section className="break-inside-avoid">
                  <p className="text-xs text-slate-600 leading-snug text-justify whitespace-pre-wrap">
                    {summary.section_data.text || summary.section_data}
                  </p>
                </section>
              )}

              {/* 2. Experience */}
              {experience && renderListSection(experience)}

              {/* 3. Skills */}
              {skills && renderSkillsSection(skills)}

              {/* 4. Education */}
              {education && renderListSection(education)}

              {/* 5. Rest of sorted sections */}
              {sortedSections.map((section: any) => {
                const { section_type } = section;
                if (
                  [
                    "summary",
                    "experience",
                    "skills",
                    "education",
                    "personal_info",
                    "declaration",
                    "languages",
                    "hobbies",
                  ].includes(section_type)
                )
                  return null;
                return renderListSection(section);
              })}
            </>
          );
        })()}

        {/* Explicit Languages rendering */}
        {sections.find((s) => s.section_type === "languages") && (
          <section className="break-inside-avoid">
            <div className="flex items-center gap-4 mb-5">
              <h2
                className="text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                style={{ color: themeColor }}
              >
                Languages
              </h2>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
              {(
                sections.find((s) => s.section_type === "languages")!
                  .section_data.items || []
              ).map((item: any, i: number) => (
                <span key={i} className="flex items-center gap-2">
                  {typeof item === "string"
                    ? item
                    : `${item.language}${
                        item.proficiency ? ` (${item.proficiency})` : ""
                      }`}
                  {i <
                    sections.find((s) => s.section_type === "languages")!
                      .section_data.items.length -
                      1 && <span className="text-slate-200">|</span>}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Explicit Interests (Hobbies) rendering */}
        {sections.find((s) => s.section_type === "hobbies") && (
          <section className="break-inside-avoid">
            <div className="flex items-center gap-4 mb-5">
              <h2
                className="text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                style={{ color: themeColor }}
              >
                Interests
              </h2>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
              {(
                sections.find((s) => s.section_type === "hobbies")!.section_data
                  .items || []
              ).map((item: any, i: number) => (
                <span key={i} className="flex items-center gap-2">
                  {typeof item === "string" ? item : item.name || item.hobby}
                  {i <
                    sections.find((s) => s.section_type === "hobbies")!
                      .section_data.items.length -
                      1 && <span className="text-slate-200">|</span>}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Explicit Declaration at Bottom */}
        {sections.find((s: any) => s.section_type === "declaration") &&
          sections.find((s: any) => s.section_type === "declaration")
            .section_data?.text && (
            <section className="break-inside-avoid">
              <div className="flex items-center gap-4 mb-5">
                <h2
                  className="text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                  style={{ color: themeColor }}
                >
                  Declaration
                </h2>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">
                {
                  sections.find((s: any) => s.section_type === "declaration")
                    .section_data.text
                }
              </p>
            </section>
          )}
      </div>
    </div>
  );
};
