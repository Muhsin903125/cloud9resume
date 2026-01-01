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

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm]"
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

      <header className="text-center mb-12">
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

      {sortedSections.map((section: any) => {
        if (section.section_type === "personal_info") return null;
        const { section_type, section_data } = section;
        if (
          !section_data ||
          (Array.isArray(section_data) && section_data.length === 0)
        )
          return null;

        return (
          <div key={section.id} className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-800 text-center min-w-[140px]">
                {section_type.replace("_", " ")}
              </h3>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {section_type === "summary" && (
              <p className="text-sm leading-8 text-center text-gray-700 italic max-w-3xl mx-auto px-4">
                "{section_data.text || section_data}"
              </p>
            )}

            {(section_type === "skills" || section_type === "languages") && (
              <div className="flex flex-wrap justify-center gap-3 mt-4 px-8">
                {(Array.isArray(section_data)
                  ? section_data
                  : section_data?.items || []
                ).map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="bg-gray-50 px-4 py-1.5 rounded text-xs font-semibold text-gray-700 border border-gray-200 uppercase tracking-wide"
                  >
                    {typeof s === "string"
                      ? s
                      : section_type === "languages"
                      ? `${s.language}${
                          s.proficiency ? ` (${s.proficiency})` : ""
                        }`
                      : s.name || s.language}
                  </span>
                ))}
              </div>
            )}

            {!["summary", "skills", "languages", "declaration"].includes(
              section_type
            ) && (
              <div className="space-y-8 px-2">
                {(Array.isArray(section_data)
                  ? section_data
                  : section_data?.items || []
                ).map((item: any, idx: number) => (
                  <div key={idx} className="group relative">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-bold text-gray-900 text-base">
                        {item.position || item.title || item.school}
                      </h4>
                      <span className="text-xs font-bold text-gray-500 whitespace-nowrap pt-1">
                        {item.startDate} – {item.endDate || item.date}
                      </span>
                    </div>
                    <div
                      className="text-xs font-bold uppercase tracking-wide mb-3 opacity-90"
                      style={{ color: themeColor }}
                    >
                      {item.company || item.issuer || item.degree}
                      {item.location && (
                        <span className="text-gray-400 font-medium normal-case ml-2">
                          | {item.location}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] leading-relaxed text-gray-700 text-justify whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Explicit Declaration at Bottom */}
      {sections.find((s: any) => s.section_type === "declaration") &&
        sections.find((s: any) => s.section_type === "declaration").section_data
          ?.text && (
          <div className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-800 text-center min-w-[140px]">
                Declaration
              </h3>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <p className="text-sm leading-8 text-center text-gray-700 italic max-w-3xl mx-auto px-4">
              "
              {
                sections.find((s: any) => s.section_type === "declaration")
                  .section_data.text
              }
              "
            </p>
          </div>
        )}
    </div>
  );
};
