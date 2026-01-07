import React from "react";

export const ExecutiveTemplate = ({
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
        <div className="flex items-center gap-6 mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-800 text-center min-w-[140px]">
            {section.title || section_type.replace("_", " ")}
          </h3>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="space-y-8 px-2">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="group relative">
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="font-bold text-gray-900 text-base">
                  {item.position ||
                    item.title ||
                    item.school ||
                    item.institution}
                </h4>
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap pt-1">
                  {item.startDate ? `${item.startDate} – ` : ""}
                  {item.endDate || item.date || item.graduationDate}
                </span>
              </div>
              <div
                className="text-xs font-bold uppercase tracking-wide mb-3 opacity-90"
                style={{ color: themeColor }}
              >
                {item.company || item.issuer || item.degree || item.school}
                {item.location && (
                  <span className="text-gray-400 font-medium normal-case ml-2">
                    | {item.location}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-[13px] leading-relaxed text-gray-700 text-justify whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
              {item.points && Array.isArray(item.points) && (
                <ul className="list-disc ml-6 text-[13px] mt-2 space-y-1 text-gray-700">
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
        <div className="flex items-center gap-6 mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-800 text-center min-w-[140px]">
            {section_type === "hobbies"
              ? "Interests"
              : section_type.replace("_", " ")}
          </h3>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-4 px-8">
          {(() => {
            const data = section_data;
            if (typeof data === "object" && !Array.isArray(data)) {
              const categories = Object.keys(data).filter((k) => k !== "items");
              if (categories.length > 0) {
                return (
                  <div className="w-full space-y-3">
                    {categories.map((category, idx) => {
                      const skills = data[category];
                      if (!Array.isArray(skills)) return null;
                      return (
                        <div key={idx} className="text-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                            {category}
                          </span>
                          <div className="flex flex-wrap justify-center gap-2">
                            {skills.map((s, i) => (
                              <span
                                key={i}
                                className="bg-gray-50 px-3 py-1 rounded text-[11px] font-semibold text-gray-700 border border-gray-100"
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
            }

            const items = Array.isArray(data) ? data : data?.items || [];
            return items.map((s: any, idx: number) => (
              <span
                key={idx}
                className="bg-gray-50 px-4 py-1.5 rounded text-xs font-semibold text-gray-700 border border-gray-200 uppercase tracking-wide"
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
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[10mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#333",
        fontFamily: font || "inherit",
      }}
    >
      <div
        className="w-full h-3 mb-10"
        style={{ backgroundColor: themeColor }}
      ></div>

      <header className="text-center mb-8">
        {personalInfo.photoUrl && personalInfo.showPhoto !== false && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.name}
            className="w-28 h-28 mx-auto rounded-full object-cover mb-5 border-4 border-gray-100 shadow-md"
          />
        )}
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-3 text-gray-900 leading-tight">
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="text-base uppercase tracking-[0.2em] font-medium text-gray-500 mb-6">
          {personalInfo.jobTitle}
        </p>

        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-gray-600 border-t border-b border-gray-100 py-4 mx-8">
          {[
            personalInfo.email,
            personalInfo.phone,
            [personalInfo.city, personalInfo.country]
              .filter(Boolean)
              .join(", "),
            personalInfo.linkedin,
            personalInfo.portfolio,
          ]
            .filter(Boolean)
            .map((val, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">•</span>}
                {val}
              </span>
            ))}
        </div>
      </header>

      <div className="space-y-8">
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
                <p className="text-sm leading-8 text-center text-gray-700 italic max-w-3xl mx-auto px-4 whitespace-pre-wrap">
                  "{summary.section_data.text || summary.section_data}"
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
          return hobbySection ? renderSkillsSection(hobbySection) : null;
        })()}

        {/* Explicit Declaration at Bottom */}
        {(() => {
          const declSection = sections.find(
            (s: any) => s.section_type === "declaration"
          );
          if (!declSection || !declSection.section_data?.text) return null;
          return (
            <div className="break-inside-avoid">
              <div className="flex items-center gap-6 mb-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-800 text-center min-w-[140px]">
                  Declaration
                </h3>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <p className="text-sm leading-8 text-center text-gray-700 italic max-w-3xl mx-auto px-4 whitespace-pre-wrap">
                "{declSection.section_data.text}"
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
