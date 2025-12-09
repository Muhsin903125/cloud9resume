/* eslint-disable @next/next/no-img-element */
import React from "react";
import {
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  ZapIcon,
  GlobeIcon,
  AwardIcon,
  PortfolioIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
} from "./Icons";

interface ResumeRendererProps {
  resume: any;
  sections: any[];
  template?: "modern" | "classic" | "minimal";
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  resume,
  sections,
  template = "modern",
}) => {
  if (!resume || !sections) return null;

  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  const personalInfo =
    sections.find((s) => s.section_type === "personal_info")?.section_data ||
    {};

  // Helper to get Icon
  const getSectionIcon = (type: string, colorClass = "text-white") => {
    const props = { size: 14, className: colorClass };
    switch (type) {
      case "experience":
        return <BriefcaseIcon {...props} />;
      case "education":
        return <GraduationCapIcon {...props} />;
      case "skills":
        return <ZapIcon {...props} />;
      case "certifications":
        return <AwardIcon {...props} />;
      case "projects":
        return <PortfolioIcon {...props} />;
      case "languages":
        return <GlobeIcon {...props} />;
      default:
        return null;
    }
  };

  // --- RENDERERS ---

  const renderModern = () => {
    const mainSections = sortedSections.filter((s) =>
      ["summary", "experience", "projects"].includes(s.section_type)
    );
    const sidebarSections = sortedSections.filter(
      (s) =>
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
        <div className="w-[30%] bg-slate-900 text-white p-5 flex flex-col gap-5 print:bg-slate-900 print:text-white">
          {/* Photo / Name */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-3 border-2 border-slate-700">
              <span className="text-xl font-bold text-slate-500">
                {personalInfo.name ? personalInfo.name.charAt(0) : "U"}
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight mb-0.5">
              {personalInfo.name || "Your Name"}
            </h1>
            <p className="text-slate-400 text-[9px] uppercase tracking-widest font-medium">
              {personalInfo.jobTitle || "Job Title"}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5 text-[9px] text-slate-300">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <MailIcon size={8} />
                </div>
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <PhoneIcon size={8} />
                </div>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {(personalInfo.city || personalInfo.country) && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <MapPinIcon size={8} />
                </div>
                <span>
                  {[personalInfo.city, personalInfo.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="font-bold text-[8px]">in</span>
                </div>
                <a
                  href={personalInfo.linkedin}
                  className="hover:text-blue-400 truncate"
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
                  className="hover:text-blue-400 truncate"
                >
                  Portfolio
                </a>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Explicitly Render Education First if in Sidebar */}
          {sidebarSections
            .filter((s) => s.section_type === "education")
            .map((section) => {
              const { section_data } = section;
              if (
                !section_data ||
                (Array.isArray(section_data) && section_data.length === 0)
              )
                return null;
              return (
                <div key={section.id}>
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                    Education
                  </h3>
                  <div className="space-y-2">
                    {(section_data.items || section_data).map(
                      (edu: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-bold text-white text-[10px]">
                            {edu.school}
                          </div>
                          <div className="text-slate-400 text-[9px]">
                            {edu.degree}
                          </div>
                          <div className="text-slate-500 text-[9px] mt-0.5">
                            {edu.graduationDate}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}

          {/* Explicitly Render Skills Second */}
          {sidebarSections
            .filter((s) => s.section_type === "skills")
            .map((section) => {
              const { section_data } = section;
              if (
                !section_data ||
                (Array.isArray(section_data) && section_data.length === 0)
              )
                return null;
              return (
                <div key={section.id}>
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {(section_data.items || section_data).map(
                      (skill: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-800 text-slate-200 text-[9px] rounded border border-slate-700"
                        >
                          {typeof skill === "string" ? skill : skill.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}

          {/* Render Other Sidebar Sections */}
          {sidebarSections
            .filter((s) => !["education", "skills"].includes(s.section_type))
            .map((section) => {
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
                  <div className="text-slate-400 text-[9px]">
                    {(section_data.items || []).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="mb-2">
                          <div className="font-bold text-white text-[10px]">
                            {item.position ||
                              item.title ||
                              item.language ||
                              item.label}
                          </div>
                          <div className="text-slate-400 text-[9px]">
                            {item.company ||
                              item.description ||
                              item.proficiency ||
                              item.value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* MAIN CONTENT (70%) */}
        <div className="w-[70%] p-8 bg-white">
          {mainSections.map((section) => {
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            if (section_type === "summary") {
              return (
                <div key={section.id} className="mb-5">
                  <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-100 pb-1 mb-2 uppercase tracking-wider">
                    Profile
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs text-justify">
                    {section_data.text || section_data}
                  </p>
                </div>
              );
            }

            return (
              <div key={section.id} className="mb-5">
                <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-100 pb-1 mb-3 uppercase tracking-wider flex items-center gap-2">
                  {section_type.replace("_", " ")}
                </h3>

                <div className="space-y-4">
                  {(section_data.items || section_data).map(
                    (item: any, idx: number) => (
                      <div key={idx} className="relative group">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {item.position || item.title}
                          </h4>
                          <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            {item.startDate} – {item.endDate || item.date}
                          </span>
                        </div>
                        <div className="text-blue-600 font-medium text-[11px] mb-1">
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
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderClassic = () => {
    return (
      <div
        id="resume-preview-content"
        className="bg-white text-gray-900 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-serif"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <header className="text-center border-b-2 border-gray-900 pb-4 mb-5">
          <h1 className="text-2xl font-bold mb-1 uppercase tracking-wide">
            {personalInfo.name || "Your Name"}
          </h1>
          <p className="text-sm italic text-gray-700 mb-2">
            {personalInfo.jobTitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-600">
            {[personalInfo.email, personalInfo.phone, personalInfo.city]
              .filter(Boolean)
              .map((t, i) => (
                <span key={i}>
                  {t} {i < 2 ? "•" : ""}
                </span>
              ))}
          </div>
        </header>

        {sortedSections.map((section) => {
          if (section.section_type === "personal_info") return null;
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div key={section.id} className="mb-5">
              <h3 className="font-bold text-base border-b border-gray-300 pb-1 mb-3 uppercase">
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "summary" && (
                <p className="leading-relaxed text-sm text-justify">
                  {section_data.text || section_data}
                </p>
              )}

              {section_type === "skills" && (
                <div className="flex flex-wrap gap-1.5">
                  {(section_data.items || section_data).map(
                    (s: any, idx: number) => (
                      <span
                        key={idx}
                        className="border border-gray-400 px-2 py-0.5 rounded text-xs"
                      >
                        {typeof s === "string" ? s : s.name}
                      </span>
                    )
                  )}
                </div>
              )}

              {!["summary", "skills"].includes(section_type) && (
                <div className="space-y-3">
                  {(section_data.items || section_data).map(
                    (item: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between font-bold text-sm">
                          <span>
                            {item.position || item.title || item.school}
                          </span>
                          <span className="text-xs font-normal">
                            {item.endDate || item.date || item.graduationDate}
                          </span>
                        </div>
                        <div className="italic text-gray-700 text-xs mb-1">
                          {item.company || item.issuer || item.degree}
                        </div>
                        <p className="text-xs leading-relaxed text-justify">
                          {item.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMinimal = () => {
    return (
      <div
        id="resume-preview-content"
        className="bg-white text-gray-900 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[15mm] font-sans"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <header className="mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold mb-0.5 tracking-tight text-gray-900">
            {personalInfo.name || "Your Name"}
          </h1>
          <p className="text-sm text-gray-500 mb-3">{personalInfo.jobTitle}</p>
          <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
            {[personalInfo.email, personalInfo.phone, personalInfo.city]
              .filter(Boolean)
              .map((t, i) => (
                <span key={i} className="bg-gray-50 px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            {personalInfo.linkedin && (
              <a
                href={personalInfo.linkedin}
                className="text-blue-600 underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {sortedSections.map((section) => {
            if (section.section_type === "personal_info") return null;
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            return (
              <div key={section.id}>
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">
                  {section_type.replace("_", " ")}
                </h3>

                {section_type === "summary" && (
                  <p className="text-sm leading-relaxed text-gray-800 text-justify">
                    {section_data.text || section_data}
                  </p>
                )}

                {section_type === "skills" && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {(section_data.items || section_data).map(
                      (s: any, idx: number) => (
                        <span
                          key={idx}
                          className="font-medium text-sm text-gray-900 border-b border-gray-100"
                        >
                          {typeof s === "string" ? s : s.name}
                        </span>
                      )
                    )}
                  </div>
                )}

                {!["summary", "skills"].includes(section_type) && (
                  <div className="space-y-6">
                    {(section_data.items || section_data).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-12 gap-4">
                          <div className="col-span-3 text-xs text-gray-500 pt-0.5">
                            {item.startDate} –{" "}
                            {item.endDate || item.date || item.graduationDate}
                          </div>
                          <div className="col-span-9">
                            <div className="font-bold text-gray-900 text-sm">
                              {item.position || item.title || item.school}
                            </div>
                            <div className="text-gray-600 text-xs mb-1.5">
                              {item.company || item.issuer || item.degree}
                            </div>
                            <p className="text-xs leading-relaxed text-gray-700 text-justify">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  switch (template) {
    case "modern":
      return renderModern();
    case "classic":
      return renderClassic();
    case "minimal":
      return renderMinimal();
    default:
      return renderModern();
  }
};
