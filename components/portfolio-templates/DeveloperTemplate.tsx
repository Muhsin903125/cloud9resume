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

const DeveloperTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div className="min-h-full bg-[#0d1117] font-mono text-[#c9d1d9]">
      {/* Terminal header */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex items-center gap-2 sticky top-0 z-10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-sm text-[#8b949e] ml-3">~/portfolio — bash</span>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-12">
          <div className="text-[#8b949e] text-sm mb-2">$ whoami</div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {personalInfo.name || settings?.name || "Your Name"}
          </h1>
          <p className="text-[#58a6ff] text-lg">
            {personalInfo.jobTitle ||
              settings?.jobTitle ||
              "// Full Stack Developer"}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#8b949e]">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <span className="text-[#7ee787]">@</span> {personalInfo.email}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <span className="text-[#7ee787]">📍</span>{" "}
                {typeof personalInfo.location === "string"
                  ? personalInfo.location
                  : personalInfo.location?.city}
              </span>
            )}
          </div>
        </div>

        {/* Sections */}
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <div key={section.id} className="mb-10">
              {/* Section command */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#7ee787]">→</span>
                <span className="text-[#ff7b72]">cat</span>
                <span className="text-white">
                  {section.section_data?.title
                    ?.toLowerCase()
                    .replace(/\s+/g, "-") || section.section_type}
                  .md
                </span>
              </div>

              {/* Code block style container */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">
                    {section.section_data?.title ||
                      getSectionLabel(section.section_type)}
                  </span>
                  <span className="text-xs text-[#8b949e]">
                    {section.section_type === "skills"
                      ? `${section.section_data?.items?.length || 0} items`
                      : ""}
                  </span>
                </div>
                <div className="p-4">
                  {section.section_type === "summary" && (
                    <p className="text-[#c9d1d9] leading-relaxed">
                      <span className="text-[#8b949e]">// </span>
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
                            className="border-l-2 border-[#30363d] pl-4"
                          >
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-[#ff7b72]">const</span>
                              <span className="text-[#d2a8ff]">
                                {item.title || item.position}
                              </span>
                              <span className="text-[#8b949e]">=</span>
                              <span className="text-[#a5d6ff]">
                                "{item.company}"
                              </span>
                            </div>
                            <div className="text-xs text-[#8b949e] mt-1">
                              // {item.startDate} - {item.endDate || "Present"}
                            </div>
                            {item.description && (
                              <p className="text-[#8b949e] text-sm mt-2">
                                {item.description}
                              </p>
                            )}
                            {/* Screenshot showcase */}
                            {item.images?.length > 0 && (
                              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                {item.images.map((img: string, i: number) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt=""
                                    className="w-32 h-20 object-cover rounded border border-[#30363d]"
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
                            className="px-3 py-1 bg-[#21262d] text-[#58a6ff] text-sm rounded border border-[#30363d]"
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
                            <span className="text-[#7ee787]">"</span>
                            <span className="text-[#a5d6ff]">
                              {item.degree || item.name}
                            </span>
                            <span className="text-[#7ee787]">"</span>
                            <span className="text-[#8b949e]"> @ </span>
                            <span className="text-[#d2a8ff]">
                              {item.institution || item.school}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="text-[#8b949e] text-sm">
            <span className="text-[#7ee787]">→</span> Process completed with
            exit code 0
          </div>
        </div>
      </div>
    </div>
  );
};

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    summary: "README",
    experience: "Experience",
    education: "Education",
    skills: "Tech Stack",
    projects: "Projects",
    certifications: "Certifications",
  };
  return labels[type] || type;
}

export default DeveloperTemplate;
