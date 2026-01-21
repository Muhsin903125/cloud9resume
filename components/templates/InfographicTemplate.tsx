import React from "react";
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LinkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

interface Section {
  id: string;
  title: string;
  section_type: string;
  section_data: any;
}

interface InfographicTemplateProps {
  resume: any;
  sections: Section[];
}

export const InfographicTemplate: React.FC<InfographicTemplateProps> = ({
  resume,
  sections,
}) => {
  const { personal_info, settings } = resume;
  const personalInfo = personal_info || {};
  const themeColor = settings?.theme_color || "#10b981"; // Emerald default
  const font = settings?.font || "inter";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Timeline item component
  const TimelineItem = ({ item }: { item: any }) => (
    <div className="relative pl-8 pb-8 border-l-2 border-dashed border-gray-200 last:pb-0">
      <div
        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: themeColor }}
      ></div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
        <h3 className="font-bold text-gray-900 text-lg">
          {item.title || item.position || item.degree}
        </h3>
        <span className="text-xs font-bold px-2 py-1.5 rounded-full bg-gray-50 text-gray-500 whitespace-nowrap">
          {[formatDate(item.startDate), formatDate(item.endDate) || "Present"]
            .filter(Boolean)
            .join(" - ")}
        </span>
      </div>
      <div className="text-sm font-semibold mb-2" style={{ color: themeColor }}>
        {item.company || item.school}
      </div>
      {item.description && (
        <div
          className="text-sm text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
      )}
    </div>
  );

  return (
    <div
      className="bg-slate-50 min-h-[297mm] w-[210mm] relative flex flex-col items-center p-[15mm]"
      style={{ fontFamily: font, lineHeight: "1.6" }}
    >
      {/* Header Block */}
      <header className="w-full text-center relative z-10 mb-12">
        <div
          className="w-32 h-1 mx-auto mb-8 rounded-full"
          style={{ backgroundColor: themeColor }}
        ></div>

        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="text-xl font-medium text-gray-500 uppercase tracking-widest mb-6">
          {personalInfo.jobTitle || "Job Title"}
        </p>

        {/* Contact Grid */}
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-600 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-flex mx-auto">
          {personalInfo.email && (
            <div className="flex items-center gap-2 px-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2 px-2 border-l border-gray-100">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {(personalInfo.city || personalInfo.country) && (
            <div className="flex items-center gap-2 px-2 border-l border-gray-100">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span>
                {[personalInfo.city, personalInfo.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="w-full grid grid-cols-12 gap-8">
        {/* Left Column - 7 Cols */}
        <div className="col-span-8 flex flex-col gap-10">
          {/* Summary */}
          {(personalInfo.summary || resume.summary) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5" style={{ color: themeColor }} />
                About Me
              </h2>
              <p className="text-gray-600 leading-relaxed text-justify">
                {personalInfo.summary || resume.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {sections
            .filter((s) => s.section_type === "experience")
            .map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                  <BriefcaseIcon
                    className="w-5 h-5"
                    style={{ color: themeColor }}
                  />
                  Experience
                </h2>
                <div className="mt-2">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, i: number) => (
                    <TimelineItem key={i} item={item} />
                  ))}
                </div>
              </div>
            ))}

          {/* Projects & Others */}
          {sections
            .filter(
              (s) =>
                ![
                  "personal_info",
                  "experience",
                  "education",
                  "skills",
                  "languages",
                  "hobbies",
                ].includes(s.section_type),
            )
            .map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide mb-4">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, i: number) => (
                    <div key={i}>
                      <h3 className="font-bold text-gray-900">
                        {item.title || item.name}
                      </h3>
                      {item.description && (
                        <div
                          className="text-sm text-gray-600 mt-1"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Right Column - 4 Cols */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Skills */}
          {sections
            .filter((s) => s.section_type === "skills")
            .map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((skill: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-opacity-10 text-gray-700"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                      }} // 20 hex = ~12% opacity
                    >
                      {typeof skill === "string"
                        ? skill
                        : skill.name || skill.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}

          {/* Education */}
          {sections
            .filter((s) => s.section_type === "education")
            .map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <AcademicCapIcon
                    className="w-5 h-5"
                    style={{ color: themeColor }}
                  />
                  Education
                </h2>
                <div className="space-y-5">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, i: number) => (
                    <div
                      key={i}
                      className="pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div className="font-bold text-gray-900 text-sm leading-tight mb-1">
                        {item.degree || item.school}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {item.institution || item.school}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {[formatDate(item.startDate), formatDate(item.endDate)]
                          .filter(Boolean)
                          .join(" - ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Links */}
          {(personalInfo.linkedin || personalInfo.website) && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-sm text-white">
              <h2 className="text-sm font-black uppercase tracking-wide mb-4 opacity-50">
                Connect
              </h2>
              <div className="space-y-4 text-sm">
                {personalInfo.linkedin && (
                  <a
                    href={personalInfo.linkedin}
                    className="flex items-center gap-3 hover:text-white/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="truncate flex-1">LinkedIn</span>
                  </a>
                )}
                {personalInfo.website && (
                  <a
                    href={personalInfo.website}
                    className="flex items-center gap-3 hover:text-white/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <GlobeAltIcon className="w-4 h-4" />
                    </div>
                    <span className="truncate flex-1">Portfolio</span>
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
