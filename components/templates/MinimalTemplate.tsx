import React from "react";

export const MinimalTemplate = ({
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
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
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
                className="mb-8 border-b pb-6"
                style={{ borderColor: hexToRgba(themeColor, 0.1) }}
              >
                <h1
                  className="text-3xl font-bold mb-0.5 tracking-tight"
                  style={{ color: themeColor }}
                >
                  {personalInfo.name || "Your Name"}
                </h1>
                <p className="text-sm text-gray-500 mb-3">
                  {personalInfo.jobTitle}
                </p>
                <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                  {[personalInfo.email, personalInfo.phone, personalInfo.city]
                    .filter(Boolean)
                    .map((t, i) => (
                      <span
                        key={i}
                        className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600"
                      >
                        {t}
                      </span>
                    ))}
                  {personalInfo.linkedin && (
                    <a
                      href={personalInfo.linkedin}
                      className="underline"
                      style={{ color: themeColor }}
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 gap-8">
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
                    <div key={section.id} className="break-inside-avoid">
                      <h3
                        className="font-bold text-xs uppercase tracking-widest mb-4"
                        style={{ color: hexToRgba(themeColor, 0.7) }}
                      >
                        {section_type.replace("_", " ")}
                      </h3>

                      {section_type === "summary" && (
                        <p className="text-sm leading-relaxed text-gray-800 text-justify">
                          {section_data.text || section_data}
                        </p>
                      )}

                      {(section_type === "skills" ||
                        section_type === "languages") && (
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {(Array.isArray(section_data)
                            ? section_data
                            : section_data?.items || []
                          ).map((s: any, idx: number) => {
                            const val =
                              typeof s === "string"
                                ? s
                                : section_type === "languages"
                                ? `${s.language}${
                                    s.proficiency ? ` (${s.proficiency})` : ""
                                  }`
                                : s.name || s.language;
                            return (
                              <span
                                key={idx}
                                className="font-medium text-sm border-b border-gray-100"
                                style={{ color: themeColor }}
                              >
                                {val}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {!["summary", "skills", "languages"].includes(
                        section_type
                      ) && (
                        <div className="space-y-6">
                          {(Array.isArray(section_data)
                            ? section_data
                            : section_data?.items || []
                          ).map((item: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 gap-4">
                              <div className="col-span-3 text-xs text-gray-500 pt-0.5">
                                {item.startDate ? `${item.startDate} – ` : ""}
                                {item.endDate ||
                                  item.date ||
                                  item.graduationDate}
                              </div>
                              <div className="col-span-9">
                                <div
                                  className="font-bold text-sm"
                                  style={{ color: themeColor }}
                                >
                                  {item.position ||
                                    item.title ||
                                    item.school ||
                                    item.institution ||
                                    item.language}
                                </div>
                                <div className="text-gray-600 text-xs mb-1.5">
                                  {item.company ||
                                    item.issuer ||
                                    item.degree ||
                                    item.proficiency}
                                </div>
                                <p className="text-xs leading-relaxed text-gray-700 text-justify">
                                  {item.description}
                                </p>
                              </div>
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
                        className="font-bold text-xs uppercase tracking-widest mb-4"
                        style={{ color: hexToRgba(themeColor, 0.7) }}
                      >
                        Declaration
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-800 text-justify">
                        {
                          sections.find(
                            (s: any) => s.section_type === "declaration"
                          ).section_data.text
                        }
                      </p>
                    </div>
                  )}
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
