import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import { isValidEmail, useAuth } from "@/lib/authUtils";
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
  TemplateIcon,
  ChevronDownIcon,
  CheckIcon,
  UploadIcon,
  DeleteIcon,
  EyeOffIcon,
} from "@/components/Icons";

import { apiClient } from "@/lib/apiClient";

import { ResumeRenderer } from "../../../../components/ResumeRenderer";
import { ResumePreviewModal } from "../../../../components/ResumePreviewModal";
import { ATSChecker } from "@/components/ai/ATSChecker";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATE_REGISTRY } from "@/lib/template-registry";
import { POPULAR_DEGREES } from "@/lib/constants/degrees";
import { POPULAR_SKILLS } from "@/lib/constants/skills";
import { POPULAR_JOB_TITLES } from "@/lib/constants/jobTitles";
import { POPULAR_LANGUAGES } from "@/lib/constants/languages";
import { POPULAR_HOBBIES } from "@/lib/constants/hobbies";

const ResumeEditor = () => {
  const router = useRouter();
  const { id } = router.query;
  const { get, post, patch } = useAPIAuth();

  // State
  const [resume, setResume] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showATSModal, setShowATSModal] = useState(false);
  const [aiWriterOpen, setAiWriterOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [activeTab, setActiveTab] = useState("personal_info");
  const [template, setTemplate] = useState<any>("modern");
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [settings, setSettings] = useState<any>({});

  // Skills autocomplete state
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Job Title autocomplete state
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);

  // Degree autocomplete state (for education section)
  const [degreeInputs, setDegreeInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [showDegreeSuggestions, setShowDegreeSuggestions] = useState<{
    [key: number]: boolean;
  }>({});

  // Summary suggestion search state
  const [suggestionSearch, setSuggestionSearch] = useState("");

  // Experience position autocomplete state (per-item)
  const [expPositionInputs, setExpPositionInputs] = useState<{
    [key: number]: string;
  }>({});
  const [showExpPositionSuggestions, setShowExpPositionSuggestions] = useState<{
    [key: number]: boolean;
  }>({});

  // Language autocomplete state (per-item)
  const [languageInputs, setLanguageInputs] = useState<{
    [key: number]: string;
  }>({});
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState<{
    [key: number]: boolean;
  }>({});

  // Declaration search state
  const [declarationSearch, setDeclarationSearch] = useState("");

  // Hobby autocomplete state
  const [hobbyInput, setHobbyInput] = useState("");
  const [showHobbySuggestions, setShowHobbySuggestions] = useState(false);

  const baseSectionTypes = [
    { id: "personal_info", label: "Contact", Icon: UserIcon },
    { id: "summary", label: "Summary", Icon: DocumentIcon },
    { id: "experience", label: "Experience", Icon: BriefcaseIcon },
    { id: "education", label: "Education", Icon: GraduationCapIcon },
    { id: "skills", label: "Skills", Icon: ZapIcon },
    { id: "projects", label: "Projects", Icon: PortfolioIcon },
    { id: "certifications", label: "Certifications", Icon: AwardIcon },
    { id: "achievements", label: "Achievements", Icon: AwardIcon },
    { id: "languages", label: "Languages", Icon: GlobeIcon },
    { id: "volunteering", label: "Volunteering", Icon: UserIcon },
    { id: "publications", label: "Publications", Icon: DocumentIcon },
    { id: "hobbies", label: "Interests", Icon: ZapIcon },
    { id: "references", label: "References", Icon: UserIcon },
    { id: "declaration", label: "Declaration", Icon: DocumentIcon },
  ];

  const { user } = useAuth(); // Import auth to check plan

  const getOrderedSectionTypes = () => {
    // FRESHER PLAN RESTRICTION: Remove experience for 'starter' plan
    let types = [...baseSectionTypes];

    if (user?.plan === "starter") {
      types = types.filter((t) => t.id !== "experience");
    }

    const order = settings?.section_order || [];
    if (order.length === 0) return types;

    return types.sort((a, b) => {
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  };

  const sectionTypes = getOrderedSectionTypes();

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
        const sectionsData = Array.isArray(data.data.sections)
          ? data.data.sections
          : Array.isArray(data.data.resume_sections)
          ? data.data.resume_sections
          : [];
        setSections(sectionsData);

        // Load preferences
        const s = data.data.settings || {};
        const templateFromSettings = s.template_id;

        if (templateFromSettings) setTemplate(templateFromSettings);
        else if (data.data.template_id) setTemplate(data.data.template_id);

        if (data.data.theme_color) setThemeColor(data.data.theme_color);
        if (data.data.title) setResumeTitle(data.data.title);

        // Initialize Form Data
        const initialData: any = {};
        sectionsData.forEach((s: any) => {
          initialData[s.section_type] = s.section_data || {};
        });
        setFormData(initialData);

        // Auto-detect which optional sections have data
        const optionalSections = [
          "projects",
          "certifications",
          "achievements",
          "languages",
          "volunteering",
          "publications",
          "hobbies",
          "references",
          "declaration",
        ];

        const sectionsWithData: string[] = [];
        const sectionsWithoutData: string[] = [];

        optionalSections.forEach((sectionId) => {
          const sectionData = initialData[sectionId];
          const hasData =
            sectionData &&
            ((Array.isArray(sectionData.items) &&
              sectionData.items.length > 0) ||
              (sectionData.text && sectionData.text.trim().length > 0));

          if (hasData) {
            sectionsWithData.push(sectionId);
          } else {
            sectionsWithoutData.push(sectionId);
          }
        });

        // Set hidden sections: hide ALL optional sections by default,
        // but show those with data (from imports)
        const defaultHiddenSections = optionalSections.filter(
          (sectionId) => !sectionsWithData.includes(sectionId)
        );

        const newSettings = {
          ...s,
          // If no saved settings, use default (all optional hidden except those with data)
          hidden_sections:
            s.hidden_sections !== undefined
              ? s.hidden_sections
              : defaultHiddenSections,
        };
        setSettings(newSettings);
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

  const handleTitleUpdate = async () => {
    if (!resumeTitle.trim() || resumeTitle === resume?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const userId = localStorage.getItem("x_user_id");
      const res = await patch(
        `/api/resumes/${id}`,
        {
          title: resumeTitle,
        },
        { "x-user-id": userId || "" }
      );

      if (res.success) {
        setResume((prev: any) => ({ ...prev, title: resumeTitle }));
        toast.success("Resume renamed");
      } else {
        toast.error("Failed to rename");
        setResumeTitle(resume?.title || "");
      }
    } catch (err) {
      toast.error("Failed to rename");
    } finally {
      setIsEditingTitle(false);
    }
  };

  // Generic Array Helpers
  const handleArrayFieldChange = (index: number, field: string, value: any) => {
    setIsDirty(true);
    const currentArray = formData[activeTab]?.items || [];
    const updatedArray = [...currentArray];
    if (typeof updatedArray[index] === "object") {
      updatedArray[index] = { ...updatedArray[index], [field]: value };
    } else {
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
        // Do not overwrite local data with cleaned data to preserve user input state
        // setFormData((prev: any) => ({ ...prev, [sectionKey]: cleanedData }));

        // Update sections state with returned data (includes ID)
        if (res.data) {
          setSections((prev) => {
            const idx = prev.findIndex((s) => s.section_type === sectionKey);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = res.data;
              return updated;
            } else {
              return [...prev, res.data];
            }
          });
        }

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

  const handlePreferencesSave = async (
    newTemplate: string,
    newColor: string,
    newSettings?: any
  ) => {
    try {
      const userId = localStorage.getItem("x_user_id");
      await patch(
        `/api/resumes/${id}`,
        {
          template_id: newTemplate, // API now handles if this is slug or UUID
          theme_color: newColor,
          settings: newSettings || settings,
        },
        { "x-user-id": userId || "" }
      );

      setTemplate(newTemplate as any);
      setThemeColor(newColor);
      if (newSettings) setSettings(newSettings);

      toast.success("Preferences saved!");
      return true;
    } catch (e) {
      toast.error("Failed to save preferences");
      return false;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const res = await apiClient.postForm(
        "/user/upload-avatar",
        formDataUpload
      );
      if (res.data?.success && res.data?.url) {
        handleInputChange("photoUrl", res.data.url);
        toast.success("Photo uploaded");
      } else {
        toast.error(res.data?.error || res.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("[Photo Upload] Error:", err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
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
    const updated = sections.map((s) => ({
      ...s,
      section_data: formData[s.section_type] || s.section_data,
    }));

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

  // Apply sorting and filtering for the main preview
  const getProcessedPreviewSections = () => {
    const rawSections = getPreviewSections();

    // Sort by section_type
    const order = settings?.section_order || [];
    let sorted = [...rawSections];

    if (order.length > 0) {
      sorted.sort((a, b) => {
        const idxA = order.indexOf(a.section_type);
        const idxB = order.indexOf(b.section_type);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    // Return all sections - the modal handles visibility internally via hiddenSectionIds
    return sorted;
  };

  const activeSectionIndex = sectionTypes.findIndex((s) => s.id === activeTab);
  const progress = ((activeSectionIndex + 1) / sectionTypes.length) * 100;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading editor...</p>
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Head>
        <title>{resume?.title || "Resume Editor"} - Cloud9Profile</title>
      </Head>

      <ATSChecker
        isOpen={showATSModal}
        onClose={() => setShowATSModal(false)}
        resumeData={resume}
        resumeId={id as string}
        onResumeUpdate={() => {
          // Refresh resume data after auto-optimization
          fetchResume();
        }}
      />

      {/* Main Editor UI */}
      <div className="flex-1 flex flex-col overflow-hidden no-print">
        {/* Header */}
        <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 z-30 relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/resume")}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div className="h-4 w-px bg-gray-200" />

            {isEditingTitle ? (
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                onBlur={handleTitleUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleTitleUpdate()}
                className="font-semibold text-sm text-gray-900 border-none focus:outline-none bg-transparent min-w-[150px]"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="font-semibold text-sm text-gray-900 truncate max-w-[200px] cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded transition-colors"
              >
                {resumeTitle || "Untitled Resume"}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => saveSection()}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-2 ${
                isDirty
                  ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isDirty ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                }`}
              />
              {isDirty ? "Save Changes" : "Saved"}
            </button>

            <button
              onClick={() => setShowATSModal(true)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[11px] font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              ATS Check
            </button>

            <button
              onClick={() => {
                if (isDirty) saveSection();
                setShowPreview(true);
              }}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 flex items-center gap-2"
            >
              <DownloadIcon size={12} className="text-white" />
              Download
            </button>
          </div>
        </header>

        <ResumePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          resume={resume}
          sections={getProcessedPreviewSections()}
          template={template}
          themeColor={themeColor}
          settings={settings}
          onSave={handlePreferencesSave}
        />

        {/* Dynamic Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-14 md:w-48 bg-white border-r border-gray-100 overflow-y-auto flex flex-col shrink-0 custom-scrollbar">
            <div className="p-2 md:p-2.5 space-y-0.5">
              {/* Mandatory Sections */}
              {sectionTypes
                .filter((s) =>
                  [
                    "personal_info",
                    "summary",
                    "experience",
                    "education",
                    "skills",
                  ].includes(s.id)
                )
                .map((s) => {
                  const isActive = s.id === activeTab;
                  const isHidden = (settings.hidden_sections || []).includes(
                    s.id
                  );
                  return (
                    <div
                      key={s.id}
                      className={`group w-full flex items-center gap-1.5 p-1.5 md:p-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <button
                        onClick={() => handleStepChange(s.id)}
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                      >
                        <div
                          className={`shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          }`}
                        >
                          <s.Icon size={12} className="md:w-3.5 md:h-3.5" />
                        </div>
                        <span
                          className={`hidden md:block text-[11px] font-semibold truncate ${
                            isHidden ? "opacity-50 line-through" : ""
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentHidden = settings.hidden_sections || [];
                          let newHidden;
                          if (currentHidden.includes(s.id)) {
                            newHidden = currentHidden.filter(
                              (id: string) => id !== s.id
                            );
                          } else {
                            newHidden = [...currentHidden, s.id];
                          }
                          handlePreferencesSave(template, themeColor, {
                            ...settings,
                            hidden_sections: newHidden,
                          });
                        }}
                        className={`hidden md:block p-1 rounded transition-all opacity-0 group-hover:opacity-100 ${
                          isHidden
                            ? "opacity-100 text-gray-400 hover:text-gray-600 bg-gray-100"
                            : "text-gray-300 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title={isHidden ? "Show Section" : "Hide Section"}
                      >
                        {isHidden ? (
                          <EyeOffIcon size={10} />
                        ) : (
                          <EyeIcon size={10} />
                        )}
                      </button>
                    </div>
                  );
                })}

              {/* Divider */}
              <div className="h-px bg-gray-200 my-2"></div>

              {/* Optional Sections Label */}
              <div className="px-2 py-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider hidden md:block">
                  Optional
                </p>
              </div>

              {/* Optional Sections */}
              {sectionTypes
                .filter(
                  (s) =>
                    ![
                      "personal_info",
                      "summary",
                      "experience",
                      "education",
                      "skills",
                    ].includes(s.id)
                )
                .sort((a, b) => {
                  // Sort visible sections (not hidden) before hidden sections
                  const aHidden = (settings.hidden_sections || []).includes(
                    a.id
                  );
                  const bHidden = (settings.hidden_sections || []).includes(
                    b.id
                  );
                  if (aHidden === bHidden) return 0;
                  return aHidden ? 1 : -1;
                })
                .map((s) => {
                  const isActive = s.id === activeTab;
                  const isHidden = (settings.hidden_sections || []).includes(
                    s.id
                  );
                  return (
                    <div
                      key={s.id}
                      className={`group w-full flex items-center gap-1.5 p-1.5 md:p-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <button
                        onClick={() => handleStepChange(s.id)}
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                      >
                        <div
                          className={`shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                          }`}
                        >
                          <s.Icon size={12} className="md:w-3.5 md:h-3.5" />
                        </div>
                        <span
                          className={`hidden md:block text-[11px] font-semibold truncate ${
                            isHidden ? "opacity-50 line-through" : ""
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentHidden = settings.hidden_sections || [];
                          let newHidden;
                          if (currentHidden.includes(s.id)) {
                            newHidden = currentHidden.filter(
                              (id: string) => id !== s.id
                            );
                          } else {
                            newHidden = [...currentHidden, s.id];
                          }
                          handlePreferencesSave(template, themeColor, {
                            ...settings,
                            hidden_sections: newHidden,
                          });
                        }}
                        className={`hidden md:block p-1 rounded transition-all opacity-0 group-hover:opacity-100 ${
                          isHidden
                            ? "opacity-100 text-gray-400 hover:text-gray-600 bg-gray-100"
                            : "text-gray-300 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title={isHidden ? "Show Section" : "Hide Section"}
                      >
                        {isHidden ? (
                          <EyeOffIcon size={10} />
                        ) : (
                          <EyeIcon size={10} />
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </aside>

          {/* Form Editor Area */}
          <main className="flex-1 overflow-hidden bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
              <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        {(() => {
                          const s = sectionTypes.find(
                            (t) => t.id === activeTab
                          );
                          return s ? <s.Icon size={12} /> : null;
                        })()}
                      </span>
                      {sectionTypes.find((s) => s.id === activeTab)?.label}
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {activeTab === "personal_info" &&
                        "Manage your contact details and professional profile."}
                      {activeTab === "summary" &&
                        "Write a compelling professional summary that highlights your strengths."}
                      {activeTab === "experience" &&
                        "List your professional work history, starting with your most recent role."}
                      {activeTab === "education" &&
                        "Detail your academic background and qualifications."}
                      {activeTab === "skills" &&
                        "Highlight your technical and interpersonal skills."}
                      {activeTab === "projects" &&
                        "Showcase your best projects and their impact."}
                      {activeTab === "certifications" &&
                        "List your professional certifications and licenses."}
                      {activeTab === "achievements" &&
                        "Highlight awards, honors, and specific accomplishments."}
                      {activeTab === "languages" &&
                        "Add languages you speak and your proficiency levels."}
                      {activeTab === "volunteering" &&
                        "Share your volunteer work and community service."}
                      {activeTab === "publications" &&
                        "List your published papers, articles, or books."}
                      {activeTab === "hobbies" &&
                        "Add your interests to show your personality."}
                      {activeTab === "references" &&
                        "Include professional references who can vouch for you."}
                      {activeTab === "declaration" &&
                        "Sign off with a formal declaration of accuracy."}
                    </p>
                  </div>

                  {/* Show/Hide Toggle Button */}
                  <button
                    onClick={() => {
                      const currentHidden = settings.hidden_sections || [];
                      let newHidden;
                      if (currentHidden.includes(activeTab)) {
                        newHidden = currentHidden.filter(
                          (id: string) => id !== activeTab
                        );
                      } else {
                        newHidden = [...currentHidden, activeTab];
                      }
                      handlePreferencesSave(template, themeColor, {
                        ...settings,
                        hidden_sections: newHidden,
                      });
                    }}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold ${
                      (settings.hidden_sections || []).includes(activeTab)
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                    title={
                      (settings.hidden_sections || []).includes(activeTab)
                        ? "Show in Resume"
                        : "Hide from Resume"
                    }
                  >
                    {(settings.hidden_sections || []).includes(activeTab) ? (
                      <>
                        <EyeOffIcon size={14} />
                        <span className="hidden sm:inline">Hidden</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon size={14} />
                        <span className="hidden sm:inline">Visible</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Form Logic */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderSectionForm(
                      activeTab,
                      formData[activeTab] || {},
                      handleInputChange,
                      handleAddArrayItem,
                      handleRemoveArrayItem,
                      handleArrayFieldChange,
                      skillInput,
                      setSkillInput,
                      showSuggestions,
                      setShowSuggestions,
                      jobTitleInput,
                      setJobTitleInput,
                      showJobTitleSuggestions,
                      setShowJobTitleSuggestions,
                      degreeInputs,
                      setDegreeInputs,
                      showDegreeSuggestions,
                      setShowDegreeSuggestions,
                      suggestionSearch,
                      setSuggestionSearch,
                      {
                        fileInputRef,
                        handlePhotoUpload,
                        uploading,
                      },
                      expPositionInputs,
                      setExpPositionInputs,
                      showExpPositionSuggestions,
                      setShowExpPositionSuggestions,
                      languageInputs,
                      setLanguageInputs,
                      showLanguageSuggestions,
                      setShowLanguageSuggestions,
                      declarationSearch,
                      setDeclarationSearch,
                      hobbyInput,
                      setHobbyInput,
                      showHobbySuggestions,
                      setShowHobbySuggestions
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sticky Navigation Actions */}
            <div className="shrink-0 border-t border-gray-100 bg-white p-2 flex items-center justify-between">
              <button
                disabled={activeSectionIndex === 0}
                onClick={() =>
                  handleStepChange(sectionTypes[activeSectionIndex - 1].id)
                }
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeftIcon size={14} /> Previous
              </button>

              <button
                onClick={async () => {
                  if (activeSectionIndex === sectionTypes.length - 1) {
                    await saveSection();
                    setShowPreview(true);
                  } else {
                    handleStepChange(sectionTypes[activeSectionIndex + 1].id);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-md shadow-gray-900/10"
              >
                {activeSectionIndex === sectionTypes.length - 1
                  ? "Finish"
                  : "Continue"}
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </main>

          {/* Right Live Preview Panel */}
          <aside className="hidden xl:flex w-[400px] bg-gray-50 border-l border-gray-100 overflow-y-auto flex-col items-center p-6 shrink-0 relative">
            <div className="sticky top-0 z-20 w-full flex flex-col gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-gray-200/50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <TemplateIcon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Template
                    </p>
                    <select
                      value={template}
                      onChange={(e) =>
                        handlePreferencesSave(e.target.value, themeColor)
                      }
                      className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer appearance-none"
                    >
                      {TEMPLATE_REGISTRY.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm cursor-pointer"
                    style={{ backgroundColor: themeColor }}
                    onClick={() => {
                      /* Color Picker? */
                    }}
                  />
                  <div className="h-4 w-px bg-gray-200 mx-1" />
                  <button
                    onClick={() => setShowPreview(true)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EyeIcon size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Resume Preview Box */}
            <div className="w-full shadow-2xl shadow-gray-200/50 rounded-lg overflow-hidden overflow-y-auto transform-gpu hover:scale-[1.01] transition-transform duration-500 bg-white custom-scrollbar">
              <div
                className="relative w-full origin-top-left"
                style={{
                  paddingBottom: "141.4%", // Aspect ratio of A4 (1/1.414)
                }}
              >
                <div className="absolute inset-0 scale-[0.45] w-[210mm] h-[297mm] origin-top-left">
                  <ResumeRenderer
                    resume={resume}
                    sections={getProcessedPreviewSections()}
                    template={template}
                    themeColor={themeColor}
                    settings={settings}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 text-[10px] font-medium text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live Preview
            </div>
          </aside>
        </div>
      </div>

      {/* PRINT PORTAL: Only visible during print */}
      <div className="print-only">
        <ResumeRenderer
          resume={resume}
          sections={getProcessedPreviewSections()}
          template={template}
          themeColor={themeColor}
          settings={settings}
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
  required,
  helperText,
  list,
}: any) => (
  <div className="mb-2">
    <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-wide mb-1">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      placeholder={placeholder}
      list={list}
      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium"
      readOnly={!onChange}
    />
    {helperText && (
      <p className="text-[9px] text-gray-400 mt-1 italic leading-tight">
        {helperText}
      </p>
    )}
  </div>
);

const Textarea = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  rows = 4,
  required,
}: any) => (
  <div className="mb-2">
    <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-wide mb-1">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <textarea
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium resize-none shadow-inner"
      readOnly={!onChange}
    />
  </div>
);

const Select = ({ label, name, options, value, onChange }: any) => (
  <div className="mb-2">
    <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-wide mb-1">
      {label}
    </label>
    <select
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium"
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
  onArrayChange: any,
  skillInput?: string,
  setSkillInput?: any,
  showSuggestions?: boolean,
  setShowSuggestions?: any,
  jobTitleInput?: string,
  setJobTitleInput?: any,
  showJobTitleSuggestions?: boolean,
  setShowJobTitleSuggestions?: any,
  degreeInputs?: { [key: number]: string },
  setDegreeInputs?: any,
  showDegreeSuggestions?: { [key: number]: boolean },
  setShowDegreeSuggestions?: any,
  suggestionSearch?: string,
  setSuggestionSearch?: any,
  photoHelpers?: {
    fileInputRef: any;
    handlePhotoUpload: any;
    uploading: boolean;
  },
  expPositionInputs?: { [key: number]: string },
  setExpPositionInputs?: any,
  showExpPositionSuggestions?: { [key: number]: boolean },
  setShowExpPositionSuggestions?: any,
  languageInputs?: { [key: number]: string },
  setLanguageInputs?: any,
  showLanguageSuggestions?: { [key: number]: boolean },
  setShowLanguageSuggestions?: any,
  declarationSearch?: string,
  setDeclarationSearch?: any,
  hobbyInput?: string,
  setHobbyInput?: any,
  showHobbySuggestions?: boolean,
  setShowHobbySuggestions?: any
) => {
  const handleChange = (name: string, value: any) => {
    onChange(name, value);
  };

  switch (type) {
    case "personal_info":
      return (
        <div className="animate-fade-in-up space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-2 border-b border-gray-100">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                {data.photoUrl ? (
                  <img
                    src={data.photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={28} className="text-gray-300" />
                )}
                {photoHelpers?.uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => photoHelpers?.fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-blue-600 transition-all hover:scale-110"
                >
                  <UploadIcon size={14} />
                </button>
              </div>
              <input
                ref={photoHelpers?.fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={photoHelpers?.handlePhotoUpload}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                Profile Photo
              </h3>
              <p className="text-[11px] text-gray-500 mb-2">
                Upload a professional photo to make your resume stand out.
              </p>
              {data.photoUrl && (
                <button
                  onClick={() => handleChange("photoUrl", "")}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-1.5 mx-auto sm:mx-0"
                >
                  <DeleteIcon size={12} /> Remove Photo
                </button>
              )}
              <label className="flex items-center gap-2 cursor-pointer mt-2 w-max">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={data.showPhoto !== false}
                    onChange={(e) =>
                      handleChange("showPhoto", e.target.checked)
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Show Photo
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={data.name}
              required
              onChange={(e: any) => handleChange("name", e.target.value)}
              placeholder="John Doe"
            />
            <div className="relative w-full">
              <Input
                label="Job Title"
                value={data.jobTitle}
                required
                onChange={(e: any) => {
                  handleChange("jobTitle", e.target.value);
                  setJobTitleInput(e.target.value);
                  setShowJobTitleSuggestions(true);
                }}
                placeholder="Software Engineer"
              />
              {showJobTitleSuggestions && jobTitleInput && (
                <div className="absolute z-20 w-full mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  {POPULAR_JOB_TITLES.filter((title) =>
                    title
                      .toLowerCase()
                      .includes((jobTitleInput || "").toLowerCase())
                  )
                    .slice(0, 10)
                    .map((title) => (
                      <button
                        key={title}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onChange("jobTitle", title);
                          if (setJobTitleInput) setJobTitleInput(title);
                          if (setShowJobTitleSuggestions)
                            setShowJobTitleSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-600 border-b border-gray-100 last:border-b-0"
                      >
                        {title}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              value={data.email}
              required
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="pt-3 border-t border-gray-100 mt-1">
            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
              <LinkIcon size={14} className="text-gray-400" /> Social Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      const suggestions = [
        // Tech & Engineering
        "Results-oriented professional with a strong track record of success in building high-scale applications and managing cross-functional teams.",
        "Passionate and innovative developer with expertise in modern web technologies and a commitment to delivering high-quality user experiences.",
        "Accomplished specialist with extensive experience in strategic planning, cloud architecture, and optimizing enterprise-grade systems.",
        "Detail-oriented software engineer with proven ability to solve complex problems and deliver scalable solutions on time.",

        // Business & Management
        "Strategic business leader with proven expertise in driving growth, optimizing operations, and building high-performing teams.",
        "Dynamic project manager with exceptional organizational skills and a track record of delivering projects on time and within budget.",
        "Results-driven operations manager skilled in process improvement, supply chain optimization, and team leadership.",
        "Experienced executive with a strong background in strategic planning, P&L management, and business development.",

        // Marketing & Sales
        "Creative marketing professional with expertise in digital campaigns, brand development, and data-driven strategy.",
        "Customer-focused sales specialist with proven ability to exceed targets and build long-lasting client relationships.",
        "Strategic content creator with a passion for storytelling and a track record of driving engagement across multiple platforms.",
        "Growth-oriented marketing manager skilled in SEO, social media, and conversion optimization.",

        // Finance & Accounting
        "Detail-oriented financial analyst with strong analytical skills and expertise in budgeting, forecasting, and financial reporting.",
        "Certified accountant with extensive experience in tax preparation, auditing, and compliance management.",
        "Strategic finance professional skilled in risk management, investment analysis, and corporate finance.",

        // HR & Recruitment
        "People-focused HR professional with expertise in talent acquisition, employee relations, and organizational development.",
        "Strategic recruiter with a proven track record of identifying top talent and building strong recruitment pipelines.",
        "Experienced HR manager skilled in performance management, compensation planning, and policy development.",

        // Design & Creative
        "Creative designer with a keen eye for aesthetics and expertise in UX/UI design, branding, and visual communication.",
        "Innovative graphic designer skilled in creating compelling visuals that tell stories and drive engagement.",
        "User-centered product designer with experience in research, prototyping, and delivering intuitive digital experiences.",

        // Healthcare
        "Compassionate healthcare professional dedicated to providing exceptional patient care and improving health outcomes.",
        "Licensed nurse with strong clinical skills and a commitment to patient safety and evidence-based practice.",
        "Healthcare administrator with expertise in operations management, regulatory compliance, and quality improvement.",

        // Education
        "Dedicated educator with a passion for student success and expertise in curriculum development and classroom management.",
        "Experienced academic professional skilled in instructional design, assessment, and fostering inclusive learning environments.",

        // Customer Service & Support
        "Customer-centric professional with excellent communication skills and a proven ability to resolve issues efficiently.",
        "Dedicated support specialist with expertise in troubleshooting, client relations, and service excellence.",

        // Legal
        "Detail-oriented legal professional with strong research skills and expertise in contract negotiation and compliance.",
        "Experienced attorney with proven success in litigation, legal counsel, and risk mitigation.",

        // Data & Analytics
        "Data-driven analyst with expertise in statistical modeling, data visualization, and actionable insights generation.",
        "Business intelligence professional skilled in SQL, Python, and transforming complex data into strategic recommendations.",
      ];

      return (
        <div className="animate-fade-in-up space-y-2">
          <Textarea
            label="Professional Summary"
            value={data.text}
            rows={10}
            onChange={(e: any) => handleChange("text", e.target.value)}
            placeholder="A brief overview of your career highlights, skills, and goals..."
            required
          />

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <SparklesIcon className="w-3 h-3" /> Quick Suggestions
            </h4>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by role, industry, or keyword..."
              value={suggestionSearch || ""}
              onChange={(e) => setSuggestionSearch?.(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-blue-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="space-y-1.5">
              {(() => {
                // Filter suggestions based on search
                const safeSearch = suggestionSearch || "";
                const filtered = safeSearch.trim()
                  ? suggestions.filter((s) =>
                      s.toLowerCase().includes(safeSearch.toLowerCase())
                    )
                  : suggestions;

                // Show max 3 results
                const displayed = filtered.slice(0, 3);

                if (displayed.length === 0) {
                  return (
                    <p className="text-xs text-gray-500 italic p-2">
                      No suggestions found. Try a different search term.
                    </p>
                  );
                }

                return displayed.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleChange("text", s)}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-blue-100 text-[11px] text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-all leading-relaxed shadow-sm"
                  >
                    {s}
                  </button>
                ));
              })()}
            </div>

            {suggestionSearch?.trim() &&
              suggestions.filter((s) =>
                s.toLowerCase().includes((suggestionSearch || "").toLowerCase())
              ).length > 3 && (
                <p className="text-[9px] text-blue-600 mt-1.5 italic">
                  Showing 3 of{" "}
                  {
                    suggestions.filter((s) =>
                      s
                        .toLowerCase()
                        .includes((suggestionSearch || "").toLowerCase())
                    ).length
                  }{" "}
                  results. Refine your search to see more.
                </p>
              )}
          </div>
        </div>
      );

    case "experience":
      return (
        <div className="space-y-3 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm space-y-2 relative group hover:shadow-md transition-shadow"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={item.company || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "company", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="e.g. Google, Microsoft"
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Role / Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={item.position || ""}
                    onChange={(e) => {
                      onArrayChange(idx, "position", e.target.value);
                      if (
                        setExpPositionInputs &&
                        setShowExpPositionSuggestions
                      ) {
                        setExpPositionInputs({
                          ...expPositionInputs,
                          [idx]: e.target.value,
                        });
                        setShowExpPositionSuggestions({
                          ...showExpPositionSuggestions,
                          [idx]: true,
                        });
                      }
                    }}
                    onBlur={() => {
                      if (setShowExpPositionSuggestions) {
                        setTimeout(() => {
                          setShowExpPositionSuggestions({
                            ...showExpPositionSuggestions,
                            [idx]: false,
                          });
                        }, 200);
                      }
                    }}
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="e.g. Senior Software Engineer"
                  />
                  {showExpPositionSuggestions?.[idx] &&
                    item.position &&
                    item.position.length > 0 &&
                    POPULAR_JOB_TITLES.filter((title) =>
                      title.toLowerCase().includes(item.position.toLowerCase())
                    ).length > 0 && (
                      <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                        {POPULAR_JOB_TITLES.filter((title) =>
                          title
                            .toLowerCase()
                            .includes(item.position.toLowerCase())
                        )
                          .slice(0, 10)
                          .map((title) => (
                            <button
                              key={title}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onArrayChange(idx, "position", title);
                                if (
                                  setExpPositionInputs &&
                                  setShowExpPositionSuggestions
                                ) {
                                  setExpPositionInputs({
                                    ...expPositionInputs,
                                    [idx]: "",
                                  });
                                  setShowExpPositionSuggestions({
                                    ...showExpPositionSuggestions,
                                    [idx]: false,
                                  });
                                }
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-600 border-b border-gray-100 last:border-b-0"
                            >
                              {title}
                            </button>
                          ))}
                      </div>
                    )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={item.startDate || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "startDate", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="MM/YYYY or Year"
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
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Description / Responsibilities</span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDesc = item.description || "";
                      const newBullet = "\n• ";
                      onArrayChange(
                        idx,
                        "description",
                        currentDesc + newBullet
                      );
                    }}
                    className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-bold uppercase tracking-wide transition-colors"
                  >
                    + Add Bullet
                  </button>
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    onArrayChange(idx, "description", e.target.value)
                  }
                  rows={5}
                  className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder="• Describe your responsibilities and achievements...&#10;• Use bullet points for better readability&#10;• Start each line with '• '"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <BriefcaseIcon size={16} /> Add Experience
          </button>
        </div>
      );

    case "education":
      return (
        <div className="space-y-3 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm space-y-2 relative group hover:shadow-md transition-shadow"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Institution / University"
                  value={item.institution}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "institution", e.target.value)
                  }
                  placeholder="Harvard University"
                />
                <div className="relative">
                  <Input
                    label="Degree / Field of Study"
                    value={item.degree}
                    required
                    onChange={(e: any) => {
                      onArrayChange(idx, "degree", e.target.value);
                      if (setDegreeInputs && setShowDegreeSuggestions) {
                        setDegreeInputs({
                          ...degreeInputs,
                          [idx]: e.target.value,
                        });
                        setShowDegreeSuggestions({
                          ...showDegreeSuggestions,
                          [idx]: true,
                        });
                      }
                    }}
                    placeholder="Bachelor of Computer Science"
                  />
                  {showDegreeSuggestions?.[idx] &&
                    item.degree &&
                    item.degree.length > 0 &&
                    POPULAR_DEGREES.filter((d) =>
                      d.toLowerCase().includes(item.degree.toLowerCase())
                    ).length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                        {POPULAR_DEGREES.filter((d) =>
                          d.toLowerCase().includes(item.degree.toLowerCase())
                        )
                          .slice(0, 10)
                          .map((degree) => (
                            <button
                              key={degree}
                              onClick={() => {
                                onArrayChange(idx, "degree", degree);
                                if (
                                  setDegreeInputs &&
                                  setShowDegreeSuggestions
                                ) {
                                  setDegreeInputs({
                                    ...degreeInputs,
                                    [idx]: "",
                                  });
                                  setShowDegreeSuggestions({
                                    ...showDegreeSuggestions,
                                    [idx]: false,
                                  });
                                }
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-600 border-b border-gray-100 last:border-b-0"
                            >
                              {degree}
                            </button>
                          ))}
                      </div>
                    )}
                </div>
                <Input
                  label="Graduation Date"
                  value={item.graduationDate}
                  onChange={(e: any) =>
                    onArrayChange(idx, "graduationDate", e.target.value)
                  }
                  placeholder="May 2020"
                />
                <Input
                  label="Location"
                  value={item.location}
                  onChange={(e: any) =>
                    onArrayChange(idx, "location", e.target.value)
                  }
                  placeholder="Stanford, CA"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <GraduationCapIcon size={16} /> Add Education
          </button>
        </div>
      );

    case "skills":
      if (
        !setSkillInput ||
        !setShowSuggestions ||
        skillInput === undefined ||
        showSuggestions === undefined
      )
        return null;

      const filteredSkills = POPULAR_SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(skillInput.toLowerCase()) &&
          !(data.items || []).some(
            (s: any) =>
              (typeof s === "string" ? s : s.name).toLowerCase() ===
              skill.toLowerCase()
          )
      ).slice(0, 10);

      const addSkill = (skillName: string) => {
        const exists = (data.items || []).some(
          (s: any) =>
            (typeof s === "string" ? s : s.name).toLowerCase() ===
            skillName.toLowerCase()
        );
        if (!exists && skillName.trim()) {
          const newItems = [...(data.items || []), { name: skillName }];
          onChange("items", newItems);
        }
        setSkillInput("");
        setShowSuggestions(false);
      };

      return (
        <div className="space-y-6 animate-fade-in-up">
          {/* Main Input Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Add Skills
            </label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() =>
                      skillInput.length > 0 && setShowSuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    placeholder="E.g. Project Management, React, Leadership..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all"
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && skillInput.trim()) {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white border border-gray-200 text-gray-400 text-[10px] font-bold rounded-md shadow-sm">
                      Enter
                    </kbd>
                  </div>
                </div>
                <button
                  onClick={() => skillInput.trim() && addSkill(skillInput)}
                  className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10"
                >
                  Add
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSkills.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden ring-1 ring-black/5">
                  <div className="p-2 bg-gray-50/50 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                      Suggestions
                    </p>
                  </div>
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addSkill(skill);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-all text-sm font-medium text-gray-700 hover:text-blue-700 border-b border-gray-50 last:border-b-0 flex items-center justify-between group"
                    >
                      {skill}
                      <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-xs font-bold">
                        + Add
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Added Skills List */}
          {(data.items || []).length > 0 && (
            <div className="bg-white border-2 border-gray-100 border-dashed rounded-xl p-6">
              <div className="flex flex-wrap gap-2">
                {(data.items || []).map((skill: any, idx: number) => {
                  const skillName =
                    typeof skill === "string" ? skill : skill.name;
                  return (
                    <span
                      key={idx}
                      className="group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold transition-all hover:bg-blue-100 hover:border-blue-200 hover:shadow-sm"
                    >
                      <span>{skillName}</span>
                      <button
                        onClick={() => onRemove("items", idx)}
                        className="w-4 h-4 rounded hover:bg-white flex items-center justify-center text-blue-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State Hint */}
          {(data.items || []).length === 0 && (
            <div className="text-center py-8 opacity-50">
              <p className="text-sm font-medium text-gray-400">
                Start typing to add your top skills
              </p>
            </div>
          )}
        </div>
      );

    case "projects":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Project Title"
                  value={item.title}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "title", e.target.value)
                  }
                  placeholder="e.g. AI Portfolio Builder"
                />
                <Input
                  label="Technologies"
                  value={item.technologies}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "technologies", e.target.value)
                  }
                  placeholder="e.g. Next.js, OpenAI, Supabase"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Link / URL"
                  value={item.link}
                  onChange={(e: any) =>
                    onArrayChange(idx, "link", e.target.value)
                  }
                  placeholder="https://github.com/..."
                />
                <Input
                  label="Date"
                  value={item.date}
                  onChange={(e: any) =>
                    onArrayChange(idx, "date", e.target.value)
                  }
                  placeholder="2022"
                />
              </div>
              <Textarea
                label="Description"
                value={item.description}
                onChange={(e: any) =>
                  onArrayChange(idx, "description", e.target.value)
                }
                placeholder="Describe what you built and the impact..."
              />
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <PortfolioIcon size={16} /> Add Project
          </button>
        </div>
      );

    case "certifications":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Certification Name"
                  value={item.title}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "title", e.target.value)
                  }
                  placeholder="e.g. AWS Solutions Architect"
                />
                <Input
                  label="Issuing Organization"
                  value={item.issuer}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "issuer", e.target.value)
                  }
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date"
                  value={item.date}
                  onChange={(e: any) =>
                    onArrayChange(idx, "date", e.target.value)
                  }
                  placeholder="2023"
                />
                <Input
                  label="Credential URL"
                  value={item.url}
                  onChange={(e: any) =>
                    onArrayChange(idx, "url", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <AwardIcon size={16} /> Add Certification
          </button>
        </div>
      );

    case "achievements":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Achievement Title"
                  value={item.title}
                  onChange={(e: any) =>
                    onArrayChange(idx, "title", e.target.value)
                  }
                  placeholder="Best Employee of the Year"
                />
                <Input
                  label="Date"
                  value={item.date}
                  onChange={(e: any) =>
                    onArrayChange(idx, "date", e.target.value)
                  }
                  placeholder="2023"
                />
              </div>
              <Textarea
                label="Description"
                value={item.description}
                onChange={(e: any) =>
                  onArrayChange(idx, "description", e.target.value)
                }
                placeholder="Details about the achievement..."
              />
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <AwardIcon size={16} /> Add Achievement
          </button>
        </div>
      );

    case "declaration":
      const declarationSuggestions = [
        "I hereby declare that the above-mentioned information is correct to the best of my knowledge.",
        "I solemnly declare that the information provided above is true and correct.",
        "I certify that the information contained in this resume is correct to the best of my knowledge.",
        "All the information provided in this resume is true and accurate to the best of my belief and record.",
        "I hereby certify that all information provided in this document is accurate and complete.",
      ];

      return (
        <div className="animate-fade-in-up space-y-4">
          <Textarea
            label="Declaration Text"
            value={data.text}
            rows={5}
            onChange={(e: any) => handleChange("text", e.target.value)}
            placeholder="I hereby declare that the above-mentioned information is correct to the best of my knowledge..."
          />

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <SparklesIcon className="w-3 h-3" /> Declaration Templates
            </h4>

            <input
              type="text"
              placeholder="Filter templates..."
              value={declarationSearch || ""}
              onChange={(e) => setDeclarationSearch?.(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-blue-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="space-y-1.5">
              {(() => {
                const safeSearch = declarationSearch || "";
                const filtered = safeSearch.trim()
                  ? declarationSuggestions.filter((s) =>
                      s.toLowerCase().includes(safeSearch.toLowerCase())
                    )
                  : declarationSuggestions;

                if (filtered.length === 0) {
                  return (
                    <p className="text-xs text-gray-500 italic p-2">
                      No matching templates found.
                    </p>
                  );
                }

                return filtered.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleChange("text", s)}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-blue-100 text-[11px] text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-all leading-relaxed shadow-sm"
                  >
                    {s}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      );

    case "languages":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 relative group"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="relative">
                <Input
                  label="Language"
                  value={item.language}
                  onChange={(e: any) => {
                    onArrayChange(idx, "language", e.target.value);
                    if (setLanguageInputs && setShowLanguageSuggestions) {
                      setLanguageInputs({
                        ...languageInputs,
                        [idx]: e.target.value,
                      });
                      setShowLanguageSuggestions({
                        ...showLanguageSuggestions,
                        [idx]: true,
                      });
                    }
                  }}
                  onBlur={() => {
                    if (setShowLanguageSuggestions) {
                      setTimeout(() => {
                        setShowLanguageSuggestions({
                          ...showLanguageSuggestions,
                          [idx]: false,
                        });
                      }, 200);
                    }
                  }}
                  placeholder="English"
                />
                {showLanguageSuggestions?.[idx] &&
                  item.language &&
                  item.language.length > 0 &&
                  POPULAR_LANGUAGES.filter((l) =>
                    l.toLowerCase().includes(item.language.toLowerCase())
                  ).length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                      {POPULAR_LANGUAGES.filter((l) =>
                        l.toLowerCase().includes(item.language.toLowerCase())
                      )
                        .slice(0, 5)
                        .map((l) => (
                          <button
                            key={l}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onArrayChange(idx, "language", l);
                              if (
                                setLanguageInputs &&
                                setShowLanguageSuggestions
                              ) {
                                setLanguageInputs({
                                  ...languageInputs,
                                  [idx]: "",
                                });
                                setShowLanguageSuggestions({
                                  ...showLanguageSuggestions,
                                  [idx]: false,
                                });
                              }
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-600 border-b border-gray-100 last:border-b-0"
                          >
                            {l}
                          </button>
                        ))}
                    </div>
                  )}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Proficiency
                </label>
                <select
                  value={item.proficiency || ""}
                  onChange={(e) =>
                    onArrayChange(idx, "proficiency", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">Select...</option>
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <GlobeIcon size={16} /> Add Language
          </button>
        </div>
      );

    case "volunteering":
      return (
        <div className="space-y-4 animate-fade-in-up">
          <p className="text-xs text-gray-500 mb-4">
            Add volunteer experience or community service.
          </p>
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 relative group"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Organization"
                  value={item.organization}
                  onChange={(e: any) =>
                    onArrayChange(idx, "organization", e.target.value)
                  }
                  placeholder="Red Cross"
                />
                <Input
                  label="Role"
                  value={item.role}
                  onChange={(e: any) =>
                    onArrayChange(idx, "role", e.target.value)
                  }
                  placeholder="Volunteer Coordinator"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  value={item.startDate}
                  onChange={(e: any) =>
                    onArrayChange(idx, "startDate", e.target.value)
                  }
                  placeholder="Jan 2020"
                />
                <Input
                  label="End Date"
                  value={item.endDate}
                  onChange={(e: any) =>
                    onArrayChange(idx, "endDate", e.target.value)
                  }
                  placeholder="Present"
                />
              </div>
              <Textarea
                label="Description"
                value={item.description}
                onChange={(e: any) =>
                  onArrayChange(idx, "description", e.target.value)
                }
                placeholder="Briefly describe your contributions..."
              />
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            + Add Experience
          </button>
        </div>
      );

    case "publications":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {/* <p className="text-xs text-gray-500 mb-4">
            List your research papers, articles, or books.
          </p> */}
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 relative group"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <Input
                label="Title"
                value={item.title}
                onChange={(e: any) =>
                  onArrayChange(idx, "title", e.target.value)
                }
                placeholder="The Future of AI"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Publisher/Journal"
                  value={item.publisher}
                  onChange={(e: any) =>
                    onArrayChange(idx, "publisher", e.target.value)
                  }
                  placeholder="IEEE"
                />
                <Input
                  label="Date"
                  value={item.date}
                  onChange={(e: any) =>
                    onArrayChange(idx, "date", e.target.value)
                  }
                  placeholder="March 2023"
                />
              </div>
              <Input
                label="URL (Optional)"
                value={item.url}
                onChange={(e: any) => onArrayChange(idx, "url", e.target.value)}
                placeholder="https://example.com/paper"
              />
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            + Add Publication
          </button>
        </div>
      );

    case "hobbies":
      if (
        hobbyInput === undefined ||
        showHobbySuggestions === undefined ||
        !setHobbyInput ||
        !setShowHobbySuggestions
      )
        return null;

      const filteredHobbies = POPULAR_HOBBIES.filter(
        (hobby) =>
          hobby.toLowerCase().includes(hobbyInput.toLowerCase()) &&
          !(data.items || []).some(
            (h: any) =>
              (typeof h === "string" ? h : h.name || h.hobby).toLowerCase() ===
              hobby.toLowerCase()
          )
      ).slice(0, 10);

      const addHobby = (hobbyName: string) => {
        const exists = (data.items || []).some(
          (h: any) =>
            (typeof h === "string" ? h : h.name || h.hobby).toLowerCase() ===
            hobbyName.toLowerCase()
        );
        if (!exists && hobbyName.trim()) {
          const newItems = [...(data.items || []), { name: hobbyName }];
          onChange("items", newItems);
        }
        setHobbyInput("");
        setShowHobbySuggestions(false);
      };

      return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Add Interests / Hobbies
            </label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={hobbyInput}
                    onChange={(e) => {
                      setHobbyInput(e.target.value);
                      setShowHobbySuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() =>
                      hobbyInput.length > 0 && setShowHobbySuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowHobbySuggestions(false), 200)
                    }
                    placeholder="E.g. Chess, Photography, Hiking..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all"
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && hobbyInput.trim()) {
                        e.preventDefault();
                        addHobby(hobbyInput);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => hobbyInput.trim() && addHobby(hobbyInput)}
                  className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10"
                >
                  Add
                </button>
              </div>

              {showHobbySuggestions && filteredHobbies.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden ring-1 ring-black/5">
                  <div className="p-2 bg-gray-50/50 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                      Suggestions
                    </p>
                  </div>
                  {filteredHobbies.map((hobby) => (
                    <button
                      key={hobby}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addHobby(hobby);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-all text-sm font-medium text-gray-700 hover:text-blue-700 border-b border-gray-50 last:border-b-0 flex items-center justify-between group"
                    >
                      {hobby}
                      <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-xs font-bold">
                        + Add
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(data.items || []).length > 0 && (
            <div className="bg-white border-2 border-gray-100 border-dashed rounded-xl p-6">
              <div className="flex flex-wrap gap-2">
                {(data.items || []).map((hobby: any, idx: number) => {
                  const hobbyName =
                    typeof hobby === "string"
                      ? hobby
                      : hobby.name || hobby.hobby;
                  return (
                    <span
                      key={idx}
                      className="group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 hover:shadow-sm"
                    >
                      <span>{hobbyName}</span>
                      <button
                        onClick={() => onRemove("items", idx)}
                        className="w-4 h-4 rounded hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );

    case "references":
      return (
        <div className="space-y-4 animate-fade-in-up">
          {(data.items || []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 relative group"
            >
              <button
                onClick={() => onRemove("items", idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Name"
                  value={item.name}
                  onChange={(e: any) =>
                    onArrayChange(idx, "name", e.target.value)
                  }
                  placeholder="John Smith"
                />
                <Input
                  label="Title"
                  value={item.title}
                  onChange={(e: any) =>
                    onArrayChange(idx, "title", e.target.value)
                  }
                  placeholder="Senior Manager"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Company"
                  value={item.company}
                  onChange={(e: any) =>
                    onArrayChange(idx, "company", e.target.value)
                  }
                  placeholder="ABC Corporation"
                />
                <Input
                  label="Email"
                  value={item.email}
                  onChange={(e: any) =>
                    onArrayChange(idx, "email", e.target.value)
                  }
                  placeholder="john@example.com"
                />
              </div>
              <Input
                label="Phone (Optional)"
                value={item.phone}
                onChange={(e: any) =>
                  onArrayChange(idx, "phone", e.target.value)
                }
                placeholder="+1 234 567 8900"
              />
            </div>
          ))}
          <button
            onClick={() => onAdd()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            + Add Reference
          </button>
        </div>
      );

    default:
      return (
        <div className="text-center py-12 text-gray-400">
          Section specific form not implemented yet for {type}
        </div>
      );
  }
};

export default ResumeEditor;
