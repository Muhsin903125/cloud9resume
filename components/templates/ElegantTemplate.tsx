import React from "react";

export const ElegantTemplate = ({
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
      // Added print styles directly
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-serif"
      style={{ width: "210mm", minHeight: "297mm", color: "#4b5563" }} // slate-600ish
    >
      <header className="text-center mb-12">
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.name}
            className="w-20 h-20 mx-auto rounded-full object-cover mb-4 border border-gray-100 shadow-sm"
          />
        )}
        <h1
          className="text-4xl font-normal tracking-wide mb-3"
          style={{ color: themeColor }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        <div className="w-16 h-px mx-auto mb-4 bg-gray-300"></div>
        <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">
          {personalInfo.jobTitle}
        </p>

        <div className="flex justify-center flex-wrap gap-4 text-xs italic text-gray-500">
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.city,
            personalInfo.linkedin,
          ]
            .filter(Boolean)
            .map((v, i) => (
              <span key={i}>{v}</span>
            ))}
        </div>
      </header>

      <div className="space-y-10 px-8">
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
              <h3 className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-6 text-gray-400">
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "summary" && (
                <p className="text-sm leading-8 text-center max-w-xl mx-auto text-gray-700">
                  {section_data.text || section_data}
                </p>
              )}

              {section_type === "skills" && (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-2xl mx-auto">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs italic text-gray-600 border-b border-gray-200 pb-0.5"
                    >
                      {typeof s === "string" ? s : s.name}
                    </span>
                  ))}
                </div>
              )}

              {!["summary", "skills"].includes(section_type) && (
                <div className="space-y-8">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-8">
                      <div className="col-span-3 text-right">
                        <div className="font-bold text-sm text-gray-900">
                          {item.company || item.issuer || item.degree}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 italic">
                          {item.startDate} – {item.endDate || "Present"}
                        </div>
                      </div>
                      <div className="col-span-9 border-l border-gray-200 pl-8">
                        <h4
                          className="font-bold text-sm text-gray-800 mb-2 uppercase tracking-wide"
                          style={{ color: themeColor }}
                        >
                          {item.position || item.title || item.school}
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-600 text-justify">
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
      </div>
    </div>
  );
};
