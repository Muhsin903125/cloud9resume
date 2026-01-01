import React from "react";

export const ProfessionalTemplate = ({
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
      // Added print styles directly to ensure they apply
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#1f2937",
        fontFamily: font || "inherit",
      }}
    >
      {/* Header */}
      <header
        className="border-b-4 pb-8 mb-10"
        style={{ borderColor: themeColor }}
      >
        <div className="flex justify-between items-start gap-8">
          <div className="flex gap-6 items-center flex-1">
            {personalInfo.photoUrl && personalInfo.showPhoto !== false && (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.name}
                className="w-28 h-28 rounded-xl object-cover shadow-sm border border-gray-100"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1
                className="text-4xl font-extrabold uppercase tracking-tight mb-2 break-words"
                style={{ color: themeColor }}
              >
                {personalInfo.name || "Your Name"}
              </h1>
              <p className="text-xl font-medium text-gray-500 uppercase tracking-wide">
                {personalInfo.jobTitle}
              </p>
            </div>
          </div>
          <div className="text-right text-xs space-y-1.5 text-gray-600 shrink-0">
            <div className="font-medium">{personalInfo.email}</div>
            <div className="font-medium">{personalInfo.phone}</div>
            <div>
              {[personalInfo.city, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </div>
            {personalInfo.linkedin && (
              <a
                href={personalInfo.linkedin}
                className="block text-blue-600 hover:underline font-medium"
              >
                LinkedIn
              </a>
            )}
            {personalInfo.portfolio && (
              <a
                href={personalInfo.portfolio}
                className="block text-blue-600 hover:underline font-medium"
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-8">
        {sortedSections.map((section: any) => {
          if (section.section_type === "personal_info") return null;
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id} className="break-inside-avoid">
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-5">
                <h3
                  className="text-sm font-bold uppercase tracking-widest min-w-fit px-3 py-1 rounded"
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
                <p className="text-sm leading-7 text-justify text-gray-700 font-medium">
                  {section_data.text || section_data}
                </p>
              )}

              {(section_type === "skills" || section_type === "languages") && (
                <div className="grid grid-cols-3 gap-y-3 gap-x-8 text-sm">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                      <span className="text-gray-700 font-medium">
                        {typeof s === "string"
                          ? s
                          : section_type === "languages"
                          ? `${s.language}${
                              s.proficiency ? ` (${s.proficiency})` : ""
                            }`
                          : s.name || s.language}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!["summary", "skills", "languages"].includes(section_type) && (
                <div className="space-y-6">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-baseline mb-1 gap-4">
                        <h4 className="font-bold text-gray-900 text-[15px]">
                          {item.position || item.title || item.school}
                        </h4>
                        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                          {item.startDate} – {item.endDate || item.date}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold italic text-gray-600">
                          {item.company || item.issuer || item.degree}
                        </span>
                        {item.location && (
                          <span className="text-xs text-gray-400">
                            {item.location}
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
          sections.find((s: any) => s.section_type === "declaration")
            .section_data?.text && (
            <div className="break-inside-avoid">
              <div className="flex items-center gap-4 mb-5">
                <h3
                  className="text-sm font-bold uppercase tracking-widest min-w-fit px-3 py-1 rounded"
                  style={{
                    backgroundColor: hexToRgba(themeColor, 0.1),
                    color: themeColor,
                  }}
                >
                  Declaration
                </h3>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <p className="text-sm leading-relaxed text-justify text-gray-700 font-medium">
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
