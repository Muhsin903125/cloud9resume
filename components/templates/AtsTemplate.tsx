import React from "react";

interface AtsTemplateProps {
  resume: any;
  sections: any[];
  themeColor?: string;
  font?: string;
  hexToRgba?: (hex: string, alpha: number) => string;
}

export const AtsTemplate: React.FC<AtsTemplateProps> = ({
  resume,
  sections,
  font = "'Inter', sans-serif",
}) => {
  const { personalInfo } = resume;

  return (
    <div
      className="bg-white text-black p-8 max-w-[210mm] mx-auto"
      style={{
        fontFamily: font,
        lineHeight: "1.5",
        color: "#000000",
      }}
    >
      {/* Header / Personal Info */}
      <header className="border-b-2 border-black pb-4 mb-6 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
          {personalInfo?.fullName || resume.title || "Your Name"}
        </h1>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo?.address && <span>| {personalInfo.address}</span>}
          {personalInfo?.website && <span>| {personalInfo.website}</span>}
          {personalInfo?.linkedin && <span>| {personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section: any) => {
          if (!section.section_data) return null;

          return (
            <section key={section.id}>
              <h2
                className="text-lg font-bold uppercase border-b border-black mb-3 pb-1"
                style={{ letterSpacing: "0.05em" }}
              >
                {section.title || section.section_type}
              </h2>

              {/* Summary / Text Sections */}
              {section.section_type === "summary" && (
                <p className="whitespace-pre-wrap text-sm">
                  {section.section_data.text}
                </p>
              )}

              {/* Experience / Education (Standard List) */}
              {(section.section_type === "experience" ||
                section.section_type === "education") && (
                <div className="space-y-4">
                  {Array.isArray(section.section_data) &&
                    section.section_data.map((item: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between items-baseline font-bold text-base">
                          <h3>{item.title || item.degree || item.position}</h3>
                          <span className="text-sm font-normal">
                            {item.startDate}{" "}
                            {item.endDate ? `- ${item.endDate}` : ""}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm italic mb-2">
                          <span>
                            {item.company || item.school || item.institution}
                          </span>
                          <span>{item.location}</span>
                        </div>

                        {item.description && (
                          <div
                            className="text-sm prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}

                        {/* Handle bullet points if description is plain text but user wants bullets */}
                        {item.points && Array.isArray(item.points) && (
                          <ul className="list-disc ml-5 text-sm mt-1 space-y-0.5">
                            {item.points.map((pt: string, i: number) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Skills (Comma separated or grid) */}
              {section.section_type === "skills" && (
                <div className="text-sm">
                  {/* If categories exist */}
                  {section.section_data &&
                    typeof section.section_data === "object" &&
                    !Array.isArray(section.section_data) &&
                    Object.keys(section.section_data).map((category, idx) => {
                      // Skip simple array handling if it's an object with categories
                      if (
                        category === "items" &&
                        Array.isArray(section.section_data.items)
                      )
                        return null;

                      const skills = section.section_data[category];
                      if (!Array.isArray(skills)) return null;

                      return (
                        <div key={idx} className="mb-2">
                          <span className="font-bold">{category}: </span>
                          <span>{skills.join(", ")}</span>
                        </div>
                      );
                    })}

                  {/* Flat list fallback */}
                  {Array.isArray(section.section_data.items) && (
                    <p>{section.section_data.items.join(", ")}</p>
                  )}
                </div>
              )}

              {/* Languages */}
              {section.section_type === "languages" && (
                <div className="text-sm">
                  {Array.isArray(section.section_data) && (
                    <p>
                      {section.section_data
                        .map((item: any) =>
                          typeof item === "string"
                            ? item
                            : `${item.language}${
                                item.proficiency ? ` (${item.proficiency})` : ""
                              }`
                        )
                        .join(", ")}
                    </p>
                  )}
                  {section.section_data?.items &&
                    Array.isArray(section.section_data.items) && (
                      <p>
                        {section.section_data.items
                          .map((item: any) =>
                            typeof item === "string"
                              ? item
                              : `${item.language}${
                                  item.proficiency
                                    ? ` (${item.proficiency})`
                                    : ""
                                }`
                          )
                          .join(", ")}
                      </p>
                    )}
                </div>
              )}

              {/* Projects */}
              {section.section_type === "projects" && (
                <div className="space-y-4">
                  {Array.isArray(section.section_data) &&
                    section.section_data.map((item: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between items-baseline font-bold text-base">
                          <h3>{item.title}</h3>
                          <span className="text-sm font-normal">
                            {item.startDate}{" "}
                            {item.endDate ? `- ${item.endDate}` : ""}
                          </span>
                        </div>

                        <div className="text-sm italic mb-1">
                          <a
                            href={item.link}
                            className="text-blue-800 underline"
                          >
                            {item.link}
                          </a>
                        </div>

                        <div className="text-sm">{item.description}</div>
                        {item.points && Array.isArray(item.points) && (
                          <ul className="list-disc ml-5 text-sm mt-1 space-y-0.5">
                            {item.points.map((pt: string, i: number) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
