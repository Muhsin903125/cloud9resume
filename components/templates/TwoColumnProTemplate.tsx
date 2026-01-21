import React from "react";
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";

interface Section {
  id: string;
  title: string;
  section_type: string;
  section_data: any;
}

interface TwoColumnProTemplateProps {
  resume: any;
  sections: Section[];
}

export const TwoColumnProTemplate: React.FC<TwoColumnProTemplateProps> = ({
  resume,
  sections,
}) => {
  const { personal_info, settings } = resume;
  const personalInfo = personal_info || {};
  const themeColor = settings?.theme_color || "#0f172a"; // Default deep slate
  const font = settings?.font || "inter";

  // Formatted date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Define sidebar sections
  const sidebarSections = [
    "skills",
    "languages",
    "hobbies",
    "social_media",
    "education",
    "certifications",
  ];

  return (
    <div
      className="bg-white min-h-[297mm] w-[210mm] relative p-[15mm]"
      style={{ fontFamily: font, lineHeight: "1.6" }}
    >
      {/* Header - Full Width */}
      <header
        className="border-b-[3px] border-slate-900 pb-8 mb-8"
        style={{ borderColor: themeColor }}
      >
        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
          {personalInfo.name || "YOUR NAME"}
        </h1>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xl font-bold tracking-wide text-slate-500 uppercase mb-4">
              {personalInfo.jobTitle || "PROFESSIONAL TITLE"}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-700">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {(personalInfo.city || personalInfo.country) && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  <span>
                    {[personalInfo.city, personalInfo.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Photo (Right aligned in header) */}
          {personalInfo.photo && (
            <div className="w-24 h-24 rounded-lg overflow-hidden grayscale contrast-125 border-2 border-slate-200 hidden sm:block">
              <img
                src={personalInfo.photo}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex gap-12">
        {/* Left Column (Main Content) - 65% */}
        <div className="flex-[2] flex flex-col gap-8">
          {/* Summary */}
          {(personalInfo.summary || resume.summary) && (
            <div className="mb-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span
                  className="w-4 h-1 bg-slate-900"
                  style={{ backgroundColor: themeColor }}
                ></span>
                Professional Profile
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                {personalInfo.summary || resume.summary}
              </p>
            </div>
          )}

          {/* Main Sections (Experience, Projects, etc) */}
          {sections
            .filter(
              (s) =>
                !sidebarSections.includes(s.section_type) &&
                s.section_type !== "personal_info",
            )
            .map((section) => (
              <div key={section.id}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span
                    className="w-4 h-1 bg-slate-900"
                    style={{ backgroundColor: themeColor }}
                  ></span>
                  {section.title}
                </h2>

                <div className="space-y-6">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">
                          {item.title || item.position || item.name}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                          {[
                            formatDate(item.startDate),
                            formatDate(item.endDate) || "Present",
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        </span>
                      </div>

                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: themeColor }}
                      >
                        {item.company || item.organization || item.subtitle}
                        {item.location && (
                          <span className="text-slate-400 font-normal ml-1">
                            | {item.location}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <div
                          className="text-sm text-slate-600 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Right Column (Sidebar Content) - 35% */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Sidebar Sections */}
          {sections
            .filter((s) => sidebarSections.includes(s.section_type))
            .map((section) => (
              <div key={section.id}>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-slate-100 pb-2">
                  {section.title}
                </h2>

                {section.section_type === "skills" && (
                  <div className="space-y-3">
                    {(Array.isArray(section.section_data)
                      ? section.section_data
                      : section.section_data?.items || []
                    ).map((skill: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-slate-700">
                            {typeof skill === "string"
                              ? skill
                              : skill.name || skill.text}
                          </span>
                        </div>
                        {/* Simple bar for visual flair */}
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full"
                            style={{
                              width: "85%",
                              backgroundColor: themeColor,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.section_type !== "skills" && (
                  <div className="space-y-4">
                    {(Array.isArray(section.section_data)
                      ? section.section_data
                      : section.section_data?.items || []
                    ).map((item: any, i: number) => (
                      <div key={i} className="text-sm">
                        <div className="font-bold text-slate-900">
                          {item.degree ||
                            item.name ||
                            item.language ||
                            item.institution}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {item.school || item.level || item.publisher}
                        </div>
                        {item.date ||
                          (item.endDate && (
                            <div className="text-slate-400 text-[10px] mt-0.5">
                              {item.date || item.endDate}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {/* Social Media Links if any */}
          {(personalInfo.linkedin || personalInfo.website) && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-slate-100 pb-2">
                Links
              </h2>
              <div className="space-y-2 text-sm">
                {personalInfo.linkedin && (
                  <a
                    href={personalInfo.linkedin}
                    className="flex items-center gap-2 hover:underline decoration-slate-400 underline-offset-2"
                  >
                    <LinkIcon
                      className="w-3.5 h-3.5"
                      style={{ color: themeColor }}
                    />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {personalInfo.website && (
                  <a
                    href={personalInfo.website}
                    className="flex items-center gap-2 hover:underline decoration-slate-400 underline-offset-2"
                  >
                    <GlobeAltIcon
                      className="w-3.5 h-3.5"
                      style={{ color: themeColor }}
                    />
                    <span className="truncate">Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
