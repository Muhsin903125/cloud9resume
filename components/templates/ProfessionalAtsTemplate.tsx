import React from "react";

interface ProfessionalAtsTemplateProps {
  resume: any;
  sections: any[];
  themeColor?: string;
  font?: string;
  hexToRgba?: (hex: string, alpha: number) => string;
}

export const ProfessionalAtsTemplate: React.FC<
  ProfessionalAtsTemplateProps
> = ({ resume, sections, font = "'Merriweather', serif" }) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      className="bg-white text-black p-[20mm] mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font,
        lineHeight: "1.4",
      }}
    >
      {/* Header */}
      <header className="border-b-[3px] border-black pb-6 mb-8 text-center italic">
        <h1 className="text-4xl font-bold not-italic uppercase tracking-widest mb-3">
          {personalInfo.name ||
            personalInfo.fullName ||
            resume.title ||
            "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs font-semibold">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.address) && (
            <span>
              •{" "}
              {[personalInfo.city || personalInfo.address, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              •{" "}
              {personalInfo.linkedin.replace(
                /^https?:\/\/(www\.)?linkedin\.com\/in\//,
                ""
              )}
            </span>
          )}
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-8">
        {sortedSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (!section_data || section_type === "personal_info") return null;

          // Skip declaration
          if (section_type === "declaration") return null;

          return (
            <section key={section.id} className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] border-b border-black/80 mb-4 pb-1">
                {section.title || section_type.replace("_", " ")}
              </h2>

              {/* Summary / Text Sections */}
              {(section_type === "summary" ||
                section_type === "declaration") && (
                <p className="text-[13px] leading-relaxed text-justify whitespace-pre-wrap">
                  {section_data.text || section_data}
                </p>
              )}

              {/* List based sections */}
              {!["summary", "skills", "languages", "declaration"].includes(
                section_type
              ) && (
                <div className="space-y-6">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-base font-bold italic">
                          {item.position ||
                            item.title ||
                            item.degree ||
                            item.school ||
                            item.institution ||
                            item.language}
                        </h3>
                        <span className="text-[11px] font-bold uppercase">
                          {item.startDate ? `${item.startDate} — ` : ""}
                          {item.endDate || item.date || item.graduationDate}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[13px] font-semibold uppercase tracking-tight mb-2">
                        <span>
                          {item.company ||
                            item.issuer ||
                            item.school ||
                            item.institution ||
                            item.degree}
                        </span>
                        <span>{item.location}</span>
                      </div>

                      {item.description && (
                        <p className="text-[13px] leading-relaxed text-justify whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {item.points && Array.isArray(item.points) && (
                        <ul className="list-disc ml-8 text-[13px] mt-2 space-y-1">
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
                <div className="text-[13px]">
                  {typeof section_data === "object" &&
                    !Array.isArray(section_data) && (
                      <div className="space-y-1">
                        {Object.keys(section_data).map((category, idx) => {
                          if (category === "items") return null;
                          const skills = section_data[category];
                          if (!Array.isArray(skills)) return null;
                          return (
                            <div key={idx}>
                              <span className="font-bold underline uppercase text-[11px] tracking-wider">
                                {category}:{" "}
                              </span>
                              <span>
                                {skills
                                  .map((s) =>
                                    typeof s === "string"
                                      ? s
                                      : s.name || s.language
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {(Array.isArray(section_data) ||
                    Array.isArray(section_data?.items)) && (
                    <p className="leading-relaxed">
                      {(Array.isArray(section_data)
                        ? section_data
                        : section_data.items
                      )
                        .map((item: any) => {
                          if (typeof item === "string") return item;
                          if (section_type === "languages") {
                            return `${item.language}${
                              item.proficiency ? ` (${item.proficiency})` : ""
                            }`;
                          }
                          return item.name || item.skill || item.language;
                        })
                        .join(" • ")}
                    </p>
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
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] border-b border-black/80 mb-4 pb-1">
                Declaration
              </h2>
              <p className="text-[13px] leading-relaxed text-justify whitespace-pre-wrap">
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
