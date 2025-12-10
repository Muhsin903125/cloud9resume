import React from "react";

export const ClassicTemplate = ({
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
      className="bg-white text-gray-900 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-serif"
      style={{ width: "210mm", minHeight: "297mm" }}
    >
      <header
        className="text-center border-b-2 pb-4 mb-5"
        style={{ borderColor: themeColor }}
      >
        <h1
          className="text-2xl font-bold mb-1 uppercase tracking-wide"
          style={{ color: themeColor }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="text-sm italic text-gray-700 mb-2">
          {personalInfo.jobTitle}
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-600">
          {[personalInfo.email, personalInfo.phone, personalInfo.city]
            .filter(Boolean)
            .map((t, i) => (
              <span key={i}>
                {t} {i < 2 ? "•" : ""}
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
          <div key={section.id} className="mb-5">
            <h3
              className="font-bold text-base border-b pb-1 mb-3 uppercase"
              style={{
                borderColor: hexToRgba(themeColor, 0.3),
                color: themeColor,
              }}
            >
              {section_type.replace("_", " ")}
            </h3>

            {section_type === "summary" && (
              <p className="leading-relaxed text-sm text-justify">
                {section_data.text || section_data}
              </p>
            )}

            {section_type === "skills" && (
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(section_data)
                  ? section_data
                  : section_data?.items || []
                ).map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="border border-gray-400 px-2 py-0.5 rounded text-xs"
                  >
                    {typeof s === "string" ? s : s.name}
                  </span>
                ))}
              </div>
            )}

            {!["summary", "skills"].includes(section_type) && (
              <div className="space-y-3">
                {(Array.isArray(section_data)
                  ? section_data
                  : section_data?.items || []
                ).map((item: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold text-sm">
                      <span>{item.position || item.title || item.school}</span>
                      <span className="text-xs font-normal">
                        {item.endDate || item.date}
                      </span>
                    </div>
                    <div className="italic text-gray-700 text-xs mb-1">
                      {item.company || item.issuer || item.degree}
                    </div>
                    <p className="text-xs leading-relaxed text-justify">
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
