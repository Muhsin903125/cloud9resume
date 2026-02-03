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

interface AccentSidebarTemplateProps {
  resume: any;
  sections: Section[];
  isPdf?: boolean;
}

export const AccentSidebarTemplate: React.FC<AccentSidebarTemplateProps> = ({
  resume,
  sections,
}) => {
  const { personal_info, settings } = resume;
  const personalInfo = personal_info || {};
  const themeColor = settings?.theme_color || "#2563eb";
  const font = settings?.font || "inter";

  // Helper to get formatted date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Sections that go in the sidebar
  const sidebarSections = ["skills", "languages", "hobbies", "social_media"];

  return (
    <div
      className="bg-white min-h-[297mm] w-[210mm] relative flex"
      style={{ fontFamily: font, lineHeight: "1.5" }}
    >
      {/* Sidebar background accent */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[70mm] h-full opacity-10"
        style={{ backgroundColor: themeColor }}
      ></div>

      {/* Sidebar Content */}
      <div className="w-[70mm] p-8 shrink-0 relative z-10 flex flex-col gap-8 border-r border-gray-100">
        {/* Photo */}
        {personalInfo.photo && (
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={personalInfo.photo}
              alt={personalInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-4 text-sm text-slate-700">
          {personalInfo.email && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <EnvelopeIcon className="w-4 h-4" />
              </div>
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <PhoneIcon className="w-4 h-4" />
              </div>
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {(personalInfo.city || personalInfo.country) && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <MapPinIcon className="w-4 h-4" />
              </div>
              <span>
                {[personalInfo.city, personalInfo.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <GlobeAltIcon className="w-4 h-4" />
              </div>
              <span className="break-all">{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <LinkIcon className="w-4 h-4" />
              </div>
              <span className="break-all">LinkedIn</span>
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        {sections
          .filter((s) => sidebarSections.includes(s.section_type))
          .map((section) => (
            <div key={section.id}>
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b-2"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h3>

              {section.section_type === "skills" && (
                <div className="flex flex-wrap gap-2">
                  {/* Handle both string[] and object[] for skills */}
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((skill: any, i: number) => (
                    <span
                      key={i}
                      className="bg-white px-3 py-1 rounded-md text-sm font-medium shadow-sm border border-slate-100"
                    >
                      {typeof skill === "string"
                        ? skill
                        : skill.name || skill.text || ""}
                    </span>
                  ))}
                </div>
              )}

              {section.section_type !== "skills" && (
                <div className="space-y-2 text-sm">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, i: number) => (
                    <div key={i} className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {item.name || item.language || item || ""}
                      </span>
                      {item.level && (
                        <span className="text-slate-500 text-xs">
                          {item.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 pt-12 flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">
            {personalInfo.name || "Your Name"}
          </h1>
          <p
            className="text-xl font-medium tracking-wide opacity-90"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle || "Professional Title"}
          </p>
        </div>

        {/* Summary */}
        {(personalInfo.summary || resume.summary) && (
          <div>
            <p className="text-slate-600 leading-relaxed text-sm text-justify">
              {personalInfo.summary || resume.summary}
            </p>
          </div>
        )}

        {/* Main Sections */}
        {sections
          .filter(
            (s) =>
              !sidebarSections.includes(s.section_type) &&
              s.section_type !== "personal_info",
          )
          .map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: themeColor }}
                ></div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">
                  {section.title}
                </h2>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div className="space-y-6">
                {(Array.isArray(section.section_data)
                  ? section.section_data
                  : section.section_data?.items || []
                ).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="relative pl-6 border-l-2 border-slate-100"
                  >
                    <div
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border-2 border-white"
                      style={{ backgroundColor: themeColor }}
                    ></div>

                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900">
                        {item.title ||
                          item.degree ||
                          item.school ||
                          item.company}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                        {[
                          formatDate(item.startDate),
                          formatDate(item.endDate) || "Present",
                        ]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </div>

                    {(item.subtitle || item.description) && (
                      <div className="text-sm text-slate-600 mb-2 font-medium">
                        {item.subtitle}
                      </div>
                    )}

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
    </div>
  );
};
