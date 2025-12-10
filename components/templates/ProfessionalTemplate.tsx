import React from "react";

export const ProfessionalTemplate = ({
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
      // Added print styles directly to ensure they apply
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-serif"
      style={{ width: "210mm", minHeight: "297mm", color: "#1f2937" }}
    >
      {/* Header */}
      <header
        className="border-b-4 pb-6 mb-8"
        style={{ borderColor: themeColor }}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-6 items-center">
            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.name}
                className="w-24 h-24 rounded-lg object-cover shadow-sm border border-gray-200"
              />
            )}
            <div>
              <h1
                className="text-4xl font-bold uppercase tracking-tight mb-2"
                style={{ color: themeColor }}
              >
                {personalInfo.name || "Your Name"}
              </h1>
              <p className="text-lg font-medium text-gray-600">
                {personalInfo.jobTitle}
              </p>
            </div>
          </div>
          <div className="text-right text-xs space-y-1 text-gray-600">
            <div>{personalInfo.email}</div>
            <div>{personalInfo.phone}</div>
            <div>
              {[personalInfo.city, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </div>
            {personalInfo.linkedin && (
              <a
                href={personalInfo.linkedin}
                className="block text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-6">
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
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-4">
                <h3
                  className="text-base font-bold uppercase tracking-wider min-w-fit px-2"
                  style={{
                    backgroundColor: hexToRgba(themeColor, 0.1),
                    color: themeColor,
                  }}
                >
                  {section_type.replace("_", " ")}
                </h3>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {section_type === "summary" && (
                <p className="text-sm leading-relaxed text-justify text-gray-700">
                  {section_data.text || section_data}
                </p>
              )}

              {section_type === "skills" && (
                <div className="grid grid-cols-3 gap-y-2 gap-x-8 text-sm">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                      <span className="text-gray-700">
                        {typeof s === "string" ? s : s.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!["summary", "skills"].includes(section_type) && (
                <div className="space-y-5">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {item.position || item.title || item.school}
                        </h4>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                          {item.startDate} – {item.endDate || item.date}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium italic text-gray-600">
                          {item.company || item.issuer || item.degree}
                        </span>
                        {item.location && (
                          <span className="text-[10px] text-gray-400">
                            {item.location}
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed text-gray-700 text-justify">
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
    </div>
  );
};
