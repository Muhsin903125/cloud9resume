import React from "react";

export const GeometricCreativeTemplate = ({
  resume,
  sections,
  themeColor,
  font,
}: any) => {
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  const sortedSections = [...sections]
    .filter((s) => s.section_type !== "personal_info")
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <div
      id="resume-preview-content"
      className="bg-slate-50 w-full shadow-sm print:shadow-none mx-auto p-10"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "'Montserrat', sans-serif",
      }}
    >
      {/* Boxed Header Container */}
      <div
        className="border-[6px] border-slate-900 p-8 bg-white shadow-[12px_12px_0px_0px] mb-12 flex justify-between items-center"
        style={{ boxShadow: `12px 12px 0px 0px ${themeColor}` }}
      >
        <div className="flex-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-4">
            {personalInfo.name || "YOUR NAME"}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.city && <span>{personalInfo.city}</span>}
          </div>
        </div>
        <div className="w-px h-16 bg-slate-200 mx-8"></div>
        <div className="text-right">
          <p className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
            {personalInfo.jobTitle || "PROFESSIONAL"}
          </p>
          {personalInfo.website && (
            <p className="text-[10px] font-bold text-slate-400">
              {personalInfo.website}
            </p>
          )}
        </div>
      </div>

      {/* Grid Layout for Sections */}
      <div className="grid grid-cols-12 gap-8">
        {sortedSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          // Determine column span based on content type
          const isFullWidth = ["experience", "projects", "summary"].includes(
            section_type
          );
          const colSpan = isFullWidth ? "col-span-12" : "col-span-6";

          return (
            <div
              key={section.id}
              className={`${colSpan} bg-white border-2 border-slate-900 p-6 relative`}
            >
              {/* Floating Section Label */}
              <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                {section_type.replace("_", " ")}
              </div>

              {section_type === "summary" || section_type === "declaration" ? (
                <p className="text-xs text-slate-600 leading-relaxed font-bold">
                  {section_data.text || section_data}
                </p>
              ) : (
                <div className="space-y-6 mt-2">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      {section_type === "skills" ||
                      section_type === "languages" ? (
                        <div className="flex items-center justify-between border-b-2 border-slate-50 pb-2">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {typeof item === "string"
                              ? item
                              : item.name || item.language}
                          </span>
                          {item.proficiency && (
                            <span className="text-[9px] font-black text-slate-300 uppercase letter-spacing-[0.2em]">
                              {item.proficiency}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                              {item.position ||
                                item.title ||
                                item.degree ||
                                item.school}
                            </h4>
                            <span className="text-[9px] font-black text-slate-400 shrink-0 ml-4">
                              {item.startDate || item.date || item.year}{" "}
                              {item.endDate && `— ${item.endDate}`}
                            </span>
                          </div>
                          <div
                            className="text-[10px] font-black uppercase mb-3 flex items-center gap-2"
                            style={{ color: themeColor }}
                          >
                            {item.company || item.issuer || item.school}
                            {item.location && (
                              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            )}
                            {item.location && (
                              <span className="text-slate-300 font-bold">
                                {item.location}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 leading-relaxed text-justify font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
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
