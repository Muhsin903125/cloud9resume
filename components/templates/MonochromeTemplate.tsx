import React from "react";

interface Section {
  id: string;
  title: string;
  section_type: string;
  section_data: any;
}

interface MonochromeTemplateProps {
  resume: any;
  sections: Section[];
}

export const MonochromeTemplate: React.FC<MonochromeTemplateProps> = ({
  resume,
  sections,
}) => {
  const { personal_info, settings } = resume;
  const personalInfo = personal_info || {};
  const font = settings?.font || "serif"; // Serif default for this classic feel

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <div
      className="bg-white min-h-[297mm] w-[210mm] relative p-[20mm] text-black"
      style={{ fontFamily: font, lineHeight: "1.5" }}
    >
      {/* Header - Centered, Classic Typography */}
      <header className="text-center mb-12 border-b-4 border-black pb-8">
        <h1 className="text-6xl font-serif text-black tracking-tight mb-4 lowercase">
          {personalInfo.name || "your name"}
        </h1>
        <p className="text-lg font-mono uppercase tracking-widest text-gray-600 mb-6">
          {personalInfo.jobTitle || "Job Title"}
        </p>

        <div className="flex justify-center flex-wrap gap-6 text-sm font-mono text-gray-800">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.country) && (
            <span>
              {[personalInfo.city, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
      </header>

      {/* Main Content - Single Column, High Readability */}
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Summary */}
        {(personalInfo.summary || resume.summary) && (
          <section>
            <p className="text-lg leading-relaxed font-serif text-gray-800 text-justify first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:font-black">
              {personalInfo.summary || resume.summary}
            </p>
          </section>
        )}

        {/* Dynamic Sections */}
        {sections
          .filter((s) => s.section_type !== "personal_info")
          .map((section) => (
            <section key={section.id}>
              <h2 className="text-xl font-mono uppercase tracking-widest border-b border-black pb-2 mb-6 flex justify-between items-end">
                {section.title}
                <span className="text-xs normal-case text-gray-400 tracking-normal">
                  0{sections.indexOf(section) + 1}
                </span>
              </h2>

              {/* Skills Display */}
              {section.section_type === "skills" && (
                <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((skill: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-black rotate-45"></div>
                      <span>
                        {typeof skill === "string"
                          ? skill
                          : skill.name || skill.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard List Items */}
              {section.section_type !== "skills" && (
                <div className="space-y-8">
                  {(Array.isArray(section.section_data)
                    ? section.section_data
                    : section.section_data?.items || []
                  ).map((item: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 gap-6">
                      {/* Left: Date/Meta */}
                      <div className="col-span-3 text-right">
                        <div className="text-sm font-mono font-bold text-gray-900">
                          {[
                            formatDate(item.startDate),
                            formatDate(item.endDate) || "Present",
                          ]
                            .filter(Boolean)
                            .join(" — ")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-serif italic">
                          {item.location}
                        </div>
                      </div>

                      {/* Right: Content */}
                      <div className="col-span-9 border-l border-gray-200 pl-6">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-xl font-serif font-bold text-black">
                            {item.title || item.degree || item.position}
                          </h3>
                        </div>
                        <div className="text-sm font-mono uppercase tracking-wide text-gray-500 mb-3">
                          {item.company || item.school || item.institution}
                        </div>

                        {item.description && (
                          <div
                            className="text-gray-700 leading-relaxed font-serif"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
      </div>
    </div>
  );
};
