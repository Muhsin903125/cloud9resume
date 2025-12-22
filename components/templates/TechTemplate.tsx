import React from "react";

export const TechTemplate = ({
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
      className="bg-slate-50 text-gray-900 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "'Courier New', Courier, monospace",
      }}
    >
      <header className="mb-8 border-b-2 border-dashed border-gray-400 pb-6">
        <h1
          className="text-3xl font-bold mb-2 tracking-tighter"
          style={{ color: themeColor }}
        >
          &gt; {personalInfo.name || "user_name"}
        </h1>
        <p className="text-sm font-bold text-gray-600 mb-4 bg-gray-200 inline-block px-2 py-1 rounded">
          // {personalInfo.jobTitle || "developer"}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          {personalInfo.email && (
            <div>
              [email]:{" "}
              <a
                href={`mailto:${personalInfo.email}`}
                className="hover:underline text-blue-600"
              >
                {personalInfo.email}
              </a>
            </div>
          )}
          {personalInfo.phone && <div>[phone]: {personalInfo.phone}</div>}
          {personalInfo.linkedin && (
            <div>
              [linkedIn]:{" "}
              <a
                href={personalInfo.linkedin}
                className="hover:underline text-blue-600"
              >
                {personalInfo.linkedin}
              </a>
            </div>
          )}
          {personalInfo.portfolio && (
            <div>
              [web]:{" "}
              <a
                href={personalInfo.portfolio}
                className="hover:underline text-blue-600"
              >
                {personalInfo.portfolio}
              </a>
            </div>
          )}
        </div>
      </header>

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
            <div key={section.id}>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
                <span style={{ color: themeColor }}>const</span> {section_type}{" "}
                =<span className="text-gray-400">{"{"}</span>
              </h3>

              <div className="pl-4 border-l-2 border-gray-200 ml-1.5">
                {section_type === "summary" && (
                  <p className="text-xs leading-relaxed text-gray-700">
                    "{section_data.text || section_data}"
                  </p>
                )}

                {(section_type === "skills" ||
                  section_type === "languages") && (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-white border border-gray-300 px-2 py-1 rounded shadow-sm"
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
                  <div className="space-y-6">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm">
                            {item.position || item.title} @{" "}
                            {item.company || item.issuer}
                          </h4>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.startDate} &rarr; {item.endDate || "PRESENT"}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-gray-400 mt-2 font-bold">{"}"}</div>
            </div>
          );
        })}

        {/* Explicit Declaration at Bottom */}
        {sections.find((s: any) => s.section_type === "declaration") &&
          sections.find((s: any) => s.section_type === "declaration")
            .section_data?.text && (
            <div className="break-inside-avoid">
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
                <span style={{ color: themeColor }}>const</span> declaration =
                <span className="text-gray-400">{"{"}</span>
              </h3>
              <div className="pl-4 border-l-2 border-gray-200 ml-1.5">
                <p className="text-xs leading-relaxed text-gray-700">
                  "
                  {
                    sections.find((s: any) => s.section_type === "declaration")
                      .section_data.text
                  }
                  "
                </p>
              </div>
              <div className="text-gray-400 mt-2 font-bold">{"}"}</div>
            </div>
          )}
      </div>
    </div>
  );
};
