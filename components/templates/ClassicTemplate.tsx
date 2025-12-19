import React from "react";

export const ClassicTemplate = ({
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
      className="bg-white text-gray-900 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto px-[15mm]"
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
                className="text-center border-b-2 pb-4 mb-5"
                style={{ borderColor: themeColor }}
              >
                {personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border border-gray-200"
                  />
                )}
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

                // Skip declaration; render manually at bottom
                if (section_type === "declaration") return null;

                return (
                  <div key={section.id} className="mb-5 break-inside-avoid">
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

                    {(section_type === "skills" ||
                      section_type === "languages") && (
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(section_data)
                          ? section_data
                          : section_data?.items || []
                        ).map((s: any, idx: number) => (
                          <span
                            key={idx}
                            className="border border-gray-400 px-2 py-0.5 rounded text-xs"
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

                    {!["summary", "skills", "languages"].includes(
                      section_type
                    ) && (
                      <div className="space-y-3">
                        {(Array.isArray(section_data)
                          ? section_data
                          : section_data?.items || []
                        ).map((item: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between font-bold text-sm">
                              <span>
                                {item.position ||
                                  item.title ||
                                  item.school ||
                                  item.institution}
                              </span>
                              <span className="text-xs font-normal">
                                {item.endDate ||
                                  item.date ||
                                  item.graduationDate}
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

              {/* Explicit Declaration at Bottom */}
              {sections.find((s: any) => s.section_type === "declaration") &&
                sections.find((s: any) => s.section_type === "declaration")
                  .section_data?.text && (
                  <div className="mb-5 break-inside-avoid">
                    <h3
                      className="font-bold text-base border-b pb-1 mb-3 uppercase"
                      style={{
                        borderColor: hexToRgba(themeColor, 0.3),
                        color: themeColor,
                      }}
                    >
                      Declaration
                    </h3>
                    <p className="leading-relaxed text-sm text-justify">
                      {
                        sections.find(
                          (s: any) => s.section_type === "declaration"
                        ).section_data.text
                      }
                    </p>
                  </div>
                )}
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
