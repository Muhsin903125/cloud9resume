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

const SECTION_LABELS: Record<string, string> = {
  personal_info: "Personal Information",
  summary: "About / Summary",
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

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...editData, [field]: value };
    setEditData(newData);
    onUpdate(section.id, { section_data: newData });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...(editData.items || [])];
    items[index] = { ...items[index], [field]: value };
    const newData = { ...editData, items };
    setEditData(newData);
    onUpdate(section.id, { section_data: newData });
  };

  const addItem = () => {
    const items = [
      ...(editData.items || []),
      getEmptyItem(section.section_type),
    ];
    const newData = { ...editData, items };
    setEditData(newData);
    onUpdate(section.id, { section_data: newData });
  };

  const removeItem = (index: number) => {
    const items = (editData.items || []).filter(
      (_: any, i: number) => i !== index
    );
    const newData = { ...editData, items };
    setEditData(newData);
    onUpdate(section.id, { section_data: newData });
  };

  const getEmptyItem = (type: string) => {
    switch (type) {
      case "experience":
        return {
          company: "",
          title: "",
          startDate: "",
          endDate: "",
          description: "",
        };
      case "education":
        return {
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        };
      case "projects":
        return { name: "", description: "", technologies: [], link: "" };
      case "certifications":
        return { name: "", issuer: "", date: "" };
      case "skills":
        return { name: "" };
      default:
        return {};
    }
  };

  const renderPersonalInfo = () => (
    <div className="grid gap-3">
      <input
        type="text"
        placeholder="Full Name"
        value={editData.name || ""}
        onChange={(e) => handleFieldChange("name", e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
      <input
        type="text"
        placeholder="Job Title"
        value={editData.jobTitle || ""}
        onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
      <input
        type="email"
        placeholder="Email"
        value={editData.email || ""}
        onChange={(e) => handleFieldChange("email", e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={editData.phone || ""}
        onChange={(e) => handleFieldChange("phone", e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
      <input
        type="text"
        placeholder="Location"
        value={editData.location?.city || editData.location || ""}
        onChange={(e) => handleFieldChange("location", e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
    </div>
  );

  const renderSummary = () => (
    <textarea
      placeholder="Write a brief summary about yourself..."
      value={editData.text || editData.summary || ""}
      onChange={(e) => handleFieldChange("text", e.target.value)}
      rows={4}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
    />
  );

  const renderExperience = () => (
    <div className="space-y-4">
      {(editData.items || []).map((item: any, idx: number) => (
        <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-500">
              Experience {idx + 1}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-red-500 text-xs hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            placeholder="Company"
            value={item.company || ""}
            onChange={(e) => handleItemChange(idx, "company", e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Position/Title"
            value={item.title || item.position || ""}
            onChange={(e) => handleItemChange(idx, "title", e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Start Date"
              value={item.startDate || ""}
              onChange={(e) =>
                handleItemChange(idx, "startDate", e.target.value)
              }
              className="px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
            <input
              type="text"
              placeholder="End Date"
              value={item.endDate || ""}
              onChange={(e) => handleItemChange(idx, "endDate", e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
          <textarea
            placeholder="Description"
            value={item.description || ""}
            onChange={(e) =>
              handleItemChange(idx, "description", e.target.value)
            }
            rows={2}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm resize-none"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500"
      >
        + Add Experience
      </button>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      {(editData.items || []).map((item: any, idx: number) => (
        <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-500">
              Education {idx + 1}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-red-500 text-xs hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            placeholder="Institution"
            value={item.institution || item.school || ""}
            onChange={(e) =>
              handleItemChange(idx, "institution", e.target.value)
            }
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Degree"
            value={item.degree || ""}
            onChange={(e) => handleItemChange(idx, "degree", e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Field of Study"
            value={item.field || ""}
            onChange={(e) => handleItemChange(idx, "field", e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500"
      >
        + Add Education
      </button>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(editData.items || []).map((item: any, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
          >
            <span>{item.name || item}</span>
            <button
              onClick={() => removeItem(idx)}
              className="text-blue-400 hover:text-red-500 ml-1"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a skill and press Enter"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLInputElement).value.trim()
          ) {
            addItem();
            const items = [
              ...(editData.items || []),
              { name: (e.target as HTMLInputElement).value.trim() },
            ];
            setEditData({ ...editData, items });
            onUpdate(section.id, { section_data: { ...editData, items } });
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
    </div>
  );

  const renderCustom = () => (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Section Title"
        value={editData.title || ""}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium"
      />
      <textarea
        placeholder="Section Content..."
        value={editData.content || ""}
        onChange={(e) => handleFieldChange("content", e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
      />
    </div>
  );

  const renderContent = () => {
    switch (section.section_type) {
      case "personal_info":
        return renderPersonalInfo();
      case "summary":
        return renderSummary();
      case "experience":
        return renderExperience();
      case "education":
        return renderEducation();
      case "skills":
        return renderSkills();
      case "projects":
        return renderExperience(); // Similar structure
      case "certifications":
        return renderEducation(); // Similar structure
      default:
        return renderCustom();
    }
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        section.is_visible
          ? "border-gray-200"
          : "border-gray-100 bg-gray-50 opacity-60"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400 cursor-grab">&#9776;</span>
          <span className="font-medium text-gray-800">
            {isCustom
              ? editData.title || "Custom Section"
              : SECTION_LABELS[section.section_type]}
          </span>
          {!section.is_visible && (
            <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(section.id, !section.is_visible);
            }}
            className={`p-1.5 rounded ${
              section.is_visible
                ? "text-blue-500 hover:bg-blue-50"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title={section.is_visible ? "Hide section" : "Show section"}
          >
            {section.is_visible ? "👁" : "👁‍🗨"}
          </button>
          {isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(section.id);
              }}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded"
              title="Delete section"
            >
              🗑
            </button>
          )}
          <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-100 bg-white">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
