import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { toast } from "react-hot-toast";
import { SectionEditor } from "../../../../components/portfolio/SectionEditor";
import {
  TemplateSelector,
  PORTFOLIO_TEMPLATES,
} from "../../../../components/portfolio/TemplateSelector";
import { PortfolioPreview } from "../../../../components/portfolio/PortfolioPreview";
import { ProfileImageUploader } from "../../../../components/portfolio/ProfileImageUploader";
import { PublishModal } from "../../../../components/portfolio/PublishModal";
import { CreditConfirmModal } from "../../../../components/modals/CreditConfirmModal";
import { CREDIT_COSTS, PlanType } from "../../../../lib/subscription";

// ─── Types ─────────────────────────────────────────────
interface Section {
  id: string;
  section_type: string;
  section_data: any;
  order_index: number;
  is_visible: boolean;
}

interface Resume {
  id: string;
  title: string;
  job_title?: string;
  updated_at: string;
}

const SECTION_TYPES = [
  { id: "personal_info", label: "Personal Info", icon: "👤" },
  { id: "summary", label: "Summary", icon: "📝" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "certifications", label: "Certifications", icon: "🏆" },
  { id: "languages", label: "Languages", icon: "🌐" },
  { id: "custom", label: "Custom Section", icon: "✏️" },
];

