import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { toast } from "react-hot-toast";
import { SectionEditor } from "../../../../components/portfolio/SectionEditor";
import { TemplateSelector } from "../../../../components/portfolio/TemplateSelector";
import { PortfolioPreview } from "../../../../components/portfolio/PortfolioPreview";
import { ProfileImageUploader } from "../../../../components/portfolio/ProfileImageUploader";
import { PublishModal } from "../../../../components/portfolio/PublishModal";
import { CreditConfirmModal } from "../../../../components/modals/CreditConfirmModal";
import { CREDIT_COSTS, PlanType } from "../../../../lib/subscription";
import {
  PlusIcon,
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  ZapIcon,
  LayoutIcon,
  AwardIcon,
  DocumentIcon,
  TemplateIcon,
} from "../../../../components/Icons";

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
  { id: "personal_info", label: "Personal Info" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "custom", label: "Custom Section" },
];

export default function PortfolioEditor() {
  const router = useRouter();
  const { id } = router.query;
  const isNewMode = id === "new";

  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioTitle, setPortfolioTitle] = useState("My Portfolio");
  const [portfolioSlug, setPortfolioSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [loading, setLoading] = useState(!isNewMode);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedHtml, setAiGeneratedHtml] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [activeTab, setActiveTab] = useState<"content" | "design" | "settings">(
    "content",
  );
  const [showAIModal, setShowAIModal] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [showConfirmAI, setShowConfirmAI] = useState(false);

  // Validation state
  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    // Optional: Logic to switch tabs automatically if needed
    if (sections.length > 0 && !isGeneratingAI) {
      // Logic preserved from previous placement
    }
  }, [sections.length]);

  useEffect(() => {
    fetchResumes();
    fetchUserPlan();
    if (id && !isNewMode) {
      fetchPortfolio();
    } else {
      setLoading(false);
    }
  }, [id]);

  const getAuthToken = () => localStorage.getItem("x_user_auth_token");

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResumes(data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const fetchUserPlan = async () => {
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
  };

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

    const token = getAuthToken();
    setIsGeneratingAI(true);

    try {
      const res = await fetch("/api/portfolio/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sections: sections,
          templateStyle: selectedTemplate,
          generateHtml: true,
          profileImageUrl: profileImageUrl,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.html) {
        setAiGeneratedHtml(data.data.html);
        toast.success("AI generated your portfolio design!");
        setShowAIModal(false);
        fetchUserPlan(); // Refresh credits
      } else {
        throw new Error(data.error || "AI generation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "AI generation failed");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const fetchPortfolio = async () => {
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
        if (p.ai_html) {
          setAiGeneratedHtml(p.ai_html);
        }
        if (p.profile_image_url) {
          setProfileImageUrl(p.profile_image_url);
        }
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
        // Transform logic helper
        // Transform logic helper
        const transformSection = (s: any) => {
          const type = s.section_type;
          const data = s.section_data || {};

          // Core sections supported by SectionEditor
          // Ensure they have minimal data validity if needed, though usually these persist
          if (
            [
              "personal_info",
              "summary",
              "experience",
              "education",
              "skills",
              "projects",
            ].includes(type)
          ) {
            return { type, data };
          }

          // Map others to Custom
          let content = "";
          let title =
            type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");

          // Validation: Check if data exists before formatting
          if (
            type === "certifications" &&
            Array.isArray(data.items) &&
            data.items.length > 0
          ) {
            content =
              `<ul class="list-disc pl-5 space-y-1">` +
              data.items
                .map((i: any) => {
                  const text = i.title || i.name;
                  const sub =
                    i.issuer || i.date
                      ? ` (${[i.issuer, i.date].filter(Boolean).join(", ")})`
                      : "";
                  return `<li>${text}${sub}</li>`;
                })
                .join("") +
              `</ul>`;
          } else if (
            type === "languages" &&
            Array.isArray(data.items) &&
            data.items.length > 0
          ) {
            content =
              `<ul class="list-disc pl-5 space-y-1">` +
              data.items
                .map(
                  (i: any) =>
                    `<li><strong>${i.language}</strong>${
                      i.proficiency ? ` - ${i.proficiency}` : ""
                    }</li>`,
                )
                .join("") +
              `</ul>`;
          } else if (
            type === "volunteering" &&
            Array.isArray(data.items) &&
            data.items.length > 0
          ) {
            content =
              `<ul class="space-y-3">` +
              data.items
                .map(
                  (i: any) => `<li>
                      <div class="font-bold">${i.organization}</div>
                      <div class="text-sm text-gray-600">${i.startDate || ""} ${
                        i.endDate ? "- " + i.endDate : ""
                      }</div>
                      ${
                        i.description
                          ? `<div class="text-sm mt-1">${i.description}</div>`
                          : ""
                      }
                   </li>`,
                )
                .join("") +
              `</ul>`;
          } else if (
            type === "achievements" &&
            Array.isArray(data.items) &&
            data.items.length > 0
          ) {
            content =
              `<ul class="list-disc pl-5 space-y-1">` +
              data.items
                .map((i: any) => `<li>${i.title || i.name || i}</li>`)
                .join("") +
              `</ul>`;
          } else if (
            type === "hobbies" &&
            Array.isArray(data.items) &&
            data.items.length > 0
          ) {
            content =
              `<div class="flex flex-wrap gap-2">` +
              data.items
                .map(
                  (i: any) =>
                    `<span class="px-3 py-1 bg-gray-100 rounded-full text-sm">${
                      i.name || i
                    }</span>`,
                )
                .join("") +
              `</div>`;
          } else if (type === "declaration" && data.text) {
            content = `<p class="italic text-gray-600">${data.text}</p>`;
          } else if (type === "references") {
            // Only include references if there represent actual items or explicit text, skip "Available upon request" default if empty
            if (Array.isArray(data.items) && data.items.length > 0) {
              content =
                `<ul class="space-y-2">` +
                data.items
                  .map(
                    (i: any) =>
                      `<li><strong>${i.name}</strong> - ${i.company || ""}</li>`,
                  )
                  .join("") +
                `</ul>`;
            } else {
              return null; // Skip empty references
            }
          } else if (data.text) {
            content = `<p>${data.text}</p>`;
          }

          // If content is still empty after checks, return null to filter it out
          if (!content) return null;

          return {
            type: "custom",
            data: {
              title,
              content,
            },
          };
        };

        if (isNewMode) {
          // For new mode, just set local sections
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
            .filter(Boolean); // Filter out nulls

          setSections(newSections);
        } else {
          // For edit mode, save to API
          for (const s of data.data) {
            const transformed = transformSection(s);
            if (!transformed) continue; // Skip empty sections

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
          // Refetch sections
          await fetchPortfolio();
        }
        toast.success(`Imported ${data.data.length} sections from resume`);
      }
    } catch (error) {
      toast.error("Failed to import from resume");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
    );
  };

  const toggleVisibility = async (sectionId: string, visible: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, is_visible: visible } : s)),
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
            : sectionType === "summary"
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

  const saveAllChanges = async () => {
    const token = getAuthToken();
    setSaving(true);
    setSlugError("");

    try {
      if (isNewMode) {
        // Create new portfolio
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

        // Save sections
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
        router.replace(`/dashboard/portfolio/${portfolioId}/edit`);
      } else {
        // Update existing portfolio
        const updateRes = await fetch(`/api/portfolios/${id}`, {
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

        const updateData = await updateRes.json();
        if (!updateData.success) {
          throw new Error(updateData.error || "Failed to save changes");
        }

        // Update sections
        await fetch(`/api/portfolios/${id}/sections`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sections }),
        });

        toast.success("Changes saved!");
      }
      return true; // Return success for chained actions
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
      return false; // Return failure
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (isNewMode) {
      toast.error("Save the portfolio first before publishing");
      return;
    }

    if (!portfolioSlug) {
      toast.error("Set a unique username to publish");
      setSlugError("Username is required");
      // Switch to settings
      setActiveTab("settings");
      return;
    }

    const token = getAuthToken();
    setPublishing(true);
    setShowPublishModal(false);

    try {
      const newStatus = !isPublished;
      const res = await fetch(`/api/portfolios/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setIsPublished(newStatus);
        toast.success(
          newStatus ? "Portfolio published!" : "Portfolio unpublished",
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleUpdateAndPublish = async () => {
    // 1. Validation
    if (!portfolioSlug) {
      toast.error("Username is required to publish");
      setActiveTab("settings");
      setSlugError("Required");
      return;
    }

    // 2. Save Changes
    const saved = await saveAllChanges();
    if (!saved) return;

    // 3. Publish if not active, or just notify updated if already active
    if (!isPublished) {
      // Logic for first time publish
      const token = getAuthToken();
      setPublishing(true);
      try {
        const res = await fetch(`/api/portfolios/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: true }),
        });
        const data = await res.json();
        if (data.success) {
          setIsPublished(true);
          toast.success("Portfolio updated & published!");
        } else {
          toast.error(data.error || "Failed to publish");
        }
      } catch (e) {
        toast.error("Failed to publish");
      } finally {
        setPublishing(false);
      }
    } else {
      // Already published, just needed save (which is done)
      toast.success("Portfolio updated successfully!");
    }
  };

  const handlePublish = async (username: string, replaceExisting?: string) => {
    // Legacy support for modal based publish if needed, or redirect to handleUpdateAndPublish logic
    // Implementation kept for backward compatibility if Modal used
    const token = getAuthToken();
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
      body: JSON.stringify({
        is_active: true,
        slug: username,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setIsPublished(true);
      setPortfolioSlug(username);
      toast.success("Portfolio published successfully!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading portfolio editor...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{isNewMode ? "New" : "Edit"} Portfolio - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col h-screen">
        {/* Responsive Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 z-20 shadow-sm relative">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard/portfolio")}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Back to Dashboard"
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
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  className="block w-full text-base sm:text-lg font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder:text-gray-400 bg-transparent truncate"
                  placeholder="Portfolio Title"
                />
              </div>
            </div>

            {/* Center: AI Generator */}
            <div className="w-full sm:w-auto flex justify-center order-3 sm:order-2">
              <button
                onClick={handleGenerateClick}
                disabled={isGeneratingAI || sections.length === 0}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center px-6 py-2 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
              >
                {isGeneratingAI ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
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
                    Building...
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-base">✨</span>
                    Generate with AI
                  </>
                )}
              </button>
            </div>

            {/* Right: Actions */}
            <div className="w-full sm:w-auto flex items-center justify-end gap-2 order-2 sm:order-3">
              {/* Save Button */}
              <button
                onClick={() => saveAllChanges()}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {saving
                  ? "Saving..."
                  : isNewMode
                    ? "Save Draft"
                    : "Save Changes"}
              </button>

              {/* Publish/Update Button */}
              {isNewMode ? (
                <button
                  onClick={() => setShowPublishModal(true)}
                  disabled={saving || publishing}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 text-white border border-transparent rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Save & Publish
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdateAndPublish}
                    disabled={saving || publishing}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                      isPublished
                        ? "bg-green-600 text-white border-transparent hover:bg-green-700"
                        : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                    }`}
                  >
                    {publishing
                      ? "Processing..."
                      : isPublished
                        ? "Update & Publish"
                        : "Publish Now"}
                  </button>

                  {isPublished && (
                    <button
                      onClick={handleUnpublish}
                      className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium border border-red-200"
                      title="Unpublish"
                    >
                      Stop Hosting
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Tabbed Interface */}
          <div className="w-[600px] bg-white border-r border-gray-200 flex flex-col">
            {/* Profile Summary Header */}
            <div className="p-6 pb-2 border-b border-gray-100 flex gap-4 items-center bg-white shrink-0">
              <ProfileImageUploader
                imageUrl={profileImageUrl}
                onImageChange={setProfileImageUrl}
                portfolioId={(id as string) || ""}
              />
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-bold text-gray-900 truncate"
                  title={portfolioTitle}
                >
                  {portfolioTitle}
                </h2>
                <a
                  href={`https://cloud9profile.com/${portfolioSlug}`}
                  target="_blank"
                  className="text-xs text-blue-600 hover:underline truncate block"
                >
                  cloud9profile.com/{portfolioSlug || "..."}
                </a>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2 shrink-0 bg-white">
              {(["content", "design", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
              {/* CONTENT TAB */}
              {activeTab === "content" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                        Content Sections
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Manage your portfolio data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddSection(!showAddSection)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                      title="Add Section"
                    >
                      <PlusIcon size={16} />
                      <span>Add Section</span>
                    </button>
                  </div>

                  {showAddSection && (
                    <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-2">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Select section type:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SECTION_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => addSection(type.id)}
                            className="px-3 py-2 text-left text-xs font-medium bg-gray-50 border border-transparent hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-colors text-gray-700"
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pb-8">
                    {sections.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                        <p className="text-gray-400 text-sm mb-2">
                          No sections added yet
                        </p>
                        <button
                          onClick={() => setShowResumeModal(true)}
                          className="text-blue-600 font-medium hover:underline text-sm"
                        >
                          Import from Resume
                        </button>
                      </div>
                    ) : (
                      sections
                        .sort((a, b) => {
                          const isCustomA = a.section_type === "custom";
                          const isCustomB = b.section_type === "custom";
                          if (isCustomA && !isCustomB) return 1;
                          if (!isCustomA && isCustomB) return -1;
                          return a.order_index - b.order_index;
                        })
                        .map((section) => (
                          <SectionEditor
                            key={section.id}
                            section={section}
                            onUpdate={updateSection}
                            onDelete={deleteSection}
                            onToggleVisibility={toggleVisibility}
                          />
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* DESIGN TAB */}
              {activeTab === "design" && (
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Templates & Style
                  </h3>
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelect={(tid) => {
                      setSelectedTemplate(tid);
                      setAiGeneratedHtml(null); // Switch away from AI if template is picked
                    }}
                    userPlan={userPlan}
                    onAIGenerate={() => setShowAIModal(true)}
                    isGenerating={isGeneratingAI}
                    resumeData={sections.length > 0}
                  />

                  {/* AI Generation Modal */}
                  {showAIModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header Image/Icon Area */}
                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-center relative">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl mb-4 group ring-4 ring-white/10">
                            <svg
                              className="w-10 h-10 text-white animate-pulse"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            AI Magic Generator
                          </h3>
                          <p className="text-indigo-100/80 text-sm font-medium mt-1">
                            Transform data into professional design
                          </p>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl shadow-sm">
                                  🪙
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Available Balance
                                  </p>
                                  <p className="text-lg font-black text-gray-900">
                                    {userCredits} Credits
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-xl shadow-sm text-indigo-600">
                                  ✨
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                    Generation Cost
                                  </p>
                                  <p className="text-lg font-black text-indigo-700">
                                    1 Credit
                                  </p>
                                </div>
                              </div>
                              {userCredits < 1 && (
                                <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                  Insufficient
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {!isGeneratingAI ? (
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setShowAIModal(false)}
                                  className="px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
                                >
                                  Maybe Later
                                </button>
                                <button
                                  onClick={generateWithAI}
                                  disabled={userCredits < 1}
                                  className={`px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                    userCredits < 1
                                      ? "bg-gray-300 cursor-not-allowed grayscale"
                                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:scale-[1.02]"
                                  }`}
                                >
                                  Run Magic ✨
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <div className="relative w-20 h-20">
                                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                  <div className="absolute inset-4 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="text-2xl">🧠</span>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-black text-gray-900 tracking-tight">
                                    AI is Thinking...
                                  </p>
                                  <p className="text-sm text-gray-500 font-medium">
                                    Crafting your professional experience
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <p className="text-[10px] text-center text-gray-400 font-medium px-4">
                            This process takes about 5-10 seconds. Please do not
                            refresh the page while the magic is happening.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                      Portfolio Settings
                    </h3>
                    <p className="text-sm text-gray-500">
                      Configure your portfolio identity and public access.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="group transition-all duration-200">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
                        Display Title
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. My Professional Portfolio"
                          value={portfolioTitle}
                          onChange={(e) => setPortfolioTitle(e.target.value)}
                          className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-300 shadow-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="group transition-all duration-200">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
                        Custom URL Slug
                      </label>
                      <div className="flex items-stretch shadow-sm rounded-2xl overflow-hidden border-2 border-gray-100 group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-500/10 transition-all duration-300 bg-gray-50">
                        <div className="flex items-center px-4 bg-gray-100/50 text-gray-400 font-semibold text-xs border-r-2 border-gray-100 select-none">
                          cloud9profile.com/
                        </div>
                        <input
                          type="text"
                          placeholder="unique-slug"
                          value={portfolioSlug}
                          onChange={(e) =>
                            setPortfolioSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-"),
                            )
                          }
                          className="flex-1 px-5 py-3.5 bg-white outline-none text-gray-900 font-bold placeholder:text-gray-200 tracking-wide"
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-gray-400 flex items-center gap-1.5 px-1 bg-blue-50/0 group-hover:bg-blue-50/50 py-1 rounded-lg transition-colors">
                        <svg
                          className="w-3.5 h-3.5 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Your unique portfolio link. Only lowercase letters,
                        numbers, and dashes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-gray-200 overflow-y-auto flex flex-col custom-scrollbar">
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #cbd5e1;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: #94a3b8;
              }
            `}</style>
            {/* Viewport Toggle */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Preview:</span>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    previewMode === "desktop"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Desktop preview"
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    previewMode === "mobile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Mobile preview"
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium">Mobile</span>
                </button>
              </div>

              {/* AI Design indicator */}
              {aiGeneratedHtml && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                    AI Design
                  </span>
                  <button
                    onClick={() => setAiGeneratedHtml(null)}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Preview Container */}
            <div className="flex-1 p-6 flex justify-center overflow-auto">
              <div
                className={`bg-white rounded-xl shadow-lg overflow-hidden custom-scrollbar  overflow-y-auto transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "w-[375px] max-w-[375px]"
                    : "w-full max-w-4xl"
                }`}
                style={{
                  minHeight: previewMode === "mobile" ? "667px" : "600px",
                }}
              >
                {/* Mobile Frame */}
                {previewMode === "mobile" && (
                  <div className="bg-gray-900 h-6 flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
                  </div>
                )}

                {/* AI Generated HTML Preview */}
                {aiGeneratedHtml ? (
                  <iframe
                    srcDoc={aiGeneratedHtml}
                    className="w-full h-full border-0"
                    style={{
                      minHeight: previewMode === "mobile" ? "641px" : "600px",
                    }}
                    title="AI Generated Portfolio"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div
                    className={
                      previewMode === "mobile" ? "overflow-y-auto" : ""
                    }
                    style={{
                      maxHeight:
                        previewMode === "mobile"
                          ? "calc(667px - 24px)"
                          : "auto",
                    }}
                  >
                    <PortfolioPreview
                      sections={sections}
                      templateId={selectedTemplate}
                      portfolioSettings={{
                        name: portfolioTitle,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Resume Picker Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Select Resume to Import
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose which resume to import sections from
                </p>
              </div>
              <div className="p-4 max-h-[50vh] overflow-y-auto">
                {resumes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No resumes found.{" "}
                    <button
                      onClick={() => router.push("/dashboard/resume")}
                      className="text-blue-600 hover:underline"
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
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedResumeId === resume.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {resume.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resume.job_title || "No title"} •{" "}
                          {new Date(resume.updated_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t">
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="w-full py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Publish Modal */}
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
          currentSlug={portfolioSlug}
          portfolioId={(id as string) || ""}
          userPlan={userPlan}
        />

        <CreditConfirmModal
          isOpen={showConfirmAI}
          onClose={() => setShowConfirmAI(false)}
          onConfirm={generateWithAI}
          title="AI Hero Design Generation"
          description="Our AI will analyze your resume content and generate a professionally styled hero section for your portfolio."
          cost={CREDIT_COSTS.portfolio_ai_generation}
          balance={userCredits}
        />
      </div>
    </>
  );
}
