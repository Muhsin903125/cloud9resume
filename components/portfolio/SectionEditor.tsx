import React, { useState } from "react";

interface SectionEditorProps {
  section: {
    id: string;
    section_type: string;
    section_data: any;
    order_index: number;
    is_visible: boolean;
  };
  onUpdate: (id: string, updates: Partial<any>) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

const SECTION_ICONS: Record<string, string> = {
  personal_info: "👤",
  summary: "📝",
  description: "📝",
  experience: "💼",
  education: "🎓",
  skills: "⚡",
  projects: "🚀",
  certifications: "🏆",
  languages: "🌐",
  custom: "✏️",
};

const SECTION_LABELS: Record<string, string> = {
  personal_info: "Personal Information",
  summary: "About / Summary",
  description: "Description",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  custom: "Custom Section",
};

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdate,
  onDelete,
  onToggleVisibility,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editData, setEditData] = useState(section.section_data || {});
  const isCustom =
    section.section_type === "custom" || !SECTION_LABELS[section.section_type];

  const updateData = (newData: any) => {
    setEditData(newData);
    onUpdate(section.id, { section_data: newData });
  };

  const handleFieldChange = (field: string, value: any) => {
    updateData({ ...editData, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...(editData.items || [])];
    items[index] = { ...items[index], [field]: value };
    updateData({ ...editData, items });
  };

  const addItem = (defaultItem?: any) => {
    const items = [
      ...(editData.items || []),
      defaultItem || getEmptyItem(section.section_type),
    ];
    updateData({ ...editData, items });
  };

  const removeItem = (index: number) => {
    const items = (editData.items || []).filter(
      (_: any, i: number) => i !== index,
    );
    updateData({ ...editData, items });
  };

  const getEmptyItem = (type: string) => {
    switch (type) {
      case "experience":
        return { company: "", title: "", startDate: "", endDate: "", description: "" };
      case "education":
        return { institution: "", degree: "", field: "", startDate: "", endDate: "" };
      case "projects":
        return { name: "", description: "", technologies: "", link: "" };
      case "certifications":
        return { name: "", issuer: "", date: "" };
      case "skills":
        return { name: "" };
      case "languages":
        return { language: "", proficiency: "" };
      default:
        return {};
    }
  };

  // --- Field helper component ---
  const Field = ({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    rows,
  }: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (val: string) => void;
    type?: string;
    rows?: number;
  }) =>
    rows ? (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          {label}
        </label>
        <textarea
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all resize-none bg-white"
        />
      </div>
    ) : (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          {label}
        </label>
        <input
          type={type}
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all bg-white"
        />
      </div>
    );

  // --- Section Renderers ---

  const renderPersonalInfo = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Full Name"
          value={editData.name || ""}
          onChange={(v) => handleFieldChange("name", v)}
        />
        <Field
          label="Job Title"
          value={editData.jobTitle || ""}
          onChange={(v) => handleFieldChange("jobTitle", v)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Email"
          type="email"
          value={editData.email || ""}
          onChange={(v) => handleFieldChange("email", v)}
        />
        <Field
          label="Phone"
          type="tel"
          value={editData.phone || ""}
          onChange={(v) => handleFieldChange("phone", v)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Location"
          placeholder="City, Country"
          value={editData.location?.city || editData.location || ""}
          onChange={(v) => handleFieldChange("location", v)}
        />
        <Field
          label="Website / Portfolio"
          placeholder="https://..."
          value={editData.website || editData.portfolio || ""}
          onChange={(v) => handleFieldChange("website", v)}
        />
      </div>
      <Field
        label="LinkedIn"
        placeholder="https://linkedin.com/in/..."
        value={editData.linkedin || ""}
        onChange={(v) => handleFieldChange("linkedin", v)}
      />
    </div>
  );

  const renderSummary = () => (
    <Field
      label="About You"
      placeholder="Write a brief professional summary..."
      value={editData.text || editData.summary || ""}
      onChange={(v) => handleFieldChange("text", v)}
      rows={5}
    />
  );

  const renderExperience = () => (
    <div className="space-y-3">
      {(editData.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              #{idx + 1}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Company"
              value={item.company || ""}
              onChange={(v) => handleItemChange(idx, "company", v)}
            />
            <Field
              label="Position / Title"
              value={item.title || item.position || ""}
              onChange={(v) => handleItemChange(idx, "title", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start Date"
              placeholder="Jan 2022"
              value={item.startDate || ""}
              onChange={(v) => handleItemChange(idx, "startDate", v)}
            />
            <Field
              label="End Date"
              placeholder="Present"
              value={item.endDate || ""}
              onChange={(v) => handleItemChange(idx, "endDate", v)}
            />
          </div>
          <Field
            label="Location"
            placeholder="City, Country"
            value={item.location || ""}
            onChange={(v) => handleItemChange(idx, "location", v)}
          />
          <Field
            label="Description"
            placeholder="Describe your responsibilities and achievements..."
            value={item.description || ""}
            onChange={(v) => handleItemChange(idx, "description", v)}
            rows={3}
          />
        </div>
      ))}
      <button
        onClick={() => addItem()}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium"
      >
        + Add Experience
      </button>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-3">
      {(editData.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Project #{idx + 1}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Remove
            </button>
          </div>
          <Field
            label="Project Name"
            value={item.name || item.title || ""}
            onChange={(v) => handleItemChange(idx, "name", v)}
          />
          <Field
            label="Description"
            placeholder="What does this project do?"
            value={item.description || ""}
            onChange={(v) => handleItemChange(idx, "description", v)}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Technologies"
              placeholder="React, Node.js, etc."
              value={
                Array.isArray(item.technologies)
                  ? item.technologies.join(", ")
                  : item.technologies || ""
              }
              onChange={(v) => handleItemChange(idx, "technologies", v)}
            />
            <Field
              label="Link"
              placeholder="https://..."
              value={item.link || item.url || ""}
              onChange={(v) => handleItemChange(idx, "link", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => addItem()}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium"
      >
        + Add Project
      </button>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-3">
      {(editData.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              #{idx + 1}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Remove
            </button>
          </div>
          <Field
            label="Institution"
            value={item.institution || item.school || ""}
            onChange={(v) => handleItemChange(idx, "institution", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Degree"
              value={item.degree || ""}
              onChange={(v) => handleItemChange(idx, "degree", v)}
            />
            <Field
              label="Field of Study"
              value={item.field || ""}
              onChange={(v) => handleItemChange(idx, "field", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start Date"
              value={item.startDate || ""}
              onChange={(v) => handleItemChange(idx, "startDate", v)}
            />
            <Field
              label="End Date"
              value={item.endDate || item.graduationDate || ""}
              onChange={(v) => handleItemChange(idx, "endDate", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => addItem()}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium"
      >
        + Add Education
      </button>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-3">
      {(editData.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              #{idx + 1}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Remove
            </button>
          </div>
          <Field
            label="Certification Name"
            value={item.name || item.title || ""}
            onChange={(v) => handleItemChange(idx, "name", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Issuing Organization"
              value={item.issuer || item.organization || ""}
              onChange={(v) => handleItemChange(idx, "issuer", v)}
            />
            <Field
              label="Date"
              value={item.date || ""}
              onChange={(v) => handleItemChange(idx, "date", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => addItem()}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium"
      >
        + Add Certification
      </button>
    </div>
  );

  // FIXED: Skills editor — no longer duplicates items on Enter
  const renderSkills = () => {
    const [skillInput, setSkillInput] = React.useState("");

    const handleAddSkill = () => {
      const trimmed = skillInput.trim();
      if (!trimmed) return;
      const newItem = { name: trimmed };
      const items = [...(editData.items || []), newItem];
      updateData({ ...editData, items });
      setSkillInput("");
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {(editData.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 group"
            >
              <span>{typeof item === "string" ? item : item.name || item.skill || item}</span>
              <button
                onClick={() => removeItem(idx)}
                className="text-blue-300 hover:text-red-500 transition-colors"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all bg-white"
          />
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400">Press Enter or click Add to add a skill</p>
      </div>
    );
  };

  const renderLanguages = () => (
    <div className="space-y-3">
      {(editData.items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div className="flex-1 grid grid-cols-2 gap-3">
            <Field
              label="Language"
              value={item.language || item.name || ""}
              onChange={(v) => handleItemChange(idx, "language", v)}
            />
            <Field
              label="Proficiency"
              placeholder="Native, Fluent, etc."
              value={item.proficiency || item.level || ""}
              onChange={(v) => handleItemChange(idx, "proficiency", v)}
            />
          </div>
          <button
            onClick={() => removeItem(idx)}
            className="text-red-400 hover:text-red-600 p-1 mt-5"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={() => addItem()}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium"
      >
        + Add Language
      </button>
    </div>
  );

  const renderCustom = () => (
    <div className="space-y-3">
      <Field
        label="Section Title"
        value={editData.title || ""}
        onChange={(v) => handleFieldChange("title", v)}
      />
      <Field
        label="Content"
        placeholder="Write your content here..."
        value={editData.content || ""}
        onChange={(v) => handleFieldChange("content", v)}
        rows={5}
      />
    </div>
  );

  const renderContent = () => {
    switch (section.section_type) {
      case "personal_info":
        return renderPersonalInfo();
      case "summary":
      case "description":
        return renderSummary();
      case "experience":
        return renderExperience();
      case "education":
        return renderEducation();
      case "skills":
        return renderSkills();
      case "projects":
        return renderProjects();
      case "certifications":
        return renderCertifications();
      case "languages":
        return renderLanguages();
      default:
        return renderCustom();
    }
  };

  const icon = SECTION_ICONS[section.section_type] || "📄";
  const label = isCustom
    ? editData.title || "Custom Section"
    : SECTION_LABELS[section.section_type];

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-200 ${
        section.is_visible
          ? "border border-gray-200 bg-white shadow-sm hover:shadow-md"
          : "border border-gray-100 bg-gray-50/50 opacity-60"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base flex-shrink-0">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm truncate">
            {label}
          </span>
          {!section.is_visible && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] rounded-full font-medium uppercase tracking-wider">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(section.id, !section.is_visible);
            }}
            className={`p-1.5 rounded-lg transition-colors text-sm ${
              section.is_visible
                ? "text-blue-500 hover:bg-blue-50"
                : "text-gray-300 hover:bg-gray-100"
            }`}
            title={section.is_visible ? "Hide section" : "Show section"}
          >
            {section.is_visible ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
          {(isCustom || !["personal_info", "summary"].includes(section.section_type)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this section?")) {
                  onDelete(section.id);
                }
              }}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete section"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-100">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
