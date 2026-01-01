import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import { TEMPLATE_REGISTRY } from "@/lib/template-registry";
import { CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const TemplateSelectionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch } = useAPIAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string>("");
  const [resumeTitle, setResumeTitle] = useState("");

  useEffect(() => {
    if (id) fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await get<any>(`/api/resumes/${id}`);
      if (response.success && response.data) {
        const tId =
          response.data.template_id ||
          response.data.settings?.template_id ||
          "ats";
        setCurrentTemplate(tId);
        setResumeTitle(response.data.title || "Untitled Resume");
      } else {
        toast.error("Failed to load resume");
        router.push("/dashboard/resume");
      }
    } catch (error) {
      router.push("/dashboard/resume");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    setCurrentTemplate(templateId);
    setSaving(true);
    try {
      const response = await patch(`/api/resumes/${id}`, {
        template_id: templateId,
      });
      if (response.success) {
        toast.success("Template applied");
        router.push(`/dashboard/resume/${id}/edit`);
      } else {
        toast.error("Failed to update");
        setSaving(false);
      }
    } catch (error) {
      toast.error("Failed to update");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Choose Template - {resumeTitle}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/resume")}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  {resumeTitle}
                </h1>
                <p className="text-[10px] text-gray-400">
                  Select a template to continue
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/resume/${id}/edit`)}
              className="px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Template Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATE_REGISTRY.map((template) => {
              const isSelected = currentTemplate === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  disabled={saving && isSelected}
                  className={`group relative bg-white rounded-lg border-2 overflow-hidden text-left transition-all ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Preview Area */}
                  <div
                    className={`h-36 flex items-center justify-center ${
                      isSelected ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="text-center px-3">
                      <div className="w-10 h-14 mx-auto mb-2 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center">
                        <div className="space-y-0.5">
                          <div className="w-5 h-0.5 bg-gray-300 rounded" />
                          <div className="w-4 h-0.5 bg-gray-200 rounded" />
                          <div className="w-5 h-0.5 bg-gray-200 rounded" />
                          <div className="w-3 h-0.5 bg-gray-200 rounded" />
                        </div>
                      </div>
                      <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      {isSelected && (
                        <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Hover/Selected Badge */}
                  {saving && isSelected ? (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : isSelected ? (
                    <div className="absolute top-2 right-2">
                      <span className="px-1.5 py-0.5 text-[8px] font-bold bg-blue-600 text-white rounded">
                        SELECTED
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateSelectionPage;
