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
} from "@/components/Icons";

import { ResumeRenderer } from "../../../../components/ResumeRenderer";
import { ResumePreviewModal } from "../../../../components/ResumePreviewModal";
import { ATSChecker } from "@/components/ai/ATSChecker";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATE_REGISTRY } from "@/lib/template-registry";
import { POPULAR_DEGREES } from "@/lib/constants/degrees";
import { POPULAR_SKILLS } from "@/lib/constants/skills";
import { POPULAR_JOB_TITLES } from "@/lib/constants/jobTitles";

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
  const [resumeTitle, setResumeTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const baseSectionTypes = [
    { id: "personal_info", label: "Personal Info", Icon: UserIcon },
    { id: "summary", label: "Summary", Icon: DocumentIcon },
    { id: "experience", label: "Experience", Icon: BriefcaseIcon },
    { id: "education", label: "Education", Icon: GraduationCapIcon },
    { id: "skills", label: "Skills", Icon: ZapIcon },
    { id: "projects", label: "Projects", Icon: PortfolioIcon },
    { id: "certifications", label: "Certifications", Icon: AwardIcon },
    { id: "achievements", label: "Achievements", Icon: AwardIcon },
    { id: "languages", label: "Languages", Icon: GlobeIcon },
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
        if (data.data.settings) setSettings(data.data.settings);
        if (data.data.title) setResumeTitle(data.data.title);

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

    // Filter Hidden by section_type
    const hidden = settings?.hidden_sections || [];
    return sorted.filter((s) => !hidden.includes(s.section_type));
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

      <ATSChecker
        isOpen={showATSModal}
        onClose={() => setShowATSModal(false)}
        resumeData={resume}
        resumeId={id as string}
      />

      {/* Main Editor UI - Hidden on Print */}
      <div className="flex-1 flex flex-col overflow-hidden no-print">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/resume")}
              className="text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {isEditingTitle ? (
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                onBlur={handleTitleUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleTitleUpdate()}
                className="font-bold text-lg text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent min-w-[200px]"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="font-bold text-lg text-gray-900 truncate max-w-[200px] hidden md:block cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                title="Click to rename"
              >
                {resumeTitle || resume?.title || "Untitled Resume"}
              </h1>
            )}
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Manual Save Button */}
            <button
              onClick={() => saveSection()}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isDirty
                  ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 active:scale-95"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isDirty ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                }`}
              />
              {isDirty ? (
                <span className="hidden xs:inline">Save Changes</span>
              ) : (
                "Saved"
              )}
              {isDirty && <span className="xs:hidden">Save</span>}
            </button>

            <button
              onClick={() => setShowATSModal(true)}
              className="px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] sm:text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 mr-2"
            >
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">ATS Score</span>
            </button>

            <button
              onClick={() => {
                if (isDirty) saveSection();
                setShowGenerationModal(true);
              }}
              className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-sm font-bold hover:bg-black transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-gray-900/10"
            >
              <ZapIcon size={14} className="text-yellow-400" />
              <span className="hidden sm:inline">Generate Resume</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </div>
        </header>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Form Editor (60%) */}
          <div className="w-full lg:w-3/5 flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            {/* Mobile Section Selection Header */}
            <div className="lg:hidden p-4 border-b border-gray-100 bg-white sticky top-0 z-20 flex items-center justify-between shadow-sm">
              <div
                className="flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Current Section
                  </span>
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                    {sectionTypes.find((s) => s.id === activeTab)?.label}
                    <ChevronDownIcon size={16} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                {activeSectionIndex + 1} / {sectionTypes.length}
              </div>
            </div>

            {/* Mobile Section Drawer */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex flex-col justify-end bg-gray-900/60 backdrop-blur-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-white rounded-t-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto w-full max-w-lg mx-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">
                          Jump to Section
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                          Navigate through steps
                        </p>
                      </div>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <ChevronDownIcon size={24} className="rotate-0" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {sectionTypes.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            handleStepChange(s.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                            activeTab === s.id
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-600/5 ring-4 ring-blue-50"
                              : "border-gray-50 hover:border-gray-100 hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                activeTab === s.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <s.Icon size={20} />
                            </div>
                            <span className="font-black text-sm tracking-tight text-left">
                              {s.label}
                            </span>
                          </div>
                          {activeTab === s.id && (
                            <div className="bg-blue-600 text-white rounded-full p-1.5">
                              <CheckIcon size={14} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
              <div className="max-w-2xl mx-auto p-6 md:p-10 pb-32">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {sectionTypes.find((s) => s.id === activeTab)?.label}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Fill in the details below.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isDirty ? (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium border border-amber-100">
                        Unsaved Changes
                      </span>
                    ) : (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium border border-green-100">
                        Saved
                      </span>
                    )}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {renderSectionForm(
                      activeTab,
                      formData[activeTab],
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
                      setShowDegreeSuggestions
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sticky Navigation Footer */}
            <div className="shrink-0 p-4 sm:p-5 bg-white border-t border-gray-100 flex justify-between items-center z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                disabled={activeSectionIndex === 0}
                onClick={() =>
                  handleStepChange(sectionTypes[activeSectionIndex - 1].id)
                }
                className="px-6 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Back
              </button>
              <div className="hidden sm:flex items-center gap-1.5 h-1.5 px-4 bg-gray-50 rounded-full">
                {sectionTypes.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === activeSectionIndex
                        ? "bg-blue-600 w-4"
                        : i < activeSectionIndex
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={async () => {
                  if (activeSectionIndex === sectionTypes.length - 1) {
                    await saveSection();
                    setShowGenerationModal(true);
                  } else {
                    handleStepChange(sectionTypes[activeSectionIndex + 1].id);
                  }
                }}
                className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3"
              >
                {activeSectionIndex === sectionTypes.length - 1
                  ? "Finish & Generate"
                  : "Next Step"}
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Preview Fab */}
          <div className="lg:hidden absolute bottom-24 right-6 z-30">
            <button
              onClick={() => setShowPreview(true)}
              className="bg-blue-900 text-white p-4 rounded-full shadow-xl hover:bg-blue-800 transition-colors"
            >
              <EyeIcon size={24} />
            </button>
          </div>

          {/* RIGHT: Live Preview (40%) */}
          <div className="hidden lg:flex w-2/5 bg-slate-100 overflow-y-auto flex-col items-center px-8 relative custom-scrollbar overflow-x-hidden">
            {/* Sticky Template Switcher Overlay - Pane Level */}
            <div className="sticky top-0 right-0 z-50 w-full flex justify-end bg-slate-100/60 backdrop-blur-md pointer-events-none">
              <div className="pointer-events-auto bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm flex items-center gap-2 mr-4 mt-4">
                <TemplateIcon size={12} className="text-gray-400" />
                <select
                  value={template}
                  onChange={(e) =>
                    handlePreferencesSave(e.target.value, themeColor)
                  }
                  className="bg-transparent text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-all outline-none appearance-none cursor-pointer pr-4"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right center",
                    backgroundSize: "0.6rem",
                  }}
                >
                  {TEMPLATE_REGISTRY.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sticky top-0 pb-8 origin-top scale-[0.65] xl:scale-[0.8] flex flex-col items-center">
              <div
                className="bg-white shadow-2xl shadow-slate-200/50 rounded-sm overflow-hidden transition-all duration-300 transform"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                }}
              >
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
        </div>

        {/* Modals */}
        <ResumePreviewModal
          isOpen={showPreview || showGenerationModal}
          onClose={() => {
            setShowPreview(false);
            setShowGenerationModal(false);
          }}
          resume={resume || { title: "New Resume" }}
          sections={getPreviewSections()}
          template={template}
          themeColor={themeColor}
          settings={settings}
          onSave={handlePreferencesSave}
        />
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
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      placeholder={placeholder}
      list={list}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
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
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <textarea
      value={value || ""}
      onChange={onChange ? onChange : undefined}
      name={name}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium resize-none shadow-inner"
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
  setShowDegreeSuggestions?: any
) => {
  const handleChange = (name: string, value: any) => {
    onChange(name, value);
  };

  switch (type) {
    case "personal_info":
      return (
        <div className="space-y-1 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={data.name}
              required
              onChange={(e: any) => handleChange("name", e.target.value)}
              placeholder="John Doe"
            />
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Job Title <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={
                  jobTitleInput !== undefined
                    ? jobTitleInput
                    : data.jobTitle || ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (setJobTitleInput) setJobTitleInput(val);
                  onChange("jobTitle", val);
                  if (setShowJobTitleSuggestions)
                    setShowJobTitleSuggestions(val.length > 0);
                }}
                onFocus={() =>
                  jobTitleInput &&
                  setShowJobTitleSuggestions &&
                  setShowJobTitleSuggestions(true)
                }
                onBlur={() =>
                  setShowJobTitleSuggestions &&
                  setTimeout(() => setShowJobTitleSuggestions(false), 200)
                }
                placeholder="Software Engineer"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1">
            <Input
              label="Photo URL"
              value={data.photoUrl}
              onChange={(e: any) => handleChange("photoUrl", e.target.value)}
              placeholder="https://example.com/photo.jpg"
              helperText="Provide a public link to your profile photo (ideal for portfolios)."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
        "Results-oriented professional with a strong track record of success in building high-scale applications and managing cross-functional teams.",
        "Passionate and innovative developer with expertise in modern web technologies and a commitment to delivering high-quality user experiences.",
        "Accomplished specialist with extensive experience in strategic planning, cloud architecture, and optimizing enterprise-grade systems.",
        "Dynamic leader and team player with a solid foundation in software engineering and a focus on driving continuous improvement.",
        "Resourceful and analytical thinker with a passion for solving complex technical challenges and a history of successful project delivery.",
      ];

      return (
        <div className="animate-fade-in-up space-y-6">
          <Textarea
            label="Professional Summary"
            value={data.text}
            rows={12}
            onChange={(e: any) => handleChange("text", e.target.value)}
            placeholder="A brief overview of your career highlights, skills, and goals..."
            required
          />

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 sm:p-5">
            <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <SparklesIcon className="w-3 h-3" /> Quick Suggestions
            </h4>
            <div className="flex flex-col gap-2.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleChange("text", s)}
                  className="text-left p-3 rounded-lg bg-white border border-gray-100 text-[11px] leading-relaxed text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm transition-all active:scale-[0.99]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Role / Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={item.position || ""}
                    onChange={(e) =>
                      onArrayChange(idx, "position", e.target.value)
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="e.g. Senior Software Engineer"
                  />
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
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    onArrayChange(idx, "description", e.target.value)
                  }
                  rows={3}
                  className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder="Describe your responsibilities and achievements..."
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
        <div className="space-y-4 animate-fade-in-up">
          <datalist id="degree-suggestions">
            {POPULAR_DEGREES.map((degree) => (
              <option key={degree} value={degree} />
            ))}
          </datalist>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="School / University"
                  value={item.school}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "school", e.target.value)
                  }
                  placeholder="e.g. Stanford University"
                />
                <Input
                  label="Degree / Field of Study"
                  value={item.degree}
                  required
                  onChange={(e: any) =>
                    onArrayChange(idx, "degree", e.target.value)
                  }
                  placeholder="e.g. BSc Computer Science"
                  list="degree-suggestions"
                />
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
        <div className="space-y-3 animate-fade-in-up">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <ZapIcon size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Your Skills</h3>
                <p className="text-[10px] text-gray-500">
                  Showcase your expertise
                </p>
              </div>
            </div>
          </div>

          {/* Compact Input Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Add New Skill
            </label>
            <div className="relative">
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
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type a skill..."
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium transition-all"
                onKeyDown={(e: any) => {
                  if (e.key === "Enter" && skillInput.trim()) {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded">
                  Enter
                </kbd>
              </div>

              {/* Enhanced Suggestions Dropdown */}
              {showSuggestions && filteredSkills.length > 0 && (
                <div className="absolute z-20 w-full mt-3 bg-white border-2 border-blue-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
                  <div className="p-2 bg-blue-50 border-b border-blue-100">
                    <p className="text-xs font-bold text-blue-700 px-2">
                      💡 Suggested Skills
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
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-all text-sm font-medium text-gray-700 hover:text-blue-600 border-b border-gray-100 last:border-b-0 group"
                    >
                      <span className="flex items-center justify-between">
                        <span>{skill}</span>
                        <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Added Skills Display */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900">
                Added Skills
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {(data.items || []).length}
                </span>
              </h4>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {(data.items || []).map((skill: any, idx: number) => {
                const skillName =
                  typeof skill === "string" ? skill : skill.name;
                return (
                  <span
                    key={idx}
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <span>{skillName}</span>
                    <button
                      onClick={() => onRemove("items", idx)}
                      className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {(data.items || []).length === 0 && (
                <div className="w-full text-center py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-400 text-sm font-medium">
                    No skills added yet
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Start typing to add your first skill
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Categorized Popular Skills */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✨</span>
              Popular Skills by Category
            </h4>

            <div className="space-y-4">
              {/* Technical Skills */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  💻 Technical
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "TypeScript",
                    "Node.js",
                    "Python",
                    "AWS",
                    "SQL",
                  ].map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all border border-gray-200 hover:border-blue-500 hover:shadow-md"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  🤝 Soft Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Leadership",
                    "Communication",
                    "Project Management",
                    "Problem Solving",
                  ].map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all border border-gray-200 hover:border-purple-500 hover:shadow-md"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  🎨 Design
                </p>
                <div className="flex flex-wrap gap-2">
                  {["UI/UX Design", "Figma", "Adobe XD", "Graphic Design"].map(
                    (skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-bold hover:bg-pink-500 hover:text-white transition-all border border-gray-200 hover:border-pink-500 hover:shadow-md"
                      >
                        + {skill}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
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
      return (
        <div className="animate-fade-in-up">
          <Textarea
            label="Declaration Text"
            value={data.text}
            rows={6}
            onChange={(e: any) => handleChange("text", e.target.value)}
            placeholder="I hereby declare that the above-mentioned information is correct to the best of my knowledge..."
          />
          <div className="mt-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
              Suggestions
            </p>
            <div className="flex flex-col gap-2">
              {[
                "I hereby declare that the above-mentioned information is correct to the best of my knowledge.",
                "I solemnly declare that the information provided above is true and correct.",
                "I certify that the information contained in this resume is correct to the best of my knowledge.",
              ].map((text, i) => (
                <button
                  key={i}
                  onClick={() => handleChange("text", text)}
                  className="text-left text-xs text-gray-600 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-lg transition-all"
                >
                  {text}
                </button>
              ))}
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
              <div className="flex-1">
                <Input
                  label="Language"
                  value={item.language}
                  onChange={(e: any) =>
                    onArrayChange(idx, "language", e.target.value)
                  }
                  placeholder="English"
                />
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

    default:
      return (
        <div className="text-center py-12 text-gray-400">
          Section specific form not implemented yet for {type}
        </div>
      );
  }
};

export default ResumeEditor;
