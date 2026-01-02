import React from "react";

interface AtsTemplateProps {
  resume: any;
  sections: any[];
  themeColor?: string;
  font?: string;
  hexToRgba?: (hex: string, alpha: number) => string;
}

export const AtsTemplate: React.FC<AtsTemplateProps> = ({
  resume,
  sections,
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
      className="bg-white text-black p-[12mm] mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font,
        lineHeight: "1.5",
        color: "#000000",
      }}
    >
      {/* Header / Personal Info */}
      <header className="border-b-2 border-black pb-2 mb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1 text-black">
          {personalInfo.name ||
            personalInfo.fullName ||
            resume.title ||
            "Your Name"}
        </h1>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs text-black">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.address) && (
            <span>
              |{" "}
              {[personalInfo.city || personalInfo.address, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {(personalInfo.website || personalInfo.portfolio) && (
            <span>| {personalInfo.website || personalInfo.portfolio}</span>
          )}
          {personalInfo.linkedin && (
            <span>
              | LinkedIn:{" "}
              {personalInfo.linkedin.replace(
                /^https?:\/\/(www\.)?linkedin\.com\/in\//,
                ""
              )}
            </span>
          )}
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-4">
        {sortedSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (!section_data || section_type === "personal_info") return null;

          // Special sections handled separately
          if (section_type === "declaration") return null;

          return (
            <section key={section.id} className="break-inside-avoid">
              <h2
                className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 text-black"
                style={{ letterSpacing: "0.05em" }}
              >
                {section.title || section_type.replace("_", " ")}
              </h2>

              {/* Summary / Text Sections */}
              {(section_type === "summary" ||
                section_type === "declaration") && (
                <p className="whitespace-pre-wrap text-sm text-black text-justify">
                  {section_data.text || section_data}
                </p>
              )}

              {/* List based sections (Experience, Education, Projects, etc.) */}
              {!["summary", "skills", "languages", "declaration"].includes(
                section_type
              ) && (
                <div className="space-y-3">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline font-bold text-sm text-black">
                        <h3>
                          {item.position ||
                            item.title ||
                            item.degree ||
                            item.school ||
                            item.institution ||
                            item.language}
                        </h3>
                        <span className="text-sm font-normal">
                          {item.startDate ? `${item.startDate} – ` : ""}
                          {item.endDate || item.date || item.graduationDate}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm italic mb-1 text-black">
                        <span>
                          {item.company ||
                            item.issuer ||
                            item.school ||
                            item.institution ||
                            item.degree}
                        </span>
                        <span>{item.location}</span>
                      </div>

                      {item.link && (
                        <div className="text-sm mb-1">
                          <a href={item.link} className="text-black underline">
                            {item.link}
                          </a>
                        </div>
                      )}

                      {item.description && (
                        <p className="text-sm text-black leading-relaxed text-justify whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {item.points && Array.isArray(item.points) && (
                        <ul className="list-disc ml-5 text-sm mt-1 space-y-0.5 text-black">
                          {item.points.map((pt: string, i: number) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills / Languages (Tag/List based) */}
              {(section_type === "skills" || section_type === "languages") && (
                <div className="text-sm text-black">
                  {/* Handle tagged skills or categorized items */}
                  {typeof section_data === "object" &&
                    !Array.isArray(section_data) && (
                      <div className="space-y-1">
                        {Object.keys(section_data).map((category, idx) => {
                          if (category === "items") return null;
                          const skills = section_data[category];
                          if (!Array.isArray(skills)) return null;
                          return (
                            <div key={idx}>
                              <span className="font-bold">{category}: </span>
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

                  {/* Fallback to flat list */}
                  {(Array.isArray(section_data) ||
                    Array.isArray(section_data?.items)) && (
                    <p>
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
                        .join(", ")}
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
              <h2
                className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 text-black"
                style={{ letterSpacing: "0.05em" }}
              >
                Declaration
              </h2>
              <p className="whitespace-pre-wrap text-sm text-black text-justify">
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
