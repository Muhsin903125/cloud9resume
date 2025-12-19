import React from "react";
import { MailIcon, PhoneIcon, MapPinIcon } from "../Icons";

export const GridTemplate = ({
  resume,
  sections,
  themeColor,
  hexToRgba,
  font,
}: any) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );
  const personalInfo =
    sections.find((s: any) => s.section_type === "personal_info")
      ?.section_data || {};

  return (
    <div
      id="resume-preview-content"
      className="bg-slate-100 w-full min-h-[1000px] shadow-sm print:shadow-none mx-auto p-[10mm] text-xs"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#334155",
        fontFamily: font || "inherit",
      }}
    >
      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {personalInfo.name || "Your Name"}
          </h1>
          <p
            className="font-bold text-sm uppercase tracking-wide"
            style={{ color: themeColor }}
          >
            {personalInfo.jobTitle}
          </p>
        </div>
        <div className="text-right space-y-1">
          {[
            { icon: MailIcon, val: personalInfo.email },
            { icon: PhoneIcon, val: personalInfo.phone },
            { icon: MapPinIcon, val: personalInfo.city },
          ].map(
            (item, i) =>
              item.val && (
                <div
                  key={i}
                  className="flex items-center justify-end gap-2 text-slate-500"
                >
                  <span>{item.val}</span>
                  <item.icon size={12} />
                </div>
              )
          )}
        </div>
      </div>

      {/* Masonry-ish Grid */}
      <div className="columns-2 gap-4 space-y-4">
        {sortedSections.map((section: any) => {
          if (section.section_type === "personal_info") return null;
          const { section_type, section_data } = section;
          if (
            !section_data ||
            (Array.isArray(section_data) && section_data.length === 0)
          )
            return null;

          return (
            <div
              key={section.id}
              className="break-inside-avoid bg-white p-5 rounded-lg shadow-sm border border-slate-200"
            >
              <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2 text-slate-800">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: themeColor }}
                ></div>
                {section_type.replace("_", " ")}
              </h3>

              {section_type === "summary" && (
                <p className="leading-relaxed text-slate-600">
                  {section_data.text || section_data}
                </p>
              )}

              {(section_type === "skills" || section_type === "languages") && (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100 text-[10px] font-bold uppercase"
                    >
                      {typeof s === "string"
                        ? s
                        : section_type === "languages"
                        ? `${s.language}${
                            s.proficiency ? ` (${s.proficiency})` : ""
                          }`
                        : s.name || s.language}
                    </span>
                  ))}
                </div>
              )}

              {!["summary", "skills", "languages"].includes(section_type) && (
                <div className="space-y-4">
                  {(Array.isArray(section_data)
                    ? section_data
                    : section_data?.items || []
                  ).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative pl-3 border-l-2 border-slate-100"
                    >
                      <div className="font-bold text-slate-900">
                        {item.position || item.title || item.school}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">
                        {item.company || item.issuer || item.degree} •{" "}
                        {item.startDate}
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-500">
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
    </div>
  );
};