// ─── Main Component ────────────────────────────────────
export default function PortfolioEditor() {
  const router = useRouter();
  const { id } = router.query;
  const isNewMode = id === "new";

  // Core state
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioTitle, setPortfolioTitle] = useState("My Portfolio");
  const [portfolioSlug, setPortfolioSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  // UI state
  const [loading, setLoading] = useState(!isNewMode);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "design">("content");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [showAddSection, setShowAddSection] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showConfirmAI, setShowConfirmAI] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [mobileShowPreview, setMobileShowPreview] = useState(false);

  // Data state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedHtml, setAiGeneratedHtml] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [userCredits, setUserCredits] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ─── Data Fetching ─────────────────────────────────────
  const getAuthToken = () => localStorage.getItem("x_user_auth_token");

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (data.success && data.data) setResumes(data.data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  }, []);

  const fetchUserPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/credits", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const response = await res.json();
      if (response.success && response.data) {
        setUserPlan(response.data.stats.plan);
        setUserCredits(response.data.stats.current);
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    if (!id || isNewMode) return;
    try {
      setLoading(true);
      const token = getAuthToken();

      const portfolioRes = await fetch(`/api/portfolios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const portfolioData = await portfolioRes.json();

      if (portfolioData.success) {
        const p = portfolioData.data;
        setPortfolio(p);
        setPortfolioTitle(p.title || "My Portfolio");
        setPortfolioSlug(p.slug || "");
        setIsPublished(p.is_active || false);
        setSelectedTemplate(p.template_id || "modern");
        setSelectedResumeId(p.resume_id || null);
        if (p.ai_html) setAiGeneratedHtml(p.ai_html);
        if (p.profile_image_url) setProfileImageUrl(p.profile_image_url);
      }

      const sectionsRes = await fetch(`/api/portfolios/${id}/sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sectionsData = await sectionsRes.json();
      if (sectionsData.success && sectionsData.data) {
        setSections(sectionsData.data);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [id, isNewMode]);

  useEffect(() => {
    fetchResumes();
    fetchUserPlan();
    if (id && !isNewMode) {
      fetchPortfolio();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Track unsaved changes
  useEffect(() => {
    if (!loading) setHasUnsavedChanges(true);
  }, [sections, portfolioTitle, portfolioSlug, selectedTemplate, profileImageUrl]);

  // ─── Section Import ────────────────────────────────────
  const transformSection = (s: any) => {
    const type = s.section_type;
    const data = s.section_data || {};

    if (
      [
        "personal_info",
        "summary",
        "description",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "languages",
      ].includes(type)
    ) {
      return { type, data };
    }

    // Map others to custom sections
    let content = "";
    const title =
      type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");

    if (type === "hobbies" && Array.isArray(data.items) && data.items.length) {
      content = data.items
        .map((i: any) => (typeof i === "string" ? i : i.name || i))
        .join(", ");
    } else if (
      type === "achievements" &&
      Array.isArray(data.items) &&
      data.items.length
    ) {
      content = data.items
        .map((i: any) => `• ${i.title || i.name || i}`)
        .join("\n");
    } else if (type === "declaration" && data.text) {
      content = data.text;
    } else if (
      type === "volunteering" &&
      Array.isArray(data.items) &&
      data.items.length
    ) {
      content = data.items
        .map(
          (i: any) =>
            `${i.organization || ""} — ${[i.startDate, i.endDate].filter(Boolean).join(" - ")}${i.description ? "\n" + i.description : ""}`
        )
        .join("\n\n");
    } else if (
      type === "references" &&
      Array.isArray(data.items) &&
      data.items.length
    ) {
      content = data.items
        .map((i: any) => `${i.name} — ${i.company || ""}`)
        .join("\n");
    } else if (data.text) {
      content = data.text;
    }

    if (!content) return null;
    return { type: "custom", data: { title, content } };
  };

  const importFromResume = async (resumeId: string) => {
    const token = getAuthToken();
    setSaving(true);
    setShowResumeModal(false);
    setSelectedResumeId(resumeId);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.data) {
        if (isNewMode) {
          const newSections = data.data
            .map((s: any, idx: number) => {
              const transformed = transformSection(s);
              if (!transformed) return null;
              return {
                id: `temp_${idx}_${Date.now()}`,
                section_type: transformed.type,
                section_data: transformed.data,
                order_index: s.order_index ?? idx,
                is_visible: s.is_visible ?? true,
              };
            })
            .filter(Boolean);
          setSections(newSections);
        } else {
          for (const s of data.data) {
            const transformed = transformSection(s);
            if (!transformed) continue;
            await fetch(`/api/portfolios/${id}/sections`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                section_type: transformed.type,
                section_data: transformed.data,
                order_index: s.order_index,
                is_visible: s.is_visible ?? true,
              }),
            });
          }
          await fetchPortfolio();
        }
        toast.success("Imported sections from resume!");
      }
    } catch (error) {
      toast.error("Failed to import from resume");
    } finally {
      setSaving(false);
    }
  };

  // ─── Section CRUD ──────────────────────────────────────
  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const toggleVisibility = async (sectionId: string, visible: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, is_visible: visible } : s))
    );
    if (!isNewMode) {
      const token = getAuthToken();
      await fetch(`/api/portfolios/${id}/sections/${sectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_visible: visible }),
      });
    }
  };

  const deleteSection = async (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    if (!isNewMode && !sectionId.startsWith("temp_")) {
      const token = getAuthToken();
      await fetch(`/api/portfolios/${id}/sections/${sectionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  const addSection = async (sectionType: string) => {
    setShowAddSection(false);
    const newSection: Section = {
      id: `temp_${Date.now()}`,
      section_type: sectionType,
      section_data:
        sectionType === "custom"
          ? { title: "New Section", content: "" }
          : sectionType === "personal_info"
            ? { name: "", email: "", phone: "", location: "" }
            : sectionType === "summary" || sectionType === "description"
              ? { text: "" }
              : { items: [] },
      order_index: sections.length,
      is_visible: true,
    };

    if (isNewMode) {
      setSections((prev) => [...prev, newSection]);
    } else {
      const token = getAuthToken();
      const res = await fetch(`/api/portfolios/${id}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSection),
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) => [...prev, data.data]);
      }
    }
  };

  // ─── Save & Publish ────────────────────────────────────
  const saveAllChanges = async () => {
    const token = getAuthToken();
    setSaving(true);

    try {
      if (isNewMode) {
        const createRes = await fetch("/api/portfolios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: portfolioTitle,
            slug: portfolioSlug || undefined,
            template_id: selectedTemplate,
            resume_id: selectedResumeId || undefined,
          }),
        });

        const createData = await createRes.json();
        if (!createData.success) {
          throw new Error(createData.error || "Failed to create portfolio");
        }

        const portfolioId = createData.data.id;

        for (const s of sections) {
          await fetch(`/api/portfolios/${portfolioId}/sections`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              section_type: s.section_type,
              section_data: s.section_data,
              order_index: s.order_index,
              is_visible: s.is_visible,
            }),
          });
        }

        toast.success("Portfolio created!");
        setHasUnsavedChanges(false);
        router.replace(`/dashboard/portfolio/${portfolioId}/edit`);
      } else {
        await fetch(`/api/portfolios/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: portfolioTitle,
            slug: portfolioSlug,
            template_id: selectedTemplate,
            ai_html: aiGeneratedHtml || null,
            profile_image_url: profileImageUrl || null,
          }),
        });

        await fetch(`/api/portfolios/${id}/sections`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sections }),
        });

        toast.success("Saved!");
        setHasUnsavedChanges(false);
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (username: string, replaceExisting?: string) => {
    const token = getAuthToken();

    // Save first
    const saved = await saveAllChanges();
    if (!saved) throw new Error("Failed to save before publishing");

    if (replaceExisting) {
      await fetch(`/api/portfolios/${replaceExisting}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: false,
          slug: `${username}-${Date.now()}`,
        }),
      });
    }

    const res = await fetch(`/api/portfolios/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: true, slug: username }),
    });

    const data = await res.json();
    if (data.success) {
      setIsPublished(true);
      setPortfolioSlug(username);
      toast.success("Portfolio published!");
    } else {
      throw new Error(data.error || "Failed to publish");
    }
  };

  const handleUnpublish = async () => {
    const token = getAuthToken();
    setPublishing(true);
    try {
      const res = await fetch(`/api/portfolios/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPublished(false);
        toast.success("Portfolio unpublished");
      }
    } catch (error) {
      toast.error("Failed to unpublish");
    } finally {
      setPublishing(false);
    }
  };

  // ─── AI Generation ─────────────────────────────────────
  const handleGenerateClick = () => {
    if (sections.length === 0) {
      toast.error("Import a resume first to use AI generation");
      setShowResumeModal(true);
      return;
    }
    setShowConfirmAI(true);
  };

  const generateWithAI = async () => {
    setShowConfirmAI(false);
    setIsGeneratingAI(true);

    try {
      const res = await fetch("/api/portfolio/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          sections,
          templateStyle: selectedTemplate,
          generateHtml: true,
          profileImageUrl,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.html) {
        setAiGeneratedHtml(data.data.html);
        toast.success("AI generated your portfolio design!");
        fetchUserPlan();
      } else {
        throw new Error(data.error || "AI generation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "AI generation failed");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ─── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading portfolio editor...
          </p>
        </div>
      </div>
    );
  }

  // ─── Empty State (no sections) ─────────────────────────
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <svg
          className="w-10 h-10 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Start Building Your Portfolio
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
        Import your resume data to auto-populate your portfolio, or add sections
        manually.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={() => setShowResumeModal(true)}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Import from Resume
        </button>
        <button
          onClick={() => setShowAddSection(true)}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Manually
        </button>
      </div>
    </div>
  );

  // ─── Sorted sections ──────────────────────────────────
  const sortedSections = [...sections].sort((a, b) => {
    const isCustomA = a.section_type === "custom";
    const isCustomB = b.section_type === "custom";
    if (isCustomA && !isCustomB) return 1;
    if (!isCustomA && isCustomB) return -1;
    return a.order_index - b.order_index;
  });

  // ─── Render ────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>
          {isNewMode ? "New" : "Edit"} Portfolio — Cloud9Profile
        </title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col h-screen">
        {/* ═══════════ HEADER ═══════════ */}
        <header className="bg-white border-b border-gray-200 px-4 py-2.5 shrink-0 z-30 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => router.push("/dashboard/portfolio")}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors shrink-0"
                title="Back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="text-base font-bold text-gray-900 border-none p-0 focus:ring-0 bg-transparent truncate min-w-0 flex-1"
                placeholder="Portfolio Title"
              />
              {/* Status Badge */}
              {isPublished ? (
                <span className="shrink-0 px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200 uppercase tracking-wider">
                  Live
                </span>
              ) : (
                <span className="shrink-0 px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full border border-gray-200 uppercase tracking-wider">
                  Draft
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Settings gear */}
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2 rounded-lg text-gray-500 transition-colors ${showSettingsDrawer ? "bg-gray-100 text-gray-900" : "hover:bg-gray-100"}`}
                title="Portfolio Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Mobile preview toggle */}
              <button
                onClick={() => setMobileShowPreview(!mobileShowPreview)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title="Toggle Preview"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>

              <div className="w-px h-6 bg-gray-200 hidden sm:block" />

              {/* Save Button */}
              <button
                onClick={saveAllChanges}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving
                  </span>
                ) : (
                  "Save"
                )}
              </button>

              {/* Publish Button */}
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={saving || publishing || sections.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                  isPublished
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {publishing
                  ? "Publishing..."
                  : isPublished
                    ? "Update & Publish"
                    : "Publish"}
              </button>

              {isPublished && (
                <button
                  onClick={handleUnpublish}
                  disabled={publishing}
                  className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium border border-red-100 transition-colors"
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>

          {/* Settings Drawer (inline, below header) */}
          {showSettingsDrawer && (
            <div className="mt-3 pt-3 border-t border-gray-100 pb-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Profile Image */}
                <div className="flex items-center gap-3">
                  <ProfileImageUploader
                    imageUrl={profileImageUrl}
                    onImageChange={setProfileImageUrl}
                    portfolioId={(id as string) || ""}
                  />
                  <div className="text-xs text-gray-500">Profile photo</div>
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Portfolio URL
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <span className="text-xs text-gray-400 px-2.5 py-2 bg-gray-100 border-r border-gray-200 select-none whitespace-nowrap">
                      cloud9profile.com/
                    </span>
                    <input
                      type="text"
                      value={portfolioSlug}
                      onChange={(e) =>
                        setPortfolioSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                        )
                      }
                      placeholder="your-name"
                      className="flex-1 px-2.5 py-2 text-sm font-medium bg-white outline-none min-w-0"
                    />
                  </div>
                </div>

                {/* Live URL (if published) */}
                {isPublished && portfolioSlug && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Live URL
                    </label>
                    <a
                      href={`https://cloud9profile.com/${portfolioSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-100"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      cloud9profile.com/{portfolioSlug}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ═══════════ MAIN EDITOR ═══════════ */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Panel ── */}
          <div
            className={`w-full lg:w-[520px] xl:w-[560px] bg-white border-r border-gray-200 flex flex-col shrink-0 ${
              mobileShowPreview ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-1 shrink-0 bg-white">
              <button
                onClick={() => setActiveTab("content")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "content"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab("design")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "design"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                Design
              </button>

              <div className="flex-1" />

              {/* AI Generate button (compact) */}
              <button
                onClick={handleGenerateClick}
                disabled={isGeneratingAI || sections.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs font-bold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-sm"
              >
                {isGeneratingAI ? (
                  <>
                    <svg
                      className="w-3 h-3 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>✨ AI Design</>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Content Tab ── */}
              {activeTab === "content" && (
                <div className="p-4">
                  {/* Import from Resume - always visible when sections exist */}
                  {sections.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          Sections
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                          {sections.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowResumeModal(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Re-import
                        </button>
                        <button
                          onClick={() => setShowAddSection(!showAddSection)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Section Picker */}
                  {showAddSection && (
                    <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Choose section type:
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {SECTION_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => addSection(type.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-gray-700 text-left"
                          >
                            <span>{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section List or Empty State */}
                  {sections.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="space-y-2.5 pb-8">
                      {sortedSections.map((section) => (
                        <SectionEditor
                          key={section.id}
                          section={section}
                          onUpdate={updateSection}
                          onDelete={deleteSection}
                          onToggleVisibility={toggleVisibility}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Design Tab ── */}
              {activeTab === "design" && (
                <div className="p-4">
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelect={(tid: string) => {
                      setSelectedTemplate(tid);
                      setAiGeneratedHtml(null);
                    }}
                    userPlan={userPlan}
                    onAIGenerate={handleGenerateClick}
                    isGenerating={isGeneratingAI}
                    resumeData={sections.length > 0}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel: Preview ── */}
          <div
            className={`flex-1 bg-gray-200/70 overflow-hidden flex flex-col ${
              mobileShowPreview ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Preview Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium mr-1">
                  Preview
                </span>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-1.5 rounded-md transition-all ${
                    previewMode === "desktop"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-1.5 rounded-md transition-all ${
                    previewMode === "mobile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              {aiGeneratedHtml && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full border border-purple-100">
                    ✨ AI Design
                  </span>
                  <button
                    onClick={() => setAiGeneratedHtml(null)}
                    className="text-[10px] text-gray-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Preview Window */}
            <div className="flex-1 p-4 lg:p-6 flex justify-center overflow-auto">
              <div
                className={`bg-white rounded-xl shadow-lg overflow-hidden overflow-y-auto transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "w-[375px] max-w-[375px]"
                    : "w-full max-w-4xl"
                }`}
                style={{
                  minHeight: previewMode === "mobile" ? "667px" : "500px",
                }}
              >
                {previewMode === "mobile" && (
                  <div className="bg-gray-900 h-5 flex items-center justify-center">
                    <div className="w-14 h-1 bg-gray-700 rounded-full" />
                  </div>
                )}

                {aiGeneratedHtml ? (
                  <iframe
                    srcDoc={aiGeneratedHtml}
                    className="w-full h-full border-0"
                    style={{
                      minHeight:
                        previewMode === "mobile" ? "641px" : "500px",
                    }}
                    title="AI Generated Portfolio"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : sections.length > 0 ? (
                  <div
                    className={
                      previewMode === "mobile" ? "overflow-y-auto" : ""
                    }
                    style={{
                      maxHeight:
                        previewMode === "mobile"
                          ? "calc(667px - 20px)"
                          : undefined,
                    }}
                  >
                    <PortfolioPreview
                      sections={sections}
                      templateId={selectedTemplate}
                      portfolioSettings={{ name: portfolioTitle }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px] text-gray-300">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-gray-400">
                        Add content to see preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ MODALS ═══════════ */}

        {/* Resume Import Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Import from Resume
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select a resume to auto-populate your portfolio sections.
                </p>
              </div>
              <div className="p-4 max-h-[50vh] overflow-y-auto">
                {resumes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No resumes found.</p>
                    <button
                      onClick={() => router.push("/dashboard/resume")}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Create one first
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        onClick={() => importFromResume(resume.id)}
                        disabled={saving}
                        className="w-full p-4 text-left rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {resume.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {resume.job_title || "No title"} ·{" "}
                              {new Date(resume.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Publish Modal */}
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
          currentSlug={portfolioSlug}
          portfolioId={(id as string) || ""}
          userPlan={userPlan}
        />

        {/* AI Credit Confirm */}
        <CreditConfirmModal
          isOpen={showConfirmAI}
          onClose={() => setShowConfirmAI(false)}
          onConfirm={generateWithAI}
          title="AI Portfolio Design"
          description="Our AI will analyze your content and generate a unique portfolio design."
          cost={CREDIT_COSTS.portfolio_ai_generation}
          balance={userCredits}
        />
      </div>
    </>
  );
}
