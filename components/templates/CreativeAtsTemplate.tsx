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
      className="bg-white text-gray-800 p-[20mm] mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font,
        lineHeight: "1.5",
      }}
    >
      {/* Header */}
      <header
        className="mb-12 flex justify-between items-end border-b-8 pb-8"
        style={{ borderColor: themeColor }}
      >
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-4">
            {personalInfo.name ||
              personalInfo.fullName ||
              resume.title ||
              "Your Name"}
          </h1>
          <p
            className="text-sm font-bold uppercase tracking-[0.3em]"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle || "Professional Developer"}
          </p>
        </div>
        <div className="text-right text-[11px] font-bold space-y-1 text-gray-400">
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

      {/* Sections */}
      <div className="space-y-12">
        {sortedSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (!section_data || section_type === "personal_info") return null;

          // Skip declaration
          if (section_type === "declaration") return null;

          return (
            <section key={section.id} className="break-inside-avoid">
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-1.5 rounded-full mr-4"
                  style={{ backgroundColor: themeColor }}
                ></div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                  {section.title || section_type.replace("_", " ")}
                </h2>
              </div>

              {/* Summary / Text Sections */}
              {(section_type === "summary" ||
                section_type === "declaration") && (
                <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                  {section_data.text || section_data}
                </p>
              )}

              {/* List based sections */}
              {!["summary", "skills", "languages", "declaration"].includes(
                section_type
              ) && (
                <div className="space-y-8 pl-4 border-l-2 border-gray-100 italic">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="not-italic relative">
                      {/* Artistic bullet */}
                      <div
                        className="absolute -left-[21px] top-1 w-2 h-6 rounded-full"
                        style={{ backgroundColor: themeColor }}
                      ></div>

                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 leading-tight">
                            {item.position ||
                              item.title ||
                              item.degree ||
                              item.school ||
                              item.institution ||
                              item.language}
                          </h3>
                          <div
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: themeColor }}
                          >
                            {item.company ||
                              item.issuer ||
                              item.school ||
                              item.institution ||
                              item.degree}
                          </div>
                        </div>
                        <div className="text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                          {item.startDate ? `${item.startDate} — ` : ""}
                          {item.endDate || item.date || item.graduationDate}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-500 font-medium leading- relaxed whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {item.points && Array.isArray(item.points) && (
                        <ul className="mt-4 space-y-2">
                          {item.points.map((pt: string, i: number) => (
                            <li
                              key={i}
                              className="flex gap-3 text-sm text-gray-600 font-medium leading-relaxed"
                            >
                              <span style={{ color: themeColor }}>⚡</span>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills / Languages */}
              {(section_type === "skills" || section_type === "languages") && (
                <div className="flex flex-wrap gap-3">
                  {typeof section_data === "object" &&
                    !Array.isArray(section_data) && (
                      <div className="w-full flex flex-col gap-4">
                        {Object.keys(section_data).map((category, idx) => {
                          if (category === "items") return null;
                          const skills = section_data[category];
                          if (!Array.isArray(skills)) return null;
                          return (
                            <div key={idx} className="flex flex-col gap-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {category}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {skills.map((s, i) => (
                                  <span
                                    key={i}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-gray-100 hover:border-pink-100 transition-colors"
                                  >
                                    {typeof s === "string"
                                      ? s
                                      : s.name || s.language}
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
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(section_data)
                        ? section_data
                        : section_data.items
                      ).map((item: any, i: number) => (
                        <span
                          key={i}
                          className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-50 border-2 border-transparent"
                          style={{
                            color: themeColor,
                            backgroundColor: hexToRgba
                              ? hexToRgba(themeColor, 0.05)
                              : "#fef2f2",
                          }}
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

        {/* Explicit Declaration at Bottom */}
        {sections.find((s: any) => s.section_type === "declaration") &&
          sections.find((s: any) => s.section_type === "declaration")
            .section_data?.text && (
            <section className="break-inside-avoid">
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-1.5 rounded-full mr-4"
                  style={{ backgroundColor: themeColor }}
                ></div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                  Declaration
                </h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
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
