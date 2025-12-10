import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from "../Icons";

export const ModernTemplate = ({
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
      className="w-full bg-white shadow-sm print:shadow-none mx-auto flex min-h-[1000px]"
      style={{ width: "210mm", minHeight: "297mm" }}
    >
      {/* SIDEBAR (30%) */}
      <div
        className="w-[30%] text-white p-5 flex flex-col gap-5 print:text-white"
        style={{ backgroundColor: "#1e293b" }} // Keep dark sidebar base
      >
        {/* Photo / Name */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-3 border-2 border-slate-700 overflow-hidden relative">
            {personalInfo.photoUrl ? (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-slate-500">
                {personalInfo.name ? personalInfo.name.charAt(0) : "U"}
              </span>
            )}
          </div>
          <h1 className="text-base font-bold tracking-tight mb-0.5">
            {personalInfo.name || "Your Name"}
          </h1>
          <p
            className="text-[9px] uppercase tracking-widest font-medium opacity-80"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle || "Job Title"}
          </p>
        </div>

        <hr className="border-slate-800" />

        {/* Contact Info */}
        <div className="space-y-1.5 text-[9px] text-slate-300">
          {[
            { icon: MailIcon, val: personalInfo.email },
            { icon: PhoneIcon, val: personalInfo.phone },
            {
              icon: MapPinIcon,
              val: [personalInfo.city, personalInfo.country]
                .filter(Boolean)
                .join(", "),
            },
          ].map(
            (item, i) =>
              item.val && (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <item.icon size={8} />
                  </div>
                  <span className="truncate">{item.val}</span>
                </div>
              )
          )}

          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <span className="font-bold text-[8px]">in</span>
              </div>
              <a
                href={personalInfo.linkedin}
                className="truncate hover:underline"
                style={{ color: themeColor }}
              >
                LinkedIn
              </a>
            </div>
          )}
          {personalInfo.portfolio && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <GlobeIcon size={8} />
              </div>
              <a
                href={personalInfo.portfolio}
                className="truncate hover:underline"
                style={{ color: themeColor }}
              >
                Portfolio
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        {sidebarSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id}>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "skills" ? (
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((skill: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-slate-800 text-slate-200 text-[9px] rounded border border-slate-700"
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="font-bold text-white text-[10px]">
                        {item.school ||
                          item.position ||
                          item.title ||
                          item.language}
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        {item.degree || item.company || item.proficiency}
                      </div>
                      <div className="text-slate-500 text-[9px] mt-0.5">
                        {item.graduationDate || item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT (70%) */}
      <div className="w-[70%] p-8 bg-white">
        {mainSections.map((section: any) => {
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id} className="mb-5">
              <h3
                className="text-xs font-bold text-slate-900 border-b-2 border-slate-100 pb-1 mb-3 uppercase tracking-wider flex items-center gap-2"
                style={{ borderColor: hexToRgba(themeColor, 0.2) }}
              >
                <span style={{ color: themeColor }}>
                  {section_type.replace("_", " ")}
                </span>
              </h3>

              {section_type === "summary" ? (
                <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs text-justify">
                  {section_data.text || section_data}
                </p>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.position || item.title}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {item.startDate} – {item.endDate || item.date}
                        </span>
                      </div>
                      <div
                        className="font-medium text-[11px] mb-1"
                        style={{ color: themeColor }}
                      >
                        {item.company || item.issuer}{" "}
                        {item.location && (
                          <span className="text-slate-400">
                            • {item.location}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap text-justify">
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
