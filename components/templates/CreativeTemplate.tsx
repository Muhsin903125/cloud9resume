import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from "../Icons";

export const CreativeTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
}: any) => {
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  const mainSections = sections.filter((s: any) =>
    ["summary", "experience", "projects"].includes(s.section_type)
  );
  const sidebarSections = sections.filter(
    (s: any) =>
      !["personal_info", "summary", "experience", "projects"].includes(
        s.section_type
      )
  );

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto flex"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Left Sidebar (35%) - Dynamic Checkered/Artistic BG concept or just bold color */}
      <div
        className="w-[35%] p-8 flex flex-col gap-8 text-white relative overflow-hidden"
        style={{ backgroundColor: themeColor }}
      >
        {/* Artistic shapes overlay */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center">
          <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 mb-6 overflow-hidden relative">
            {personalInfo.photoUrl ? (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-white">
                {personalInfo.name?.[0] || "U"}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black uppercase leading-tight mb-2 tracking-tighter">
            {personalInfo.name?.split(" ").map((word: string, i: number) => (
              <span key={i} className="block">
                {word}
              </span>
            )) || "YOUR NAME"}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 border-t border-white/30 pt-4 mt-4 inline-block px-4">
            {personalInfo.jobTitle}
          </p>
        </div>

        {/* Contact Info */}
        <div className="relative z-10 space-y-3 text-xs font-medium opacity-90">
          {[
            { icon: MailIcon, val: personalInfo.email },
            { icon: PhoneIcon, val: personalInfo.phone },
            { icon: MapPinIcon, val: personalInfo.city },
            { icon: GlobeIcon, val: personalInfo.website },
          ].map(
            (item, i) =>
              item.val && (
                <div key={i} className="flex items-center gap-3">
                  <span className="bg-white/20 p-1.5 rounded-md">
                    <item.icon size={10} />
                  </span>
                  <span className="break-all">{item.val}</span>
                </div>
              )
          )}
        </div>

        {/* Sidebar Sections (Skills, Education, etc) */}
        <div className="relative z-10 flex-1 space-y-8">
          {sidebarSections.map((section: any) => {
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            return (
              <div key={section.id}>
                <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-white block"></span>
                  {section_type.replace("_", " ")}
                </h3>

                {section_type === "skills" ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded text-[10px] font-bold"
                      >
                        {typeof s === "string" ? s : s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        <div className="font-bold opacity-100">
                          {item.degree || item.school}
                        </div>
                        <div className="opacity-70 text-[10px]">
                          {item.date || item.year}
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
      <div className="flex-1 p-10 bg-white">
        {mainSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id} className="mb-10">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-6 flex items-baseline gap-3">
                {section_type.replace("_", " ")}
                <span className="flex-1 h-1 bg-gray-100 rounded-full"></span>
              </h3>

              {section_type === "summary" ? (
                <p className="text-sm text-gray-600 leading-7 font-medium">
                  {section_data.text || section_data}
                </p>
              ) : (
                <div className="space-y-8 border-l-2 border-gray-100 ml-2 pl-6 relative">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div
                        className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: themeColor }}
                      ></div>

                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-base font-bold text-gray-900">
                          {item.position || item.title}
                        </h4>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                          {item.startDate} {item.endDate && `- ${item.endDate}`}
                        </span>
                      </div>

                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: themeColor }}
                      >
                        {item.company || item.issuer}
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed max-w-lg">
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
