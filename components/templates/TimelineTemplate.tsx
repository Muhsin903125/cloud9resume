import React from "react";
import { UserIcon } from "../Icons";

export const TimelineTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
}: any) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0),
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto flex"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#475569",
        fontFamily: font || "inherit",
      }}
    >
      {/* Narrow Sidebar for Dates/Icons - 20% */}
      <div className="w-[20%] border-r border-gray-200 relative">
        <div className="absolute top-0 right-0 w-full h-[200px] bg-gradient-to-b from-gray-50 to-transparent -z-10"></div>
      </div>

      {/* Main Content - 80% */}
      <div className="w-[80%] p-10">
        {/* Header */}
        <div className="mb-10 relative">
          {personalInfo.photoUrl && personalInfo.showPhoto !== false && (
            <div className="absolute -left-[53px] top-1 w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md z-10 overflow-hidden border-2 border-white">
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {personalInfo.name || "Your Name"}
          </h1>
          <p
            className="text-sm font-medium uppercase tracking-widest mb-4"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
            {[
              personalInfo.email,
              personalInfo.phone,
              personalInfo.city,
              personalInfo.linkedin,
            ]
              .filter(Boolean)
              .map((v, i) => (
                <span key={i}>{v}</span>
              ))}
          </div>
        </div>

        <div className="space-y-10">
          {sortedSections.map((section: any) => {
            if (section.section_type === "personal_info") return null;
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            return (
              <div key={section.id} className="relative">
                <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-4 text-gray-400">
                  {section_type.replace("_", " ")}
                  <div className="h-px bg-gray-200 flex-1"></div>
                </h3>

                {section_type === "summary" && (
                  <div className="relative">
                    <div className="absolute -left-[59px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 bg-gray-400"></div>
                    <p className="text-sm leading-7 text-gray-700">
                      {section_data.text || section_data}
                    </p>
                  </div>
                )}

                {(section_type === "skills" ||
                  section_type === "languages") && (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600"
                      >
                        {typeof s === "string"
                          ? s
                          : section_type === "languages"
                            ? `${s.language || ""}${
                                s.proficiency ? ` (${s.proficiency})` : ""
                              }`
                            : s.name || s.language || ""}
                      </span>
                    ))}
                  </div>
                )}

                {!["summary", "skills", "languages"].includes(section_type) && (
                  <div className="space-y-8">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <div key={idx} className="relative">
                        {/* Timeline Dot */}
                        <div
                          className="absolute -left-[59px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: themeColor }}
                        ></div>

                        <h4 className="font-bold text-gray-900 text-base">
                          {item.position || item.title || item.school || ""}
                        </h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            {item.company || item.issuer || item.degree}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100">
                            {item.startDate} – {item.endDate || "Present"}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Explicit Declaration at Bottom */}
          {sections.find((s: any) => s.section_type === "declaration") &&
            sections.find((s: any) => s.section_type === "declaration")
              .section_data?.text && (
              <div className="relative">
                <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-4 text-gray-400">
                  Declaration
                  <div className="h-px bg-gray-200 flex-1"></div>
                </h3>
                <div className="relative">
                  <div className="absolute -left-[59px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 bg-gray-400"></div>
                  <p className="text-sm leading-7 text-gray-700">
                    {
                      sections.find(
                        (s: any) => s.section_type === "declaration",
                      ).section_data.text
                    }
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
