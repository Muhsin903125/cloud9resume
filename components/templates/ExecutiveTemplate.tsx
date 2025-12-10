import React from "react";

export const ExecutiveTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
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
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-serif"
      style={{ width: "210mm", minHeight: "297mm", color: "#333" }}
    >
      <div
        className="w-full h-2 mb-8"
        style={{ backgroundColor: themeColor }}
      ></div>

      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2 text-gray-900">
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500 mb-4">
          {personalInfo.jobTitle}
        </p>

        <div className="flex justify-center items-center gap-4 text-xs text-gray-600 border-t border-b border-gray-100 py-3 mx-10">
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.city,
            personalInfo.linkedin,
          ]
            .filter(Boolean)
            .map((val, i) => (
              <span
                key={i}
                className={i > 0 ? "border-l border-gray-300 pl-4" : ""}
              >
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
          <div key={section.id} className="mb-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-gray-300"></div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-800 text-center min-w-[120px]">
                {section_type.replace("_", " ")}
              </h3>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {section_type === "summary" && (
              <p className="text-sm leading-7 text-center text-gray-700 italic max-w-2xl mx-auto">
                "{section_data.text || section_data}"
              </p>
            )}

            {section_type === "skills" && (
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                {(Array.isArray(section_data)
                  ? section_data
                  : section_data?.items || []
                ).map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold uppercase tracking-wider text-gray-600 border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    {typeof s === "string" ? s : s.name}
                  </span>
                ))}
              </div>
            )}

            {!["summary", "skills"].includes(section_type) && (
              <div className="space-y-6">
                {(Array.isArray(section_data)
                  ? section_data
                  : section_data?.items || []
                ).map((item: any, idx: number) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {item.position || item.title || item.school}
                      </h4>
                      <span className="text-xs font-medium text-gray-500">
                        {item.startDate} – {item.endDate || item.date}
                      </span>
                    </div>
                    <div
                      className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80"
                      style={{ color: themeColor }}
                    >
                      {item.company || item.issuer || item.degree}
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 text-justify">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
