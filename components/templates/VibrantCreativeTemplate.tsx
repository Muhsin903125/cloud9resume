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

  const mainSections = sortedSections.filter((s: any) =>
    ["summary", "experience", "projects"].includes(s.section_type)
  );

  const sidebarSections = sortedSections.filter(
    (s: any) =>
      ![
        "personal_info",
        "summary",
        "experience",
        "projects",
        "declaration",
      ].includes(s.section_type)
  );

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full shadow-sm print:shadow-none mx-auto flex overflow-hidden lg:flex-row flex-col"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "'Poppins', sans-serif",
      }}
    >
      {/* Left Accent Bar (Small) */}
      <div
        className="w-2.5 lg:block hidden shrink-0"
        style={{ backgroundColor: themeColor }}
      ></div>

      {/* Main Container */}
      <div className="flex-1 flex lg:flex-row flex-col">
        {/* Sidebar Space (32%) */}
        <div className="lg:w-[32%] w-full bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-10">
          {/* Photo & Name Card */}
          <div className="text-center lg:text-left">
            {personalInfo.showPhoto !== false && (
              <div className="w-28 h-28 mx-auto lg:mx-0 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 mb-6 overflow-hidden relative rotate-3 transition-transform hover:rotate-0">
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
            <h1 className="text-3xl font-black text-slate-900 leading-none mb-3 tracking-tight">
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
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pb-2 border-b border-slate-200">
              Connection
            </h3>
            <div className="space-y-3.5 text-[11px] font-semibold text-slate-600">
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

          {/* Sidebar Modules (Skills, Languages, etc) */}
          {sidebarSections.map((section: any) => (
            <div key={section.id} className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pb-2 border-b border-slate-200">
                {section.section_type.replace("_", " ")}
              </h3>

              {section.section_type === "skills" ||
              section.section_type === "languages" ? (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 shadow-sm"
                    >
                      {typeof s === "string" ? s : s.name || s.language}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="text-xs">
                      <div className="font-bold text-slate-800 text-[13px] leading-tight">
                        {item.degree || item.school || item.title}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 font-medium">
                        {item.date || item.year || item.company}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Area (68%) */}
        <div className="flex-1 p-12 bg-white">
          <div className="space-y-12">
            {mainSections.map((section: any) => {
              const { section_type, section_data } = section;
              if (
                !section_data ||
                (Array.isArray(section_data) && section_data.length === 0)
              )
                return null;

              return (
                <section
                  key={section.id}
                  className="relative break-inside-avoid"
                >
                  {/* Section Label Header */}
                  <div className="flex items-center gap-5 mb-8">
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
                      {section_type.replace("_", " ")}
                    </h2>
                    <div className="h-0.5 flex-1 bg-slate-100 relative rounded-full">
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-4 ring-white"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                    </div>
                  </div>

                  {section_type === "summary" ? (
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium text-justify">
                      {section_data.text || section_data}
                    </p>
                  ) : (
                    <div className="space-y-10">
                      {(Array.isArray(section_data)
                        ? section_data
                        : section_data?.items || []
                      ).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="group relative pl-8 border-l-2 border-slate-50 hover:border-slate-200 transition-colors"
                        >
                          <div
                            className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-white border-2 border-slate-100 group-hover:scale-125 transition-transform shadow-sm"
                            style={{ borderColor: themeColor }}
                          ></div>

                          <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2 mb-2">
                            <h4 className="text-lg font-bold text-slate-900 group-hover:translate-x-1 transition-transform inline-block">
                              {item.position || item.title}
                            </h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-2 py-1 rounded whitespace-nowrap">
                              {item.startDate}{" "}
                              {item.endDate && `— ${item.endDate}`}
                            </span>
                          </div>

                          <div
                            className="text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-wide"
                            style={{ color: themeColor }}
                          >
                            {item.company || item.issuer || item.school}
                            {item.location && (
                              <span className="text-slate-300 font-medium normal-case">
                                • {item.location}
                              </span>
                            )}
                          </div>

                          <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl text-justify whitespace-pre-wrap">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Explicit Declaration at Bottom */}
            {sections.find((s: any) => s.section_type === "declaration") &&
              sections.find((s: any) => s.section_type === "declaration")
                .section_data?.text && (
                <section className="relative break-inside-avoid">
                  <div className="flex items-center gap-5 mb-8">
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
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium text-justify">
                    {
                      sections.find(
                        (s: any) => s.section_type === "declaration"
                      ).section_data.text
                    }
                  </p>
                </section>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
