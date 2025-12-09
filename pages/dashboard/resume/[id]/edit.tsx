import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import { isValidEmail } from "@/lib/authUtils";
import { toast } from "react-hot-toast";

import {
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  ZapIcon,
  GlobeIcon,
  AwardIcon,
  PortfolioIcon,
  DocumentIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  EyeIcon,
  DownloadIcon,
  SaveIcon,
  LinkIcon,
} from "@/components/Icons";

import { ResumeRenderer } from "../../../../components/ResumeRenderer";
import { ResumePreviewModal } from "../../../../components/ResumePreviewModal";

const ResumeEditor = () => {
  const router = useRouter();
  const { id } = router.query;
  const { get, post } = useAPIAuth();

  // State
  const [resume, setResume] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("personal_info");
  const [template, setTemplate] = useState<"modern" | "classic" | "minimal">(
    "modern"
  );

  const sectionTypes = [
    { id: "personal_info", label: "Personal Info", Icon: UserIcon },
    { id: "summary", label: "Summary", Icon: DocumentIcon },
    { id: "experience", label: "Experience", Icon: BriefcaseIcon },
    { id: "education", label: "Education", Icon: GraduationCapIcon },
    { id: "skills", label: "Skills", Icon: ZapIcon },
    { id: "projects", label: "Projects", Icon: PortfolioIcon },
    { id: "certifications", label: "Certifications", Icon: AwardIcon },
    { id: "achievements", label: "Achievements", Icon: AwardIcon },
    { id: "languages", label: "Languages", Icon: GlobeIcon },
  ];

  useEffect(() => {
    if (id) fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("x_user_id");
      const data = await get(`/api/resumes/${id}`, {
        "x-user-id": userId || "",
      });

      if (data.success && data.data) {
        setResume(data.data);
        const sectionsData =
          data.data.resume_sections || data.data.sections || [];
        setSections(sectionsData);

        // Initialize Form Data
        const initialData: any = {};
        sectionsData.forEach((s: any) => {
          initialData[s.section_type] = s.section_data || {};
        });
        setFormData(initialData);
      } else {
        setError(data.error || "Failed to load resume");
        toast.error("Failed to load resume");
      }
    } catch (err) {
      setError("Failed to load resume");
      toast.error("Failed to load resume");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value },
    }));
    setIsDirty(true);
  };

  // Generic Array Helpers
  const handleArrayFieldChange = (index: number, field: string, value: any) => {
    setIsDirty(true);
    const currentArray = formData[activeTab]?.items || [];
    const updatedArray = [...currentArray];
    if (typeof updatedArray[index] === "object") {
      updatedArray[index] = { ...updatedArray[index], [field]: value };
    } else {
      // Handle simple string arrays (like skills if using old structure, but we use objects now mostly)
      updatedArray[index] = value;
    }

    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], items: updatedArray },
    }));
  };

  const handleAddArrayItem = (field: string = "items") => {
    setIsDirty(true);
    const currentArray = formData[activeTab]?.[field] || [];
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: [...currentArray, {}],
      },
    }));
  };

  const handleRemoveArrayItem = (field: string = "items", index: number) => {
    setIsDirty(true);
    const currentArray = formData[activeTab]?.[field] || [];
    const updatedArray = currentArray.filter(
      (_: any, i: number) => i !== index
    );
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: updatedArray,
      },
    }));
  };

  // Helper to remove empty items
  const cleanSectionData = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(cleanSectionData).filter((item) => {
        if (typeof item === "string") return item.trim() !== "";
        if (typeof item === "object" && item !== null) {
          // Check if object has at least one non-empty value
          return Object.values(item).some((v) => {
            if (typeof v === "string") return v.trim() !== "";
            if (Array.isArray(v)) return v.length > 0;
            return v !== null && v !== undefined;
          });
        }
        return true;
      });
    }
    if (typeof data === "object" && data !== null) {
      const cleaned: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (Array.isArray(value)) {
          const cleanedArray = cleanSectionData(value);
          if (cleanedArray.length > 0) cleaned[key] = cleanedArray;
        } else {
          cleaned[key] = value;
        }
      });
      return cleaned;
    }
    return data;
  };

  const validatePersonalInfo = (data: any) => {
    if (!data.name || data.name.trim().length < 2)
      return "Full Name is required";
    if (data.email && !isValidEmail(data.email)) return "Invalid email address";
    return null;
  };

  const saveSection = async (sectionKey = activeTab) => {
    if (sectionKey === "personal_info") {
      const err = validatePersonalInfo(formData[sectionKey] || {});
      if (err) {
        toast.error(err);
        return false;
      }
    }

    setSaving(true);
    try {
      const userId = localStorage.getItem("x_user_id");
      const rawData = formData[sectionKey] || {};
      const cleanedData = cleanSectionData(rawData);

      const res = await post(
        `/api/resumes/${id}/sections`,
        {
          section_type: sectionKey,
          section_data: cleanedData,
        },
        { "x-user-id": userId || "" }
      );

      if (res.success) {
        setIsDirty(false);
        // Update local state with cleaned data
        setFormData((prev: any) => ({ ...prev, [sectionKey]: cleanedData }));
        toast.success("Saved");
        return true;
      } else {
        toast.error(res.error || "Save failed");
        return false;
      }
    } catch (e) {
      toast.error("Error saving");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStepChange = async (newId: string) => {
    if (activeTab === newId) return;
    if (isDirty) {
      await saveSection();
    }
    setActiveTab(newId);
  };

  // Live Preview Helper
  const getPreviewSections = () => {
    // Merge existing DB sections with current Form Data
    const updated = sections.map((s) => ({
      ...s,
      section_data: formData[s.section_type] || s.section_data,
    }));

    // Add new sections not yet in DB
    sectionTypes.forEach((type) => {
      if (
        !updated.find((s) => s.section_type === type.id) &&
        formData[type.id]
      ) {
        updated.push({
          section_type: type.id,
          section_data: formData[type.id],
          order_index: 99,
        });
      }
    });

    return updated;
  };

  const activeSectionIndex = sectionTypes.findIndex((s) => s.id === activeTab);
  const progress = ((activeSectionIndex + 1) / sectionTypes.length) * 100;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Head>
        <title>{resume?.title || "Resume Editor"} - Cloud9</title>
      </Head>

      {/* Main Editor UI - Hidden on Print */}
      <div className="flex-1 flex flex-col overflow-hidden no-print">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/resume")}
              className="text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <h1 className="font-bold text-lg text-gray-900 truncate max-w-[200px] hidden md:block">
              {resume?.title}
            </h1>
          </div>

          {/* Stepper (Desktop) */}
          <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
            <div className="flex justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>

              {sectionTypes.map((s, idx) => {
                const isActive = s.id === activeTab;
                const isCompleted = idx < activeSectionIndex;

                return (
                  <button
                    key={s.id}
                    onClick={() => handleStepChange(s.id)}
                    className={`flex flex-col items-center gap-1 group focus:outline-none`}
                    title={s.label}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 bg-white ${
                        isActive
                          ? "border-blue-600 text-blue-600 ring-2 ring-blue-100"
                          : isCompleted
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-gray-300 text-gray-300 group-hover:border-gray-400"
                      }`}
                    >
                      <s.Icon size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              {["modern", "classic", "minimal"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                    template === t
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (isDirty) saveSection();
                toast("Preparing download...", { icon: "📄" });
                setTimeout(() => window.print(), 500);
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <DownloadIcon size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </header>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Form Editor (60%) */}
          <div className="w-full lg:w-3/5 flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            {/* Mobile Stepper Header */}
            <div className="lg:hidden p-4 border-b border-gray-100 bg-white overflow-x-auto whitespace-nowrap hide-scrollbar">
              <div className="flex gap-2">
                {sectionTypes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStepChange(s.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      activeTab === s.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-2xl mx-auto p-6 md:p-10 pb-32">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {sectionTypes.find((s) => s.id === activeTab)?.label}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Fill in the details below. Changes are auto-saved.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isDirty ? (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium border border-amber-100">
                        Unsaved Changes
                      </span>
                    ) : (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium border border-green-100">
                        All Saved
                      </span>
                    )}
                  </div>
                </div>

                {renderSectionForm(
                  activeTab,
                  formData[activeTab],
                  handleInputChange,
                  handleAddArrayItem,
                  handleRemoveArrayItem,
                  handleArrayFieldChange
                )}

                {/* Navigation Footer */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-12">
                  <button
                    disabled={activeSectionIndex === 0}
                    onClick={() =>
                      handleStepChange(sectionTypes[activeSectionIndex - 1].id)
                    }
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      if (activeSectionIndex === sectionTypes.length - 1) {
                        await saveSection();
                        toast.success("Resume verification complete!");
                      } else {
                        handleStepChange(
                          sectionTypes[activeSectionIndex + 1].id
                        );
                      }
                    }}
                    className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    {activeSectionIndex === sectionTypes.length - 1
                      ? "Finish Review"
                      : "Next Step"}
                    <ArrowRightIcon size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Preview Fab */}
            <div className="lg:hidden absolute bottom-6 right-6">
              <button
                onClick={() => setShowPreview(true)}
                className="bg-blue-900 text-white p-4 rounded-full shadow-xl hover:bg-blue-800 transition-colors"
              >
                <EyeIcon size={24} />
              </button>
            </div>
          </div>

          {/* RIGHT: Live Preview (40%) */}
          <div className="hidden lg:flex w-2/5 bg-slate-100 overflow-y-auto items-start justify-center p-8 relative custom-scrollbar">
            <div className="sticky top-8 pb-8">
              <div
                className="bg-white shadow-2xl shadow-slate-200/50 rounded-sm overflow-hidden transition-all duration-300 transform"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  transform: "scale(0.65)",
                  transformOrigin: "top center",
                }}
              >
                <ResumeRenderer
                  resume={resume}
                  sections={getPreviewSections()}
                  template={template}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview Modal */}
        <ResumePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          resume={resume || { title: "New Resume" }}
          sections={getPreviewSections()}
        />
      </div>

      {/* PRINT PORTAL: Only visible during print */}
      <div className="print-only">
        <ResumeRenderer
          resume={resume}
          sections={getPreviewSections()}
          template={template}
        />
      </div>
    </div>
  );
};

// --- Sub-Components for Form ---

const InputWrapper = ({ label, children }: any) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
      {label}
    </label>
    {children}
  </div>
);

const Input = ({
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
}: any) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
      readOnly={!onChange}
    />
  </div>
);

const Textarea = ({ label, name, placeholder, value, onChange }: any) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <textarea
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      placeholder={placeholder}
      rows={4}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium resize-none"
      readOnly={!onChange}
    />
  </div>
);

const Select = ({ label, name, options, value, onChange }: any) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <select
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
    >
      <option value="">Select...</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const renderSectionForm = (
  type: string,
  data: any = {},
  onChange: any,
  onAdd: any,
  onRemove: any,
  onArrayChange: any
) => {
  const handleChange = (name: string, value: any) => {
    onChange(name, value);
  };

  switch (type) {
    case "personal_info":
      return (
        <div className="space-y-1 animate-fade-in-up">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={data.name}
              onChange={(e: any) => handleChange("name", e.target.value)}
              placeholder="John Doe"
            />
            <Input
              label="Job Title"
              value={data.jobTitle}
              onChange={(e: any) => handleChange("jobTitle", e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              value={data.email}
              onChange={(e: any) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
            />
            <Input
              label="Phone"
              value={data.phone}
              onChange={(e: any) => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address"
              value={data.address}
              onChange={(e: any) => handleChange("address", e.target.value)}
              placeholder="123 Main St"
            />
            <Input
              label="City"
              value={data.city}
              onChange={(e: any) => handleChange("city", e.target.value)}
              placeholder="New York"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              value={data.country}
              onChange={(e: any) => handleChange("country", e.target.value)}
              placeholder="USA"
            />
            <Input
              label="Postal Code"
              value={data.postalCode}
              onChange={(e: any) => handleChange("postalCode", e.target.value)}
              placeholder="10001"
            />
          </div>
          <div className="pt-4 border-t border-gray-100 mt-2">
            <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LinkIcon size={14} className="text-gray-400" /> Social Links
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="LinkedIn"
                value={data.linkedin}
                onChange={(e: any) => handleChange("linkedin", e.target.value)}
                placeholder="linkedin.com/in/john"
              />
              <Input
                label="GitHub"
                value={data.github}
                onChange={(e: any) => handleChange("github", e.target.value)}
                placeholder="github.com/john"
              />
              <Input
                label="Website"
                value={data.website}
                onChange={(e: any) => handleChange("website", e.target.value)}
                placeholder="johndoe.com"
              />
              <Input
                label="Portfolio"
                value={data.portfolio}
                onChange={(e: any) => handleChange("portfolio", e.target.value)}
                placeholder="portfolio.com"
              />
            </div>
          </div>
        </div>
      );

    case "summary":
      return (
        <div className="animate-fade-in-up">
          <Textarea
            label="Professional Summary"
            value={data.text}
            onChange={(e: any) => handleChange("text", e.target.value)}
            placeholder="A brief overview of your career highlights, skills, and goals..."
          />
        </div>
      );

    case "experience":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group hover:shadow-md transition-shadow"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => onRemove("items", idx)}
                  className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <div className="w-4 h-4 flex items-center justify-center font-bold">
                    ×
                  </div>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Company
                  </label>
                  <input
                    value={item.company || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "company", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Role
                  </label>
                  <input
                    value={item.position || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "position", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Start Date
                  </label>
                  <input
                    value={item.startDate || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "startDate", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Jan 2020"
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    End Date
                  </label>
                  <input
                    value={item.endDate || ""}
                    disabled={item.current}
                    onChange={(e) =>
                      onArrayChange(idx, "endDate", e.target.value)
                    }
                    className={`w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                      item.current ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder={item.current ? "Present" : "Jan 2022"}
                  />
                  <div className="absolute -top-1 right-0">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.current || false}
                        onChange={(e) => {
                          onArrayChange(idx, "current", e.target.checked);
                          if (e.target.checked) {
                            onArrayChange(idx, "endDate", "Present");
                          } else {
                            onArrayChange(idx, "endDate", "");
                          }
                        }}
                        className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                        Current
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Location
                  </label>
                  <input
                    value={item.location || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "location", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="New York, NY"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Employment Type
                  </label>
                  <select
                    value={item.employmentType || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "employmentType", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    onArrayChange(idx, "description", e.target.value)
                  }
                  className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none leading-relaxed"
                  placeholder="• Led a team of developers...&#10;• Achieved 20% growth..."
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd("items")}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              +
            </span>{" "}
            Add Experience
          </button>
        </div>
      );

    case "education":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <div className="grid grid-cols-2 gap-4">
                <InputWrapper label="School / University">
                  <input
                    value={item.school || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "school", e.target.value)
                    }
                    placeholder="Oxford University"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </InputWrapper>
                <InputWrapper label="Degree">
                  <input
                    value={item.degree || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "degree", e.target.value)
                    }
                    placeholder="BSc Computer Science"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </InputWrapper>
                <InputWrapper label="Field of Study (Major)">
                  <input
                    value={item.fieldOfStudy || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "fieldOfStudy", e.target.value)
                    }
                    placeholder="Artificial Intelligence"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </InputWrapper>
                <div className="grid grid-cols-2 gap-2">
                  <InputWrapper label="Graduation Year">
                    <input
                      value={item.graduationDate || ""}
                      onChange={(e) =>
                        onArrayChange(idx, "graduationDate", e.target.value)
                      }
                      placeholder="2023"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </InputWrapper>
                  <InputWrapper label="GPA">
                    <input
                      value={item.gpa || ""}
                      onChange={(e) =>
                        onArrayChange(idx, "gpa", e.target.value)
                      }
                      placeholder="3.8/4.0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </InputWrapper>
                </div>
                <InputWrapper label="Location">
                  <input
                    value={item.location || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "location", e.target.value)
                    }
                    placeholder="London, UK"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </InputWrapper>
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd("items")}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl font-bold text-xs text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            + Add Education
          </button>
        </div>
      );

    case "skills":
      return (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-fade-in-up">
          <p className="text-sm font-medium text-gray-500 mb-6">
            Type a skill and press Enter to add it.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {(data.items || []).map((skill: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 group"
              >
                {skill}
                <button
                  onClick={() => onRemove("items", idx)}
                  className="ml-2 text-blue-400 hover:text-blue-900 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              id="skillInput"
              placeholder="e.g. React, Python, Project Management"
              className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = e.target.value.trim();
                  if (val) {
                    const current = data.items || [];
                    onChange("items", [...current, val]);
                    e.target.value = "";
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById(
                  "skillInput"
                ) as HTMLInputElement;
                if (input && input.value.trim()) {
                  const current = data.items || [];
                  onChange("items", [...current, input.value.trim()]);
                  input.value = "";
                }
              }}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
            >
              Add
            </button>
          </div>
        </div>
      );

    case "projects":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5"
              >
                ×
              </button>
              <div className="grid grid-cols-2 gap-4">
                <InputWrapper label="Project Name">
                  <input
                    value={item.title || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g. Portfolio Website"
                  />
                </InputWrapper>
                <InputWrapper label="Tech Stack">
                  <input
                    value={item.technologies || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "technologies", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g. React, Node.js"
                  />
                </InputWrapper>
                <InputWrapper label="Project Link">
                  <input
                    value={item.link || ""}
                    onChange={(e) => onArrayChange(idx, "link", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://..."
                  />
                </InputWrapper>
                <InputWrapper label="Date / Year">
                  <input
                    value={item.date || ""}
                    onChange={(e) => onArrayChange(idx, "date", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="2023"
                  />
                </InputWrapper>
              </div>
              <InputWrapper label="Description">
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    onArrayChange(idx, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[80px] resize-none"
                  placeholder="Describe your project..."
                />
              </InputWrapper>
            </div>
          ))}
          <button
            onClick={() => onAdd("items")}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl font-bold text-xs text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            + Add Project
          </button>
        </div>
      );

    default:
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5"
              >
                ×
              </button>
              <InputWrapper label="Title / Name">
                <input
                  value={item.title || item.name || ""}
                  onChange={(e) =>
                    onArrayChange(
                      idx,
                      item.title !== undefined ? "title" : "name",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </InputWrapper>
              <InputWrapper label="Description">
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    onArrayChange(idx, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[80px]"
                />
              </InputWrapper>
            </div>
          ))}
          <button
            onClick={() => onAdd("items")}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl font-bold text-xs text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            + Add Item
          </button>
        </div>
      );
  }
};

export default ResumeEditor;
