import React from "react";

export const BoldTemplate = ({
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
      // Using Slate 900 as base text color instead of pure black
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-sans text-slate-900"
      style={{ width: "210mm", minHeight: "297mm" }}
    >
      <header className="mb-12">
        <h1
          className="text-6xl font-black uppercase tracking-tighter leading-none mb-4"
          style={{ color: themeColor }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-wide">
          <span className="bg-slate-900 text-white px-2 py-0.5">
            {personalInfo.jobTitle}
          </span>
          {[personalInfo.email, personalInfo.phone, personalInfo.city]
            .filter(Boolean)
            .map((val, i) => (
              <span key={i} className="text-slate-500">
                {val}
              </span>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
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
                className="text-4xl font-black uppercase mb-6 tracking-tighter opacity-10"
                style={{ color: themeColor }}
              >
                {section_type}
              </h3>

              {section_type === "summary" && (
                <p className="text-lg font-medium leading-relaxed max-w-3xl">
                  {section_data.text || section_data}
                </p>
              )}

              {section_type === "skills" && (
                <div className="flex flex-wrap gap-3">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-sm font-bold border-2 border-slate-900 px-3 py-1 uppercase hover:bg-slate-900 hover:text-white transition-colors cursor-default"
                    >
                      {typeof s === "string" ? s : s.name}
                    </span>
                  ))}
                </div>
              )}

              {!["summary", "skills"].includes(section_type) && (
                <div className="space-y-8 border-l-4 border-slate-900 pl-6">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-2">
                        <h4 className="text-xl font-bold uppercase">
                          {item.position || item.title}
                        </h4>
                        <span className="text-sm font-bold text-slate-400">
                          {item.startDate} — {item.endDate || "Present"}
                        </span>
                      </div>
                      <div className="text-sm font-bold uppercase mb-3 text-slate-500">
                        {item.company || item.issuer || item.degree}
                      </div>
                      <p className="text-sm font-medium leading-7 text-slate-700 max-w-2xl">
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
