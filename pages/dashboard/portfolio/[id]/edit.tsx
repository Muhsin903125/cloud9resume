import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { SectionEditor } from "../../../../components/portfolio/SectionEditor";
import { TemplateSelector } from "../../../../components/portfolio/TemplateSelector";
import { PortfolioPreview } from "../../../../components/portfolio/PortfolioPreview";

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
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchResumes();
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
      setMessage({ type: "error", text: "Failed to load portfolio" });
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
        if (isNewMode) {
          // For new mode, just set local sections
          const newSections = data.data.map((s: any, idx: number) => ({
            id: `temp_${idx}_${Date.now()}`,
            section_type: s.section_type,
            section_data: s.section_data,
            order_index: s.order_index ?? idx,
            is_visible: s.is_visible ?? true,
          }));
          setSections(newSections);
        } else {
          // For edit mode, save to API
          for (const s of data.data) {
            await fetch(`/api/portfolios/${id}/sections`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                section_type: s.section_type,
                section_data: s.section_data,
                order_index: s.order_index,
                is_visible: s.is_visible ?? true,
              }),
            });
          }
          // Refetch sections
          await fetchPortfolio();
        }
        setMessage({
          type: "success",
          text: `Imported ${data.data.length} sections from resume`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to import from resume" });
    } finally {
      setSaving(false);
    }
  };

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

        setMessage({ type: "success", text: "Portfolio created!" });
        router.replace(`/dashboard/portfolio/${portfolioId}/edit`);
      } else {
        // Update existing portfolio
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
          }),
        });

        // Update sections
        await fetch(`/api/portfolios/${id}/sections`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sections }),
        });

        setMessage({ type: "success", text: "Changes saved!" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (isNewMode) {
      setMessage({
        type: "error",
        text: "Save the portfolio first before publishing",
      });
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
        setMessage({
          type: "success",
          text: newStatus ? "Portfolio published!" : "Portfolio unpublished",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to publish" });
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

      <div className="min-h-screen bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/portfolio")}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              ← Back
            </button>
            <div className="flex flex-col">
              <input
                type="text"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                placeholder="Portfolio Title"
              />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>cloud9profile.com/</span>
                <input
                  type="text"
                  value={portfolioSlug}
                  onChange={(e) =>
                    setPortfolioSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1 w-32"
                  placeholder="your-slug"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Publish Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPublished ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-sm text-gray-600">
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <button
              onClick={() => setShowResumeModal(true)}
              disabled={saving}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Import Resume
            </button>

            <button
              onClick={saveAllChanges}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : isNewMode ? "Create" : "Save"}
            </button>

            {!isNewMode && (
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={publishing}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isPublished
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isPublished ? "Unpublish" : "Publish"}
              </button>
            )}

            {!isNewMode && portfolioSlug && (
              <a
                href={`/${portfolioSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                View Site
              </a>
            )}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
            onClick={() => setMessage({ type: "", text: "" })}
          >
            {message.text}
          </div>
        )}

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

        {/* Publish Confirmation Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {isPublished ? "Unpublish Portfolio?" : "Publish Portfolio?"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isPublished
                  ? "Your portfolio will no longer be visible at the public URL."
                  : `Your portfolio will be live at cloud9profile.com/${
                      portfolioSlug || "[slug]"
                    }`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={togglePublish}
                  className={`flex-1 py-2 rounded-lg text-white ${
                    isPublished
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex h-[calc(100vh-65px)]">
          {/* Left Panel - Editor */}
          <div className="w-[45%] bg-white border-r border-gray-200 overflow-y-auto p-6">
            {/* Template Selector */}
            <div className="mb-6">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Sections
                </h3>
                <button
                  onClick={() => setShowAddSection(!showAddSection)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  + Add Section
                </button>
              </div>

              {showAddSection && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Choose section type:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => addSection(type.id)}
                        className="px-3 py-2 text-left text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No sections yet</p>
                    <button
                      onClick={() => setShowResumeModal(true)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Import from your resume
                    </button>
                  </div>
                ) : (
                  sections
                    .sort((a, b) => a.order_index - b.order_index)
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
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto min-h-[600px]">
                <PortfolioPreview
                  sections={sections}
                  templateId={selectedTemplate}
                  portfolioSettings={{
                    name: portfolioTitle,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
