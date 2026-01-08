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

  const renderSection = (section: any, isFullWidth = false) => {
    if (!section || !section.section_data) return null;
    const { section_type, section_data } = section;
    const items = Array.isArray(section_data)
      ? section_data
      : section_data?.items || [];
    if (
      items.length === 0 &&
      section_type !== "summary" &&
      section_type !== "declaration"
    )
      return null;

    const colSpan = isFullWidth ? "col-span-12" : "col-span-12 sm:col-span-6";

    return (
      <div
        key={section.id}
        className={`${colSpan} bg-white border-2 border-slate-900 p-5 relative break-inside-avoid`}
      >
        {/* Floating Section Label */}
        <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
          {section_type === "hobbies"
            ? "Interests"
            : section_type.replace("_", " ")}
        </div>

        {section_type === "summary" || section_type === "declaration" ? (
          <p className="text-xs text-slate-600 leading-relaxed font-bold mt-2">
            {section_data.text || section_data}
          </p>
        ) : section_type === "skills" || section_type === "languages" ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {(() => {
              const data = section_data;
              const skills = Array.isArray(data) ? data : data?.items || [];
              return skills.map((s: any, i: number) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600 transition-colors hover:border-slate-200"
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: themeColor }}
                  ></span>
                  {typeof s === "string"
                    ? s
                    : section_type === "languages"
                    ? `${s.language}${
                        s.proficiency ? ` (${s.proficiency})` : ""
                      }`
                    : s.name || s.skill}
                </span>
              ));
            })()}
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="relative">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                      {item.position ||
                        item.title ||
                        item.degree ||
                        item.school ||
                        item.institution ||
                        item.name ||
                        item.role}
                    </h4>
                    <span className="text-[9px] font-black text-slate-400 shrink-0 ml-4">
                      {item.startDate ? `${item.startDate} — ` : ""}
                      {item.endDate ||
                        item.date ||
                        item.year ||
                        item.graduationDate}
                    </span>
                  </div>
                  <div
                    className="text-[10px] font-black uppercase mb-2 flex items-center gap-2"
                    style={{ color: themeColor }}
                  >
                    {item.company ||
                      item.issuer ||
                      item.school ||
                      item.institution ||
                      item.degree ||
                      item.organization ||
                      item.publisher ||
                      item.awarder}
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
                    <p className="text-[10px] text-slate-500 leading-relaxed text-justify font-medium whitespace-pre-wrap">
                      {item.description}
                    </p>
                  )}
                  {item.points && Array.isArray(item.points) && (
                    <ul className="mt-2 space-y-1">
                      {item.points.map((pt: string, i: number) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[10px] text-slate-500 font-medium leading-relaxed"
                        >
                          <span style={{ color: themeColor }}>▪</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="resume-preview-content"
      className="bg-slate-50 w-full shadow-sm print:shadow-none mx-auto p-[10mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "'Montserrat', sans-serif",
      }}
    >
      {/* Boxed Header Container */}
      <div
        className="border-[6px] border-slate-900 p-6 bg-white shadow-[12px_12px_0px_0px] mb-8 flex justify-between items-center"
        style={{ boxShadow: `12px 12px 0px 0px ${themeColor}` }}
      >
        <div className="flex-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-4">
            {personalInfo.name || "YOUR NAME"}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {[personalInfo.city, personalInfo.country]
              .filter(Boolean)
              .join(", ") && (
              <span>
                {[personalInfo.city, personalInfo.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
          </div>
        </div>
        <div className="w-px h-16 bg-slate-200 mx-8 hidden sm:block"></div>
        <div className="text-right hidden sm:block">
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
      <div className="grid grid-cols-12 gap-5">
        {(() => {
          const summary = sortedSections.find(
            (s) => s.section_type === "summary"
          );
          const experience = sortedSections.find(
            (s) => s.section_type === "experience"
          );
          const skills = sortedSections.find(
            (s) => s.section_type === "skills"
          );
          const education = sortedSections.find(
            (s) => s.section_type === "education"
          );
          const projects = sortedSections.find(
            (s) => s.section_type === "projects"
          );
          const declaration = sortedSections.find(
            (s) => s.section_type === "declaration"
          );

          return (
            <>
              {/* 1. Summary */}
              {summary && renderSection(summary, true)}

              {/* 2. Experience */}
              {experience && renderSection(experience, true)}

              {/* 3. Skills */}
              {skills && renderSection(skills, false)}

              {/* 4. Education */}
              {education && renderSection(education, false)}

              {/* 5. Projects */}
              {projects && renderSection(projects, true)}

              {/* 6. Remaining Sections */}
              {sortedSections.map((section: any) => {
                const { section_type } = section;
                if (
                  [
                    "summary",
                    "experience",
                    "skills",
                    "education",
                    "projects",
                    "languages",
                    "hobbies",
                    "declaration",
                  ].includes(section_type)
                )
                  return null;
                return renderSection(section, false);
              })}

              {/* 7. Languages */}
              {(() => {
                const langSection = sortedSections.find(
                  (s) => s.section_type === "languages"
                );
                return langSection ? renderSection(langSection, false) : null;
              })()}

              {/* 8. Interests */}
              {(() => {
                const hobbySection = sortedSections.find(
                  (s) => s.section_type === "hobbies"
                );
                return hobbySection ? renderSection(hobbySection, false) : null;
              })()}

              {/* 9. Declaration */}
              {declaration && renderSection(declaration, true)}
            </>
          );
        })()}
      </div>
    </div>
  );
};
