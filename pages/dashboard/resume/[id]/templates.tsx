import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ResumeRenderer } from "../../../../components/ResumeRenderer";
import { ChevronLeftIcon, CheckIcon } from "../../../../components/Icons";
import { useAPIAuth } from "../../../../hooks/useAPIAuth";

const TemplateSelector = () => {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch } = useAPIAuth();

  const [resume, setResume] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumeRes, templatesRes] = await Promise.all([
        get<any>(`/api/resumes/${id}`),
        get<any[]>("/api/resumes/templates"),
      ]);

      if (resumeRes.success) {
        setResume(resumeRes.data);
        setSelectedTemplate(
          resumeRes.data?.settings?.template_id ||
            resumeRes.data?.template_id ||
            null
        );
      }

      if (templatesRes.success) {
        setTemplates(templatesRes.data || []);
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setApplying(true);
      const response = await patch(`/api/resumes/${id}`, {
        template_id: selectedTemplate,
      });

      if (response.success) {
        setError("");
        router.push(`/dashboard/resume/${id}/edit`);
      } else {
        setError(response.error || "Failed to apply template");
      }
    } catch (err) {
      setError("Failed to apply template");
    } finally {
      setApplying(false);
    }
  };

  const filteredTemplates = templates.filter(
    (t) => categoryFilter === "all" || t.category === categoryFilter
  );

  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <>
      <Head>
        <title>Select Template - {resume?.title} - Cloud9 Resume</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Template List */}
          <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white border-r border-gray-200 overflow-y-auto p-6 z-10 shadow-xl flex flex-col">
            <button
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition text-sm"
            >
              <ChevronLeftIcon size={16} /> Back to Editor
            </button>

            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Choose Template
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Select a professional design for your resume.
            </p>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition ${
                    categoryFilter === cat
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pb-20">
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`group relative aspect-[3/4] bg-gray-50 rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                    selectedTemplate === t.id
                      ? "border-blue-600 ring-2 ring-blue-100 shadow-md scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium italic">
                    {/* Placeholder for thumbnail */}
                    Snapshot
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                    <div className="font-bold text-gray-900 text-xs">
                      {t.name}
                    </div>
                  </div>
                  {selectedTemplate === t.id && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg z-10">
                      <CheckIcon size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-[850px] mx-auto bg-white rounded shadow-2xl overflow-hidden min-h-[1100px] ring-1 ring-black/5 transform origin-top transition-all scale-[0.9] mt-[-50px]">
                {resume && (
                  <div className="pointer-events-none select-none">
                    <ResumeRenderer
                      resume={resume}
                      sections={
                        Array.isArray(resume.sections)
                          ? resume.sections
                          : Array.isArray(resume.resume_sections)
                          ? resume.resume_sections
                          : []
                      }
                      template={selectedTemplate || "modern"}
                      themeColor={resume.theme_color || "#000000"}
                      settings={resume.settings}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Floating Action Bar */}
            <div className="absolute bottom-8 right-8 z-30">
              <button
                onClick={applyTemplate}
                disabled={applying || !selectedTemplate}
                className="px-8 py-4 bg-gray-900 text-white font-bold rounded-full shadow-2xl hover:bg-black hover:scale-105 transition flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                <span>{applying ? "Saving..." : "Apply Template"}</span>
                {!applying && <CheckIcon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateSelector;
