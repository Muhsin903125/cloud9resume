import React from "react";

export const BoldTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
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
      // Using Slate 900 as base text color instead of pure black
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] text-slate-900"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "inherit",
      }}
    >
      <header className="mb-14">
        <h1
          className="text-7xl font-black uppercase tracking-tighter leading-none mb-5"
          style={{ color: themeColor }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-wider">
          <span
            className="text-white px-3 py-1 text-xs"
            style={{ backgroundColor: themeColor }}
          >
            {personalInfo.jobTitle}
          </span>
          {[
            personalInfo.email,
            personalInfo.phone,
            [personalInfo.city, personalInfo.country]
              .filter(Boolean)
              .join(", "),
          ]
            .filter(Boolean)
            .map((val, i) => (
              <span key={i} className="text-slate-500 flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">|</span>}
                {val}
              </span>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-14">
        {sortedSections.map((section: any) => {
          if (section.section_type === "personal_info") return null;
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0) ||
            section_type === "declaration"
          )
            return null;

          return (
            <div key={section.id} className="break-inside-avoid">
              <h3
                className="text-5xl font-black uppercase mb-8 tracking-tighter opacity-15"
                style={{ color: themeColor }}
              >
                {section_type.replace("_", " ")}
              </h3>

              {["summary", "declaration"].includes(section_type) && (
                <p className="text-base font-medium leading-8 max-w-3xl text-slate-700 text-justify">
                  {section_data.text || section_data}
                </p>
              )}

              {(section_type === "skills" || section_type === "languages") && (
                <div className="flex flex-wrap gap-3">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-sm font-bold border-2 px-4 py-1.5 uppercase hover:text-white transition-colors cursor-default"
                      style={{
                        borderColor: themeColor,
                        color: themeColor,
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLElement).style.backgroundColor =
                          themeColor;
                        (e.target as HTMLElement).style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLElement).style.backgroundColor =
                          "transparent";
                        (e.target as HTMLElement).style.color = themeColor;
                      }}
                    >
                      {typeof s === "string"
                        ? s
                        : section_type === "languages"
                          ? `${s.language || ""}${
                              s.proficiency ? ` (${s.proficiency})` : ""
                            }`
                          : s.name || s.language || ""}
                    </span>
                  ))}
                </div>
              )}

              {!["summary", "skills", "languages", "declaration"].includes(
                section_type,
              ) && (
                <div
                  className="space-y-10 border-l-4 pl-8"
                  style={{ borderColor: themeColor }}
                >
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="group">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-2 gap-2">
                        <h4 className="text-xl font-bold uppercase text-slate-900 tracking-tight">
                          {item.position || item.title}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 uppercase tracking-wide whitespace-nowrap">
                          {item.startDate} — {item.endDate || "Present"}
                        </span>
                      </div>
                      <div
                        className="text-sm font-bold uppercase mb-4 tracking-wider"
                        style={{ color: themeColor }}
                      >
                        {item.company || item.issuer || item.degree}
                        {item.location && (
                          <span className="text-slate-400 ml-2 font-medium normal-case">
                            • {item.location}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-7 text-slate-600 max-w-2xl text-justify whitespace-pre-wrap">
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
                className="text-5xl font-black uppercase mb-8 tracking-tighter opacity-15"
                style={{ color: themeColor }}
              >
                Declaration
              </h3>
              <p className="text-base font-medium leading-8 max-w-3xl text-slate-700 text-justify">
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
