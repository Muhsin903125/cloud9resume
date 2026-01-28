import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { MiniTemplatePreview } from "../../../../components/MiniTemplatePreview";
import { TEMPLATE_REGISTRY } from "../../../../lib/template-registry";
import { useAPIAuth } from "../../../../hooks/useAPIAuth";
import { toast } from "react-hot-toast";
import { CheckIcon, ArrowRightIcon } from "lucide-react";

const TemplateSelectionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch } = useAPIAuth();

  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("ats");
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await get(`/api/resumes/${id}`);
      if (res.success && res.data) {
        setResume(res.data);
        if (res.data.template_id) {
          setSelectedTemplate(res.data.template_id);
        }
      } else {
        toast.error("Failed to load resume details");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading resume");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      const res = await patch(`/api/resumes/${id}`, {
        template_id: selectedTemplate,
      });

      if (res.success) {
        toast.success("Template selected!");
        router.push(`/dashboard/resume/${id}/edit`);
      } else {
        throw new Error(res.error || "Failed to save template");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save selection");
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    {
      name: "Professional (ATS Optimized)",
      description:
        "Clean, text-focused layouts designed to pass Applicant Tracking Systems.",
      items: TEMPLATE_REGISTRY.filter((t) => t.category === "ATS"),
    },
    {
      name: "Creative & Modern",
      description: "Stand out with unique layouts, colors, and designs.",
      items: TEMPLATE_REGISTRY.filter((t) => t.category !== "ATS"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Select Template - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Choose a Template
              </h1>
              <p className="text-xs text-gray-500">
                Step 1 of 2 • Getting started with{" "}
                {resume?.title || "your resume"}
              </p>
            </div>

            <button
              onClick={handleContinue}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all text-sm shadow-sm shadow-blue-200"
            >
              {saving ? "Saving..." : "Continue to Editor"}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {category.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {category.items.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      onMouseEnter={() => setHoveredTemplate(template.id)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      className={`group relative text-left transition-all duration-200 rounded-xl overflow-hidden outline-none ring-2 ring-offset-2 ${
                        selectedTemplate === template.id
                          ? "ring-blue-600 shadow-xl scale-[1.02]"
                          : "ring-transparent hover:ring-gray-200 hover:shadow-lg hover:scale-[1.01]"
                      }`}
                    >
                      <div className="aspect-[210/297] bg-white relative">
                        <div className="absolute inset-0 p-3">
                          <MiniTemplatePreview
                            templateId={template.id}
                            color={
                              selectedTemplate === template.id
                                ? "#2563EB"
                                : "#94A3B8"
                            }
                          />
                        </div>

                        {/* Overlay for selection state */}
                        <div
                          className={`absolute inset-0 transition-opacity flex items-center justify-center ${
                            selectedTemplate === template.id
                              ? "bg-blue-900/10 opacity-100"
                              : "bg-black/0 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {selectedTemplate === template.id && (
                            <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg transform scale-100 transition-transform">
                              <CheckIcon size={24} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className={`p-4 border-t transition-colors ${
                          selectedTemplate === template.id
                            ? "bg-blue-50 border-blue-100"
                            : "bg-white border-gray-100 group-hover:border-gray-200"
                        }`}
                      >
                        <h3
                          className={`font-bold text-sm mb-1 ${
                            selectedTemplate === template.id
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {template.name}
                        </h3>
                        <div className="flex gap-2">
                          {template.isAtsSafe && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                              ATS Friendly
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default TemplateSelectionPage;
