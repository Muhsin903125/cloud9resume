import React from "react";

export const ClassicTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
  settings,
}: any) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  const renderListSection = (section: any) => {
    if (!section || !section.section_data) return null;
    const { section_type, section_data } = section;
    const items = Array.isArray(section_data)
      ? section_data
      : section_data?.items || [];
    if (items.length === 0) return null;

    return (
      <div key={section.id} className="break-inside-avoid">
        <h3
          className="font-bold text-lg border-b pb-1.5 mb-4 uppercase"
          style={{
            borderColor: hexToRgba ? hexToRgba(themeColor, 0.3) : "#e5e7eb",
            color: themeColor,
          }}
        >
          {section.title || section_type.replace("_", " ")}
        </h3>

        <div className="space-y-4">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between font-bold text-[15px] mb-0.5">
                <span className="text-gray-900">
                  {item.position ||
                    item.title ||
                    item.school ||
                    item.institution}
                </span>
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap ml-4">
                  {item.startDate ? `${item.startDate} — ` : ""}
                  {item.endDate || item.date || item.graduationDate}
                </span>
              </div>
              <div className="italic text-gray-700 text-sm mb-2 font-medium">
                {item.company || item.issuer || item.degree || item.school}
                {item.location && ` | ${item.location}`}
              </div>
              {item.description && (
                <p className="text-sm leading-relaxed text-justify text-gray-700 whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
              {item.points && Array.isArray(item.points) && (
                <ul className="list-disc ml-5 text-sm mt-1 space-y-0.5 text-gray-700">
                  {item.points.map((pt: string, i: number) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillsSection = (section: any) => {
    if (!section || !section.section_data) return null;
    const { section_type, section_data } = section;

    return (
      <div key={section.id} className="break-inside-avoid">
        <h3
          className="font-bold text-lg border-b pb-1.5 mb-4 uppercase"
          style={{
            borderColor: hexToRgba ? hexToRgba(themeColor, 0.3) : "#e5e7eb",
            color: themeColor,
          }}
        >
          {section_type === "hobbies"
            ? "Interests"
            : section_type.replace("_", " ")}
        </h3>

        <div className="flex flex-wrap gap-2">
          {(() => {
            const data = section_data;
            if (typeof data === "object" && !Array.isArray(data)) {
              const categories = Object.keys(data).filter((k) => k !== "items");
              if (categories.length > 0) {
                return (
                  <div className="w-full space-y-1">
                    {categories.map((category, idx) => {
                      const skills = data[category];
                      if (!Array.isArray(skills)) return null;
                      return (
                        <div key={idx} className="text-sm">
                          <span className="font-bold">{category}: </span>
                          <span>
                            {skills
                              .map((s) =>
                                typeof s === "string" ? s : s.name || s.language
                              )
                              .join(", ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            }

            const items = Array.isArray(data) ? data : data?.items || [];
            return items.map((s: any, idx: number) => (
              <span
                key={idx}
                className="border border-gray-300 px-2.5 py-1 rounded text-sm bg-gray-50 text-gray-700"
              >
                {typeof s === "string"
                  ? s
                  : section_type === "languages"
                  ? `${s.language}${s.proficiency ? ` (${s.proficiency})` : ""}`
                  : s.name || s.skill || s.language}
              </span>
            ));
          })()}
        </div>
      </div>
    );
  };

  return (
    <div
      id="resume-preview-content"
      className="bg-white text-gray-900 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto px-[10mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "inherit",
      }}
    >
      <table className="w-full">
        <thead className="h-[12mm] print:h-[12mm] opacity-0">
          <tr>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="align-top">
              <header
                className="text-center border-b-2 pb-3 mb-4"
                style={{ borderColor: themeColor }}
              >
                {personalInfo.photoUrl && personalInfo.showPhoto !== false && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-20 h-20 mx-auto rounded-full object-cover mb-3 border border-gray-200"
                  />
                )}
                <h1
                  className="text-2xl font-bold mb-1 uppercase tracking-wide"
                  style={{ color: themeColor }}
                >
                  {personalInfo.name || "Your Name"}
                </h1>
                <p className="text-sm italic text-gray-700 mb-2 font-medium">
                  {personalInfo.jobTitle}
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-[11px] text-gray-600">
                  {[
                    personalInfo.email,
                    personalInfo.phone,
                    [personalInfo.city, personalInfo.country]
                      .filter(Boolean)
                      .join(", "),
                    personalInfo.linkedin,
                  ]
                    .filter(Boolean)
                    .map((t, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <span>•</span>}
                        {t}
                      </span>
                    ))}
                </div>
              </header>

              <div className="space-y-6">
                {(() => {
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
                        <p className="leading-relaxed text-sm text-justify text-gray-800 whitespace-pre-wrap">
                          {summary.section_data.text || summary.section_data}
                        </p>
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
                {(() => {
                  const langSection = sections.find(
                    (s: any) => s.section_type === "languages"
                  );
                  return langSection ? renderSkillsSection(langSection) : null;
                })()}

                {/* Explicit Interests (Hobbies) rendering */}
                {(() => {
                  const hobbySection = sections.find(
                    (s: any) => s.section_type === "hobbies"
                  );
                  return hobbySection
                    ? renderSkillsSection(hobbySection)
                    : null;
                })()}

                {/* Explicit Declaration at Bottom */}
                {(() => {
                  const declSection = sections.find(
                    (s: any) => s.section_type === "declaration"
                  );
                  if (!declSection || !declSection.section_data?.text)
                    return null;
                  return (
                    <div className="break-inside-avoid">
                      <h3
                        className="font-bold text-lg border-b pb-1.5 mb-4 uppercase"
                        style={{
                          borderColor: hexToRgba
                            ? hexToRgba(themeColor, 0.3)
                            : "#e5e7eb",
                          color: themeColor,
                        }}
                      >
                        Declaration
                      </h3>
                      <p className="leading-relaxed text-sm text-justify text-gray-800">
                        {declSection.section_data.text}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="h-[12mm] print:h-[12mm] opacity-0">
          <tr>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
