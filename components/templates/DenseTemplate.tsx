import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from "../Icons";

export const DenseTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
  settings,
}: any) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0),
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  const sidebarSections = sections.filter((s: any) =>
    [
      "skills",
      "languages",
      "certifications",
      "achievements",
      "education",
    ].includes(s.section_type),
  );

  const mainSections = sortedSections.filter((s: any) =>
    ["summary", "experience", "projects"].includes(s.section_type),
  );

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[8mm]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#0f172a",
        fontSize: "9pt",
        lineHeight: "1.35",
        fontFamily: font || "inherit",
      }}
    >
      {/* Header - Very Compact */}
      <header className="border-b border-gray-300 pb-4 mb-4 flex gap-5 items-center">
        {personalInfo.photoUrl && personalInfo.showPhoto !== false && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.name}
            className="w-20 h-20 rounded object-cover border border-gray-200"
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-baseline">
            <h1
              className="text-2xl font-bold uppercase tracking-tight leading-none"
              style={{ color: themeColor }}
            >
              {personalInfo.name || "Your Name"}
            </h1>
            <p className="font-bold text-sm uppercase tracking-wide text-gray-500">
              {personalInfo.jobTitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-[8.5pt] text-gray-600 font-medium">
            {[
              { icon: MailIcon, val: personalInfo.email },
              { icon: PhoneIcon, val: personalInfo.phone },
              {
                icon: MapPinIcon,
                val: [personalInfo.city, personalInfo.country]
                  .filter(Boolean)
                  .join(", "),
              },
              {
                icon: GlobeIcon,
                val: personalInfo.website || personalInfo.portfolio,
              },
            ].map(
              (item, i) =>
                item.val && (
                  <div key={i} className="flex items-center gap-1.5">
                    <item.icon size={11} />
                    <span>{item.val}</span>
                  </div>
                ),
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[9px] bg-[#0077b5] text-white w-3.5 h-3.5 flex items-center justify-center rounded-[2px]">
                  in
                </span>
                <a
                  href={personalInfo.linkedin}
                  className="hover:underline text-[#0077b5]"
                >
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Left Column (Main Content) - 70% */}
        <div className="w-[70%] space-y-4">
          {mainSections.map((section: any) => {
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            return (
              <div key={section.id} className="break-inside-avoid">
                <h3
                  className="font-bold uppercase text-[10pt] border-b border-gray-200 mb-2.5 pb-0.5 flex items-center gap-2"
                  style={{ color: themeColor }}
                >
                  {section_type.replace("_", " ")}
                </h3>

                {["summary", "declaration"].includes(section_type) ? (
                  <p className="text-justify leading-relaxed">
                    {section_data.text || section_data}
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-[9.5pt] text-gray-900">
                            {item.position || item.title}
                          </h4>
                          <span className="text-[8.5pt] font-semibold text-gray-500 whitespace-nowrap ml-2">
                            {item.startDate} – {item.endDate || item.date}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-gray-700 italic text-[9pt]">
                            {item.company || item.issuer}
                          </span>
                          {item.location && (
                            <span className="text-[8pt] text-gray-400">
                              {item.location}
                            </span>
                          )}
                        </div>
                        <p className="text-justify text-gray-700 text-[9pt] leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column (Sidebar Content) - 30% */}
        <div className="w-[30%] space-y-5 pt-1">
          {sidebarSections.map((section: any) => {
            const { section_type, section_data } = section;
            if (
              !section_data ||
              (Array.isArray(section_data) && section_data.length === 0)
            )
              return null;

            return (
              <div key={section.id} className="break-inside-avoid">
                <h3
                  className="font-bold uppercase text-[9pt] border-b border-gray-200 mb-2.5 pb-0.5"
                  style={{ color: themeColor }}
                >
                  {section_type.replace("_", " ")}
                </h3>

                {section_type === "skills" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-[2px] text-[8.5pt] font-medium text-gray-700"
                      >
                        {typeof s === "string" ? s : s.name || ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(Array.isArray(section_data)
                      ? section_data
                      : section_data?.items || []
                    ).map((item: any, idx: number) => (
                      <div key={idx}>
                        <div className="font-bold text-[9pt] leading-tight text-gray-800">
                          {section_type === "languages"
                            ? item.language || ""
                            : item.school || item.degree || ""}
                        </div>
                        <div className="text-[8.5pt] text-gray-600 leading-tight mt-0.5">
                          {section_type === "languages"
                            ? item.proficiency
                            : item.degree || item.school}
                        </div>
                        {section_type !== "languages" && (
                          <div className="text-[8pt] text-gray-400 mt-0.5 italic">
                            {item.date || item.year}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
