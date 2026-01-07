import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from "../Icons";

export const VibrantCreativeTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
  settings,
}: any) => {
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  const renderListSection = (section: any) => {
    if (!section || !section.section_data) return null;
    const { section_type, section_data } = section;
    const items = Array.isArray(section_data)
      ? section_data
      : section_data?.items || [];
    if (items.length === 0) return null;

    return (
      <section key={section.id} className="relative break-inside-avoid">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
            {section.title || section_type.replace("_", " ")}
          </h2>
          <div className="h-0.5 flex-1 bg-slate-100 relative rounded-full">
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-4 ring-white"
              style={{ backgroundColor: themeColor }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="group relative pl-6 border-l-2 border-slate-50 hover:border-slate-200 transition-colors"
            >
              <div
                className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-white border-2 border-slate-100 group-hover:scale-125 transition-transform shadow-sm"
                style={{ borderColor: themeColor }}
              ></div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-1 mb-1">
                <h4 className="text-lg font-bold text-slate-900 group-hover:translate-x-1 transition-transform inline-block leading-tight">
                  {item.position ||
                    item.title ||
                    item.degree ||
                    item.school ||
                    item.institution}
                </h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-2 py-1 rounded whitespace-nowrap">
                  {item.startDate ? `${item.startDate} — ` : ""}
                  {item.endDate || item.date || item.graduationDate}
                </span>
              </div>

              <div
                className="text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wide"
                style={{ color: themeColor }}
              >
                {item.company ||
                  item.issuer ||
                  item.school ||
                  item.institution ||
                  item.degree}
                {item.location && (
                  <span className="text-slate-300 font-medium normal-case">
                    • {item.location}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl text-justify whitespace-pre-wrap">
                  {item.description}
                </p>
              )}

              {item.points && Array.isArray(item.points) && (
                <ul className="mt-2 space-y-1">
                  {item.points.map((pt: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] text-slate-500 leading-relaxed"
                    >
                      <span style={{ color: themeColor }} className="mt-1">
                        •
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSideModule = (section: any) => {
    if (!section || !section.section_data) return null;
    const { section_type, section_data } = section;
    const items = Array.isArray(section_data)
      ? section_data
      : section_data?.items || [];
    if (items.length === 0) return null;

    return (
      <div key={section.id} className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-1 border-b border-slate-200">
          {section_type === "hobbies" ? "Interests" : section_type.replace("_", " ")}
        </h3>
        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="group">
              <div className="font-bold text-slate-800 text-[11px] leading-tight group-hover:text-slate-900 transition-colors">
                {item.degree || item.school || item.title || item.name || item.award}
              </div>
              {(item.date || item.year || item.company) && (
                <div className="text-slate-400 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                  {item.date || item.year || item.company}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillsSection = (section: any) => {
    if (!section || !section.section_data) return null;
    const { section_type, section_data } = section;

    return (
      <section key={section.id} className="relative break-inside-avoid">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
            {section_type === "hobbies" ? "Interests" : section_type.replace("_", " ")}
          </h2>
          <div className="h-0.5 flex-1 bg-slate-100 relative rounded-full">
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-4 ring-white"
              style={{ backgroundColor: themeColor }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(() => {
            const data = section_data;
            if (typeof data === "object" && !Array.isArray(data)) {
              const categories = Object.keys(data).filter((k) => k !== "items");
              if (categories.length > 0) {
                return (
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((category, idx) => {
                      const skills = data[category];
                      if (!Array.isArray(skills)) return null;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                            {category}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((s, i) => (
                              <span
                                key={i}
                                className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600 hover:border-slate-200 transition-colors"
                              >
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                {typeof s === "string" ? s : s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            }

            const items = Array.isArray(data) ? data : data?.items || [];
            return items.map((s: any, idx: number) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-black uppercase tracking-wide text-slate-600 shadow-sm hover:border-slate-200 transition-all hover:translate-y-[-1px]"
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: themeColor }}></span>
                {typeof s === "string"
                  ? s
                  : section_type === "languages"
                  ? `${s.language}${s.proficiency ? ` (${s.proficiency})` : ""}`
                  : s.name || s.skill || s.language}
              </span>
            ));
          })()}
        </div>
      </section>
    );
  };

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full shadow-sm print:shadow-none mx-auto flex overflow-hidden lg:flex-row flex-col p-[10mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "'Poppins', sans-serif",
      }}
    >
      {/* Left Accent Bar (Small) */}
      <div
        className="w-2 lg:block hidden shrink-0 rounded-full"
        style={{ backgroundColor: themeColor }}
      ></div>

      {/* Main Container */}
      <div className="flex-1 flex lg:flex-row flex-col">
        {/* Sidebar Space (30%) */}
        <div className="lg:w-[30%] w-full bg-slate-50 border-r border-slate-100 p-5 flex flex-col gap-6">
          {/* Photo & Name Card */}
          <div className="text-center lg:text-left">
            {personalInfo.showPhoto !== false && (
              <div className="w-24 h-24 mx-auto lg:mx-0 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 mb-4 overflow-hidden relative rotate-3 transition-transform hover:rotate-0">
                {personalInfo.photoUrl ? (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-full h-full object-cover -rotate-3 transition-transform hover:rotate-0"
                  />
                ) : (
                  <span className="text-4xl font-black text-slate-200 -rotate-3">
                    {personalInfo.name?.[0] || "U"}
                  </span>
                )}
              </div>
            )}
            <h1 className="text-2xl font-black text-slate-900 leading-none mb-3 tracking-tight uppercase">
              {personalInfo.name || "YOUR NAME"}
            </h1>
            <p
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white border border-slate-200 inline-block rounded-lg shadow-sm"
              style={{ color: themeColor }}
            >
              {personalInfo.jobTitle || "Your Profession"}
            </p>
          </div>

          {/* Contact Block */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-1 border-b border-slate-200">
              Connection
            </h3>
            <div className="space-y-2 text-[10px] font-semibold text-slate-600">
              {[
                { icon: MailIcon, val: personalInfo.email },
                { icon: PhoneIcon, val: personalInfo.phone },
                { icon: MapPinIcon, val: personalInfo.city },
                { icon: GlobeIcon, val: personalInfo.website },
              ].map(
                (item, i) =>
                  item.val && (
                    <div key={i} className="flex items-center gap-3 group">
                      <span
                        className="shrink-0 p-2 rounded-lg bg-white border border-slate-100 shadow-sm group-hover:scale-110 transition-transform"
                        style={{ color: themeColor }}
                      >
                        <item.icon size={12} />
                      </span>
                      <span className="truncate">{item.val}</span>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Sidebar Modules (Achievements, Volunteering, etc) */}
          {sortedSections.map((section: any) => {
            const { section_type } = section;
            const isSidebarSection = [
              "achievements",
              "volunteering",
              "certifications",
              "languages",
              "hobbies",
            ].includes(section_type);

            if (!isSidebarSection) return null;

            if (section_type === "languages" || section_type === "hobbies") {
              return (
                <div key={section.id} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-1 border-b border-slate-200">
                    {section_type === "hobbies" ? "Interests" : "Languages"}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(section.section_data)
                      ? section.section_data
                      : section.section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600"
                      >
                        {typeof item === "string"
                          ? item
                          : section_type === "languages"
                          ? item.language
                          : item.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            return renderSideModule(section);
          })}
        </div>

        {/* Main Content Area (70%) */}
        <div className="flex-1 p-5 bg-white">
          <div className="space-y-6">
            {(() => {
              const summary = sortedSections.find((s) => s.section_type === "summary");
              const experience = sortedSections.find((s) => s.section_type === "experience");
              const skills = sortedSections.find((s) => s.section_type === "skills");
              const education = sortedSections.find((s) => s.section_type === "education");
              const projects = sortedSections.find((s) => s.section_type === "projects");

              return (
                <>
                  {/* 1. Summary */}
                  {summary && (
                    <section className="break-inside-avoid">
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium text-justify italic">
                        "{summary.section_data.text || summary.section_data}"
                      </p>
                    </section>
                  )}

                  {/* 2. Experience */}
                  {experience && renderListSection(experience)}

                  {/* 3. Skills */}
                  {skills && renderSkillsSection(skills)}

                  {/* 4. Education */}
                  {education && renderListSection(education)}

                  {/* 5. Projects */}
                  {projects && renderListSection(projects)}

                  {/* 6. Remaining Main Sections (if any) */}
                  {sortedSections.map((section: any) => {
                    const { section_type } = section;
                    if (
                      [
                        "personal_info",
                        "summary",
                        "experience",
                        "skills",
                        "education",
                        "projects",
                        "languages",
                        "hobbies",
                        "declaration",
                        "achievements",
                        "volunteering",
                        "certifications",
                      ].includes(section_type)
                    )
                      return null;
                    return renderListSection(section);
                  })}

                  {/* 9. Declaration */}
                  {(() => {
                    const declSection = sortedSections.find((s) => s.section_type === "declaration");
                    if (!declSection || !declSection.section_data?.text) return null;
                    return (
                      <section className="relative break-inside-avoid mt-4">
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
                            Declaration
                          </h2>
                          <div className="h-0.5 flex-1 bg-slate-100 relative rounded-full">
                            <div
                              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-4 ring-white"
                              style={{ backgroundColor: themeColor }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed font-medium text-justify italic px-4 border-l-2 border-slate-100">
                          "{declSection.section_data.text}"
                        </p>
                      </section>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
