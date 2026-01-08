import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from "../Icons";

export const ModernTemplate = ({
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
      className="w-full bg-white shadow-sm print:shadow-none mx-auto flex min-h-screen relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
        fontFamily: font || "inherit",
      }}
    >
      {/* SIDEBAR (30%) */}
      <div
        className="w-[30%] text-white p-6 flex flex-col gap-6 print:text-white relative"
        style={{
          backgroundColor: "#1e293b",
          // Helper for print background extension
          boxShadow: `inset -1000px 0 0 0 #1e293b`,
        }}
      >
        {/* Photo / Name */}
        <div className="text-center">
          {personalInfo.showPhoto !== false && (
            <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700 overflow-hidden relative">
              {personalInfo.photoUrl ? (
                <img
                  src={personalInfo.photoUrl}
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-slate-500">
                  {personalInfo.name ? personalInfo.name.charAt(0) : "U"}
                </span>
              )}
            </div>
          )}
          <h1 className="text-lg font-bold tracking-tight mb-1 break-words leading-tight">
            {personalInfo.name || "Your Name"}
          </h1>
          <p
            className="text-[10px] uppercase tracking-widest font-medium opacity-80 break-words"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle || "Job Title"}
          </p>
        </div>

        <hr className="border-slate-800" />

        {/* Contact Info */}
        <div className="space-y-2 text-[10px] text-slate-300">
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
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon size={9} />
                  </div>
                  <span className="break-all">{item.val}</span>
                </div>
              )
          )}

          {personalInfo.linkedin && (
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-bold text-[9px]">in</span>
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
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                <GlobeIcon size={9} />
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
            <div key={section.id} className="break-inside-avoid">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "skills" || section_type === "languages" ? (
                /* Simplified Skills/Languages List */
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => {
                    const val =
                      typeof item === "string"
                        ? item
                        : `${item.language}${
                            item.proficiency ? ` (${item.proficiency})` : ""
                          }`;
                    return (
                      <span
                        key={idx}
                        className="text-[10px] text-slate-300 border-b border-slate-700 pb-0.5"
                      >
                        {val}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="font-bold text-white text-[11px] leading-snug">
                        {/* Fallback chain for various section types in sidebar */}
                        {item.school ||
                          item.university ||
                          item.institution ||
                          item.position ||
                          item.title ||
                          item.name ||
                          item.role ||
                          item.language}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {item.degree ||
                          item.company ||
                          item.organization ||
                          item.issuer ||
                          item.awarder ||
                          item.publisher ||
                          item.proficiency}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5 italic">
                        {item.graduationDate || item.date || item.endDate}
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
      <div className="w-[70%] bg-white relative">
        <table className="w-full">
          <thead className="h-[12mm] print:h-[12mm] opacity-0">
            <tr>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-8 py-8 align-top">
                {mainSections.map((section: any) => {
                  const { section_type, section_data } = section;
                  if (
                    !section_data ||
                    (Array.isArray(section_data) && section_data.length === 0)
                  )
                    return null;

                  return (
                    <div key={section.id} className="mb-7 break-inside-avoid">
                      <h3
                        className="text-sm font-bold text-slate-900 border-b-2 border-slate-100 pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2"
                        style={{ borderColor: hexToRgba(themeColor, 0.2) }}
                      >
                        <span style={{ color: themeColor }}>
                          {section_type.replace("_", " ")}
                        </span>
                      </h3>

                      {section_type === "summary" ? (
                        <p className="text-slate-700 leading-relaxed text-[12px] text-justify">
                          {section_data.text || section_data}
                        </p>
                      ) : (
                        <div className="space-y-5">
                          {(Array.isArray(section_data)
                            ? section_data
                            : section_data?.items || []
                          ).map((item: any, idx: number) => (
                            <div key={idx} className="relative group">
                              <div className="flex justify-between items-baseline mb-1 gap-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-slate-900 text-[13px]">
                                    {item.position ||
                                      item.title ||
                                      item.degree ||
                                      item.school ||
                                      item.institution ||
                                      item.name ||
                                      item.role}
                                  </h4>
                                  <div
                                    className="font-medium text-[12px] mt-0.5"
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
                                      <span className="text-slate-400 ml-1 font-normal">
                                        • {item.location}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {(item.startDate ||
                                  item.date ||
                                  item.endDate) && (
                                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-1 rounded border border-slate-100 shrink-0">
                                    {item.startDate && `${item.startDate} – `}
                                    {item.endDate || item.date}
                                  </span>
                                )}
                              </div>

                              {item.description && (
                                <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap text-justify mt-1.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Explicitly render Declaration at the bottom */}
                {sections.find((s: any) => s.section_type === "declaration") &&
                  sections.find((s: any) => s.section_type === "declaration")
                    .section_data?.text && (
                    <div className="mb-6 break-inside-avoid">
                      <h3
                        className="text-sm font-bold text-slate-900 border-b-2 border-slate-100 pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2"
                        style={{ borderColor: hexToRgba(themeColor, 0.2) }}
                      >
                        <span style={{ color: themeColor }}>Declaration</span>
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-[12px] text-justify">
                        {
                          sections.find(
                            (s: any) => s.section_type === "declaration"
                          ).section_data.text
                        }
                      </p>
                    </div>
                  )}
              </td>
            </tr>
          </tbody>
          <tfoot className="h-[12mm] print:h-[12mm] opacity-0">
            <tr>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
