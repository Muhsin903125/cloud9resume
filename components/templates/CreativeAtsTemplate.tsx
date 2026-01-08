import React from "react";

interface CreativeAtsTemplateProps {
  resume: any;
  sections: any[];
  themeColor?: string;
  font?: string;
  hexToRgba?: (hex: string, alpha: number) => string;
}

export const CreativeAtsTemplate: React.FC<CreativeAtsTemplateProps> = ({
  resume,
  sections,
  themeColor = "#ec4899", // Default to pinkish for creative
  font = "'Poppins', sans-serif",
  hexToRgba,
}) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      className="bg-white text-gray-800 p-[10mm] mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font,
        lineHeight: "1.4",
      }}
    >
      {/* Header */}
      <header
        className="mb-8 flex justify-between items-end border-b-4 pb-4"
        style={{ borderColor: themeColor }}
      >
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-1">
            {personalInfo.name ||
              personalInfo.fullName ||
              resume.title ||
              "Your Name"}
          </h1>
          <p
            className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle || "Professional Developer"}
          </p>
        </div>
        <div className="text-right text-[10px] font-bold space-y-0.5 text-gray-400">
          {personalInfo.email && (
            <div className="uppercase">{personalInfo.email}</div>
          )}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {(personalInfo.city || personalInfo.address) && (
            <div className="uppercase">
              {[personalInfo.city || personalInfo.address, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          {personalInfo.website && (
            <div className="text-blue-500">{personalInfo.website}</div>
          )}
        </div>
      </header>

      <div className="space-y-6">
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
                <div className="flex items-center mb-3">
                  {/* <div
                    className="w-8 h-1 rounded-full mr-3"
                    style={{ backgroundColor: themeColor }}
                  ></div> */}
                  <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                    {section.title || section_type.replace("_", " ")}
                  </h2>
                </div>

                <div className="space-y-4 pl-4 border-l border-gray-100">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="not-italic relative">
                      {/* Artistic bullet */}
                      <div
                        className="absolute -left-[20.5px] top-1 w-1 h-4 rounded-full"
                        style={{ backgroundColor: themeColor }}
                      ></div>

                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-md font-bold text-gray-900 leading-tight">
                            {item.position ||
                              item.title ||
                              item.degree ||
                              item.school ||
                              item.institution ||
                              item.name ||
                              item.role ||
                              item.language}
                          </h3>
                          <div
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: themeColor }}
                          >
                            {item.company ||
                              item.issuer ||
                              item.school ||
                              item.institution ||
                              item.degree ||
                              item.organization ||
                              item.publisher ||
                              item.awarder}
                          </div>
                        </div>
                        <div className="text-[9px] font-black bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                          {item.startDate ? `${item.startDate} — ` : ""}
                          {item.endDate || item.date || item.graduationDate}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-xs text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {item.points && Array.isArray(item.points) && (
                        <ul className="mt-2 space-y-1">
                          {item.points.map((pt: string, i: number) => (
                            <li
                              key={i}
                              className="flex gap-2 text-xs text-gray-600 font-medium leading-relaxed"
                            >
                              <span
                                style={{ color: themeColor }}
                                className="text-[10px]"
                              >
                                ⚡
                              </span>
                              {pt}
                            </li>
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
                <div className="flex items-center mb-3">
                  {/* <div
                    className="w-8 h-1 rounded-full mr-3"
                    style={{ backgroundColor: themeColor }}
                  ></div> */}
                  <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                    Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const data = section.section_data;
                    const categories =
                      typeof data === "object" && !Array.isArray(data)
                        ? Object.keys(data).filter((k) => k !== "items")
                        : [];

                    if (categories.length > 0) {
                      return (
                        <div className="w-full flex flex-col gap-3 pl-1">
                          {categories.map((category, idx) => {
                            const skills = data[category];
                            if (!Array.isArray(skills)) return null;
                            return (
                              <div key={idx} className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                  {category}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {skills.map((s, i) => (
                                    <span
                                      key={i}
                                      className="text-[11px] font-bold px-2 py-1 rounded-md border-2 border-gray-50 hover:border-pink-50 transition-colors"
                                    >
                                      {typeof s === "string" ? s : s.name}
                                    </span>
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
                      <div className="flex flex-wrap gap-1.5 pl-0">
                        {items.map((item: any, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-50 border border-transparent"
                            style={{
                              color: themeColor,
                              backgroundColor: hexToRgba
                                ? hexToRgba(themeColor, 0.05)
                                : "#fef2f2",
                            }}
                          >
                            {typeof item === "string" ? item : item.name}
                          </span>
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
                  <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
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
                    "personal_info",
                    "summary",
                    "experience",
                    "skills",
                    "education",
                    "languages",
                    "hobbies",
                    "declaration",
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
            <div className="flex items-center mb-3">
              {/* <div
                className="w-8 h-1 rounded-full mr-3"
                style={{ backgroundColor: themeColor }}
              ></div> */}
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                Languages
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5 ">
              {(
                sections.find((s) => s.section_type === "languages")!
                  .section_data.items || []
              ).map((item: any, i: number) => (
                <span
                  key={i}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-50 border border-transparent"
                  style={{
                    color: themeColor,
                    backgroundColor: hexToRgba
                      ? hexToRgba(themeColor, 0.05)
                      : "#fef2f2",
                  }}
                >
                  {typeof item === "string"
                    ? item
                    : `${item.language}${
                        item.proficiency ? ` (${item.proficiency})` : ""
                      }`}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Explicit Interests (Hobbies) rendering */}
        {sections.find((s) => s.section_type === "hobbies") && (
          <section className="break-inside-avoid">
            <div className="flex items-center mb-3">
              {/* <div
                className="w-8 h-1 rounded-full mr-3"
                style={{ backgroundColor: themeColor }}
              ></div> */}
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                Interests
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5  ">
              {(
                sections.find((s) => s.section_type === "hobbies")!.section_data
                  .items || []
              ).map((item: any, i: number) => (
                <span
                  key={i}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-50 border border-transparent"
                  style={{
                    color: themeColor,
                    backgroundColor: hexToRgba
                      ? hexToRgba(themeColor, 0.05)
                      : "#fef2f2",
                  }}
                >
                  {typeof item === "string" ? item : item.name || item.hobby}
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
              <div className="flex items-center mb-3">
                {/* <div
                  className="w-8 h-1 rounded-full mr-3"
                  style={{ backgroundColor: themeColor }}
                ></div> */}
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                  Declaration
                </h2>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed font-medium ">
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
