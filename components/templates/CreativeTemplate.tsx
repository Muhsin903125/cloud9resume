import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from "../Icons";

export const CreativeTemplate = ({
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
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto flex"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: font || "'Poppins', sans-serif",
      }}
    >
      {/* Left Sidebar (35%) - Dynamic Checkered/Artistic BG concept or just bold color */}
      <div
        className="w-[35%] p-8 flex flex-col gap-10 text-white relative overflow-hidden"
        style={{ backgroundColor: themeColor }}
      >
        {/* Artistic shapes overlay */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 scale-150 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10 text-center">
          {personalInfo.showPhoto !== false && (
            <div className="w-36 h-36 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 mb-6 overflow-hidden relative shadow-2xl">
              {personalInfo.photoUrl ? (
                <img
                  src={personalInfo.photoUrl}
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-black text-white/80">
                  {personalInfo.name?.[0] || "U"}
                </span>
              )}
            </div>
          )}

          <h1 className="text-3xl font-black uppercase leading-none mb-3 tracking-tighter drop-shadow-md">
            {personalInfo.name?.split(" ").map((word: string, i: number) => (
              <span key={i} className="block">
                {word}
              </span>
            )) || "YOUR NAME"}
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 border-t border-white/30 pt-4 mt-2 inline-block px-4">
            {personalInfo.jobTitle}
          </p>
        </div>

        {/* Contact Info */}
        <div className="relative z-10 space-y-4 text-xs font-medium opacity-95">
          {[
            { icon: MailIcon, val: personalInfo.email },
            { icon: PhoneIcon, val: personalInfo.phone },
            { icon: MapPinIcon, val: personalInfo.city },
            { icon: GlobeIcon, val: personalInfo.website },
          ].map(
            (item, i) =>
              item.val && (
                <div key={i} className="flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-lg shadow-sm">
                    <item.icon size={11} />
                  </span>
                  <span className="break-all font-semibold tracking-wide">
                    {item.val}
                  </span>
                </div>
              )
          )}
        </div>

        {/* Sidebar Sections (Skills, Education, etc) */}
        <div className="relative z-10 flex-1 space-y-10">
          {sidebarSections.map((section: any) => {
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            return (
              <div key={section.id}>
                <h3 className="text-sm font-black uppercase mb-5 flex items-center gap-3 tracking-widest opacity-90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full block"></span>
                  {section_type.replace("_", " ")}
                </h3>

                {section_type === "skills" || section_type === "languages" ? (
                  <div className="flex flex-wrap gap-2.5">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white/10 hover:bg-white/20 transition-all border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide"
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
                ) : (
                  <div className="space-y-5">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <div className="font-bold opacity-100 leading-tight mb-1">
                          {item.degree || item.school || item.title}
                        </div>
                        <div className="opacity-70 text-xs font-medium">
                          {item.date || item.year || item.company}
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

      {/* Right Content */}
      <div className="flex-1 p-12 bg-white">
        {mainSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id} className="mb-12 break-inside-avoid">
              <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-8 h-1 bg-gray-900"></span>
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "summary" ? (
                <p className="text-[13px] text-gray-600 leading-relaxed font-medium text-justify">
                  {section_data.text || section_data}
                </p>
              ) : (
                <div className="space-y-10 border-l-2 border-gray-100 ml-4 pl-8 relative">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <div
                        className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-[3px] border-white shadow-md z-10"
                        style={{ backgroundColor: themeColor }}
                      ></div>

                      <div className="flex justify-between items-baseline mb-2 gap-4">
                        <h4 className="text-lg font-bold text-gray-900 leading-tight">
                          {item.position || item.title}
                        </h4>
                        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">
                          {item.startDate} {item.endDate && `- ${item.endDate}`}
                        </span>
                      </div>

                      <div
                        className="text-xs font-extrabold uppercase tracking-wider mb-3"
                        style={{ color: themeColor }}
                      >
                        {item.company || item.issuer || item.school}
                        {item.location && (
                          <span className="text-gray-300 ml-2 font-medium normal-case">
                            {item.location}
                          </span>
                        )}
                      </div>

                      <p className="text-[13px] text-gray-600 leading-relaxed max-w-2xl text-justify whitespace-pre-wrap">
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
              <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6 flex items-center gap-4">
                <span className="w-8 h-1 bg-gray-900"></span>
                Declaration
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed font-medium text-justify">
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
