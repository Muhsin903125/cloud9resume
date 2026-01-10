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

const GlassmorphismTemplate: React.FC<TemplateProps> = ({
  sections,
  settings,
}) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 font-sans text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 pt-16 pb-12 px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
            <span className="text-4xl font-bold text-violet-200">
              {(
                personalInfo.name?.[0] ||
                settings?.name?.[0] ||
                "?"
              ).toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-200 via-pink-200 to-violet-200 bg-clip-text text-transparent">
            {personalInfo.name || settings?.name || "Your Name"}
          </h1>
          <p className="text-lg text-violet-300 font-medium">
            {personalInfo.jobTitle ||
              settings?.jobTitle ||
              "Professional Title"}
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-violet-400">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-8 pb-16">
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <div key={section.id} className="mb-8">
              {/* Glass card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">
                  {section.section_data?.title ||
                    getSectionLabel(section.section_type)}
                </h2>

                {section.section_type === "summary" && (
                  <p className="text-violet-100 leading-relaxed">
                    {section.section_data?.text ||
                      section.section_data?.summary}
                  </p>
                )}

                {(section.section_type === "experience" ||
                  section.section_type === "projects") && (
                  <div className="space-y-4">
                    {(section.section_data?.items || []).map(
                      (item: any, idx: number) => (
                        <div
                          key={idx}
                          className="pb-4 border-b border-white/10 last:border-0 last:pb-0"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="font-semibold text-white">
                                {item.title || item.position}
                              </div>
                              <div className="text-violet-400 text-sm">
                                {item.company}
                              </div>
                            </div>
                            <div className="text-xs text-violet-500">
                              {item.startDate} - {item.endDate || "Present"}
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-violet-200/80 text-sm mt-2">
                              {item.description}
                            </p>
                          )}
                          {/* Image gallery for projects */}
                          {item.images?.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                              {item.images.map((img: string, i: number) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt=""
                                  className="w-20 h-14 object-cover rounded-lg border border-white/10"
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
                  <div className="flex flex-wrap gap-2">
                    {(section.section_data?.items || []).map(
                      (item: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-violet-500/20 text-violet-200 text-sm rounded-full border border-violet-400/30"
                        >
                          {item.name || item}
                        </span>
                      )
                    )}
                  </div>
                )}

                {(section.section_type === "education" ||
                  section.section_type === "certifications") && (
                  <div className="space-y-3">
                    {(section.section_data?.items || []).map(
                      (item: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-semibold text-white">
                            {item.degree || item.name}
                          </div>
                          <div className="text-violet-400 text-sm">
                            {item.institution || item.school}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    summary: "About Me",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
  };
  return labels[type] || type;
}

export default GlassmorphismTemplate;
