import React from "react";

interface Section {
  id: string;
  section_type: string;
  section_data: any;
  is_visible: boolean;
}

interface TemplateProps {
  sections: Section[];
  settings?: { name?: string; jobTitle?: string; email?: string };
}

const GradientTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div className="min-h-full bg-white font-sans">
      {/* Hero with gradient */}
      <header className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 py-20 px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            {personalInfo.name || settings?.name || "Your Name"}
          </h1>
          <p className="text-xl font-medium text-white/90">
            {personalInfo.jobTitle ||
              settings?.jobTitle ||
              "Professional Title"}
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-white/80">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.location && (
              <span>
                {typeof personalInfo.location === "string"
                  ? personalInfo.location
                  : personalInfo.location?.city}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section, sectionIdx) => (
            <div key={section.id} className="mb-16">
              {/* Section header with gradient accent */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {section.section_data?.title ||
                    getSectionLabel(section.section_type)}
                </h2>
              </div>

              {section.section_type === "summary" && (
                <p className="text-gray-600 text-lg leading-relaxed pl-6">
                  {section.section_data?.text || section.section_data?.summary}
                </p>
              )}

              {(section.section_type === "experience" ||
                section.section_type === "projects") && (
                <div className="space-y-8 pl-6">
                  {(section.section_data?.items || []).map(
                    (item: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {item.title || item.position}
                            </h3>
                            <p className="text-violet-600 font-medium">
                              {item.company}
                            </p>
                          </div>
                          <span className="text-sm text-gray-400 whitespace-nowrap">
                            {item.startDate} - {item.endDate || "Present"}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mt-2">
                            {item.description}
                          </p>
                        )}
                        {/* Full-width project images */}
                        {item.images?.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {item.images.map((img: string, i: number) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-full h-32 object-cover rounded-xl shadow-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {section.section_type === "skills" && (
                <div className="flex flex-wrap gap-3 pl-6">
                  {(section.section_data?.items || []).map(
                    (item: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 font-medium rounded-xl"
                      >
                        {item.name || item}
                      </span>
                    )
                  )}
                </div>
              )}

              {(section.section_type === "education" ||
                section.section_type === "certifications") && (
                <div className="space-y-4 pl-6">
                  {(section.section_data?.items || []).map(
                    (item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl"
                      >
                        <h3 className="font-bold text-gray-900">
                          {item.degree || item.name}
                        </h3>
                        <p className="text-violet-600">
                          {item.institution || item.school}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    summary: "About",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
  };
  return labels[type] || type;
}

export default GradientTemplate;
