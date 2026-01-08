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
      className="bg-white text-black p-[10mm] mx-auto"
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

      <div className="space-y-8">
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
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] border-b border-black/80 mb-4 pb-1">
                  {section.title || section_type.replace("_", " ")}
                </h2>

                <div className="space-y-6">
                  {items.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-base font-bold italic">
                          {item.position ||
                            item.title ||
                            item.degree ||
                            item.school ||
                            item.institution ||
                            item.name ||
                            item.role ||
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
                            item.degree ||
                            item.organization ||
                            item.publisher ||
                            item.awarder}
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
              </section>
            );
          };

          const renderSkillsSection = (section: any) => {
            if (!section || !section.section_data) return null;
            return (
              <section key={section.id} className="break-inside-avoid">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] border-b border-black/80 mb-4 pb-1">
                  Skills
                </h2>
                <div className="text-[13px]">
                  {(() => {
                    const data = section.section_data;
                    const categories =
                      typeof data === "object" && !Array.isArray(data)
                        ? Object.keys(data).filter((k) => k !== "items")
                        : [];

                    if (categories.length > 0) {
                      return (
                        <div className="space-y-1">
                          {categories.map((category, idx) => {
                            const skills = data[category];
                            if (!Array.isArray(skills)) return null;
                            return (
                              <div key={idx}>
                                <span className="font-bold underline uppercase text-[11px] tracking-wider">
                                  {category}:{" "}
                                </span>
                                <span>
                                  {skills
                                    .map((s) =>
                                      typeof s === "string" ? s : s.name
                                    )
                                    .join(", ")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    const items = Array.isArray(data) ? data : data.items || [];
                    return (
                      <p className="leading-relaxed">
                        {items
                          .map((item: any) =>
                            typeof item === "string" ? item : item.name
                          )
                          .join(", ")}
                      </p>
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
                  <p className="text-[13px] leading-relaxed text-justify whitespace-pre-wrap">
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
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] border-b border-black/80 mb-4 pb-1">
              Languages
            </h2>
            <div className="text-[13px]">
              <p className="leading-relaxed">
                {(
                  sections.find((s) => s.section_type === "languages")!
                    .section_data.items || []
                )
                  .map((item: any) => {
                    if (typeof item === "string") return item;
                    return `${item.language}${
                      item.proficiency ? ` (${item.proficiency})` : ""
                    }`;
                  })
                  .join(" • ")}
              </p>
            </div>
          </section>
        )}

        {/* Explicit Interests (Hobbies) rendering */}
        {sections.find((s) => s.section_type === "hobbies") && (
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] border-b border-black/80 mb-4 pb-1">
              Interests
            </h2>
            <div className="text-[13px]">
              <p className="leading-relaxed">
                {(
                  sections.find((s) => s.section_type === "hobbies")!
                    .section_data.items || []
                )
                  .map((item: any) =>
                    typeof item === "string" ? item : item.name || item.hobby
                  )
                  .join(" • ")}
              </p>
            </div>
          </section>
        )}

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
