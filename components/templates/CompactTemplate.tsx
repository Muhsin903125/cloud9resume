import React from "react";

export const CompactTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
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
      // Smaller font size base for compactness
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[10mm] text-[10px]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#111",
        fontFamily: font || "inherit",
      }}
    >
      <header className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
        <div>
          <h1
            className="text-xl font-bold uppercase"
            style={{ color: themeColor }}
          >
            {personalInfo.name || "Your Name"}
          </h1>
          <p className="font-bold text-gray-600 uppercase tracking-tight">
            {personalInfo.jobTitle}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          {[
            personalInfo.email,
            personalInfo.phone,
            [personalInfo.city, personalInfo.country]
              .filter(Boolean)
              .join(", "),
            personalInfo.linkedin,
          ]
            .filter(Boolean)
            .map((val, i) => (
              <div key={i} className="font-medium text-gray-500">
                {val}
              </div>
            ))}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {sortedSections.map((section: any) => {
          if (section.section_type === "personal_info") return null;
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id}>
              <h3
                className="text-[10px] font-bold uppercase mb-2 border-b border-gray-200 pb-0.5"
                style={{ color: themeColor }}
              >
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "summary" && (
                <p className="leading-snug text-justify text-gray-800">
                  {section_data.text || section_data}
                </p>
              )}

              {(section_type === "skills" || section_type === "languages") && (
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="font-medium bg-gray-100 px-1.5 rounded-sm border border-gray-200 text-gray-700"
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

              {!["summary", "skills", "languages"].includes(section_type) && (
                <div className="space-y-2.5">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-bold">
                            {item.position || item.title || item.school}
                          </h4>
                          <span className="text-gray-500 italic">
                            @ {item.company || item.issuer || item.degree}
                          </span>
                        </div>
                        <span className="font-medium text-gray-400 whitespace-nowrap">
                          {item.startDate} – {item.endDate || "Present"}
                        </span>
                      </div>
                      <p className="leading-snug text-gray-600 mt-0.5">
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
          sections.find((s: any) => s.section_type === "declaration")
            .section_data?.text && (
            <div className="break-inside-avoid">
              <h3
                className="text-[10px] font-bold uppercase mb-2 border-b border-gray-200 pb-0.5"
                style={{ color: themeColor }}
              >
                Declaration
              </h3>
              <p className="leading-snug text-justify text-gray-800">
                {
                  sections.find((s: any) => s.section_type === "declaration")
                    .section_data.text
                }
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
