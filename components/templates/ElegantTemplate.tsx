import React from "react";

export const ElegantTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
  settings,
}: any) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0),
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      id="resume-preview-content"
      // Added print styles directly
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto px-[15mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#4b5563",
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
              <header className="text-center mb-16">
                {personalInfo.photoUrl && personalInfo.showPhoto !== false && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-24 h-24 mx-auto rounded-full object-cover mb-6 border border-gray-200 shadow-sm"
                  />
                )}
                <h1
                  className="text-4xl font-normal tracking-wide mb-4 text-gray-800"
                  style={{ color: themeColor }}
                >
                  {personalInfo.name || "Your Name"}
                </h1>
                <div className="w-20 h-px mx-auto mb-5 bg-gray-300"></div>
                <p className="text-base font-medium uppercase tracking-[0.2em] text-gray-500 mb-6">
                  {personalInfo.jobTitle}
                </p>

                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 italic">
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
                    .map((v, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {v}
                      </span>
                    ))}
                </div>
              </header>

              <div className="space-y-12 px-4">
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
                      <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] mb-8 text-gray-400">
                        {section_type.replace("_", " ")}
                      </h3>

                      {section_type === "summary" && (
                        <p className="text-[15px] leading-8 text-center max-w-2xl mx-auto text-gray-700 font-light">
                          {section_data.text || section_data}
                        </p>
                      )}

                      {(section_type === "skills" ||
                        section_type === "languages") && (
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 max-w-3xl mx-auto">
                          {(Array.isArray(section_data)
                            ? section_data
                            : section_data?.items || []
                          ).map((s: any, idx: number) => {
                            const val =
                              typeof s === "string"
                                ? s
                                : section_type === "languages"
                                  ? `${s.language || ""}${
                                      s.proficiency ? ` (${s.proficiency})` : ""
                                    }`
                                  : s.name || s.language || "";
                            return (
                              <span
                                key={idx}
                                className="font-medium bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded text-sm tracking-wide"
                              >
                                {val}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {!["summary", "skills", "languages"].includes(
                        section_type,
                      ) && (
                        <div className="space-y-10">
                          {(Array.isArray(section_data)
                            ? section_data
                            : section_data?.items || []
                          ).map((item: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 gap-8">
                              <div className="col-span-3 text-right pt-0.5">
                                <div className="font-bold text-sm text-gray-800 leading-tight">
                                  {item.company || item.issuer || item.degree}
                                </div>
                                <div className="text-xs text-gray-400 mt-1.5 font-medium">
                                  {item.startDate ? `${item.startDate} – ` : ""}
                                  {item.endDate ||
                                    "Present" ||
                                    item.date ||
                                    item.graduationDate}
                                </div>
                                {item.location && (
                                  <div className="text-[11px] text-gray-400 mt-0.5 italic">
                                    {item.location}
                                  </div>
                                )}
                              </div>
                              <div className="col-span-9 border-l border-gray-200 pl-8 relative">
                                <div
                                  className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-200"
                                  style={{ borderColor: themeColor }}
                                ></div>
                                <h4
                                  className="font-bold text-[15px] text-gray-800 mb-2 uppercase tracking-wide leading-none"
                                  style={{ color: themeColor }}
                                >
                                  {item.position ||
                                    item.title ||
                                    item.school ||
                                    item.institution ||
                                    item.language ||
                                    ""}
                                </h4>
                                <p className="text-[13px] leading-relaxed text-gray-600 text-justify whitespace-pre-wrap">
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
                      <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] mb-6 text-gray-400">
                        Declaration
                      </h3>
                      <p className="text-[15px] leading-8 text-center max-w-2xl mx-auto text-gray-700 font-light">
                        {
                          sections.find(
                            (s: any) => s.section_type === "declaration",
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
