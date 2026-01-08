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
      className="bg-white text-black p-[10mm] mx-auto"
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
        {/* Helper for List-based sections */}
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
                <h2
                  className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 text-black"
                  style={{ letterSpacing: "0.05em" }}
                >
                  {section.title || section_type.replace("_", " ")}
                </h2>
                <div className="space-y-3">
                  {items.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline font-bold text-sm text-black">
                        <h3>
                          {item.position ||
                            item.title ||
                            item.degree ||
                            item.school ||
                            item.institution ||
                            item.name ||
                            item.role ||
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
                            item.degree ||
                            item.organization ||
                            item.publisher ||
                            item.awarder}
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
              </section>
            );
          };

          const renderSkillsSection = (section: any) => {
            if (!section || !section.section_data) return null;
            return (
              <section key={section.id} className="break-inside-avoid">
                <h2
                  className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 text-black"
                  style={{ letterSpacing: "0.05em" }}
                >
                  {section.title || "Skills"}
                </h2>
                <div className="text-sm text-black">
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
                                <span className="font-bold">{category}: </span>
                                <span>
                                  {skills
                                    .map((skill: any) =>
                                      typeof skill === "string"
                                        ? skill
                                        : skill.name
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
                      <p>
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
                  <p className="whitespace-pre-wrap text-sm text-black text-justify">
                    {summary.section_data.text || summary.section_data}
                  </p>
                </section>
              )}

              {/* 2. Experience */}
              {experience && renderListSection(experience)}

              {/* 3. Skills (Force after Experience) */}
              {skills && renderSkillsSection(skills)}

              {/* 4. Education (Force after Skills) */}
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
            <h2
              className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 text-black"
              style={{ letterSpacing: "0.05em" }}
            >
              Languages
            </h2>
            <div className="text-sm text-black">
              <p>
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
                  .join(", ")}
              </p>
            </div>
          </section>
        )}

        {/* Explicit Interests (Hobbies) rendering */}
        {sections.find((s) => s.section_type === "hobbies") && (
          <section className="break-inside-avoid">
            <h2
              className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 text-black"
              style={{ letterSpacing: "0.05em" }}
            >
              Interests
            </h2>
            <div className="text-sm text-black">
              <p>
                {(
                  sections.find((s) => s.section_type === "hobbies")!
                    .section_data.items || []
                )
                  .map((item: any) =>
                    typeof item === "string" ? item : item.name || item.hobby
                  )
                  .join(", ")}
              </p>
            </div>
          </section>
        )}

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
