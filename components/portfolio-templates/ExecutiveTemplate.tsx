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

const ExecutiveTemplate: React.FC<TemplateProps> = ({ sections, settings }) => {
  const visibleSections = sections.filter((s) => s.is_visible);
  const personalInfo =
    visibleSections.find((s) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div className="min-h-full bg-[#0f0f1a] font-serif text-[#e5e5e5]">
      {/* Header */}
      <header className="py-20 px-8 text-center border-b border-[#d4af37]/20">
        <div className="max-w-2xl mx-auto">
          {/* Gold accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-8" />

          <h1 className="text-4xl font-light tracking-wide text-white mb-2">
            {personalInfo.name || settings?.name || "Your Name"}
          </h1>
          <p className="text-[#d4af37] uppercase tracking-[0.2em] font-sans text-sm">
            {personalInfo.jobTitle ||
              settings?.jobTitle ||
              "Executive Professional"}
          </p>

          <div className="mt-6 flex justify-center gap-6 text-sm text-[#888]">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
          </div>

          {/* Gold accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-8" />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 py-16">
        {visibleSections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <div key={section.id} className="mb-16">
              {/* Section header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-sans">
                  {section.section_data?.title ||
                    getSectionLabel(section.section_type)}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-l from-[#d4af37]/50 to-transparent" />
              </div>

              {section.section_type === "summary" && (
                <p className="text-[#c5c5c5] leading-loose text-center italic">
                  "{section.section_data?.text || section.section_data?.summary}
                  "
                </p>
              )}

              {(section.section_type === "experience" ||
                section.section_type === "projects") && (
                <div className="space-y-10">
                  {(section.section_data?.items || []).map(
                    (item: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <h3 className="text-xl text-white font-light mb-1">
                          {item.title || item.position}
                        </h3>
                        <p className="text-[#d4af37] text-sm uppercase tracking-wide mb-1">
                          {item.company}
                        </p>
                        <p className="text-xs text-[#666] mb-3">
                          {item.startDate} — {item.endDate || "Present"}
                        </p>
                        {item.description && (
                          <p className="text-[#999] max-w-xl mx-auto">
                            {item.description}
                          </p>
                        )}
                        {/* Elegant image frames */}
                        {item.images?.length > 0 && (
                          <div className="flex justify-center gap-4 mt-4">
                            {item.images.map((img: string, i: number) => (
                              <div
                                key={i}
                                className="p-1 border border-[#d4af37]/30 rounded"
                              >
                                <img
                                  src={img}
                                  alt=""
                                  className="w-24 h-16 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {section.section_type === "skills" && (
                <div className="flex flex-wrap justify-center gap-4">
                  {(section.section_data?.items || []).map(
                    (item: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-5 py-2 border border-[#d4af37]/30 text-[#d4af37] text-sm uppercase tracking-wide rounded-sm"
                      >
                        {item.name || item}
                      </span>
                    )
                  )}
                </div>
              )}

              {(section.section_type === "education" ||
                section.section_type === "certifications") && (
                <div className="space-y-6 text-center">
                  {(section.section_data?.items || []).map(
                    (item: any, idx: number) => (
                      <div key={idx}>
                        <h3 className="text-lg text-white font-light">
                          {item.degree || item.name}
                        </h3>
                        <p className="text-[#d4af37] text-sm">
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

      {/* Footer */}
      <footer className="py-8 text-center border-t border-[#d4af37]/20">
        <div className="w-8 h-0.5 bg-[#d4af37] mx-auto" />
      </footer>
    </div>
  );
};

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    summary: "Profile",
    experience: "Career",
    education: "Education",
    skills: "Expertise",
    projects: "Portfolio",
    certifications: "Credentials",
  };
  return labels[type] || type;
}

export default ExecutiveTemplate;
