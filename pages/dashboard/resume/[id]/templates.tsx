import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAPIAuth } from "@/hooks/useAPIAuth";
import { TEMPLATE_REGISTRY } from "@/lib/template-registry";
import { CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const TemplateSelectionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch } = useAPIAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await get<any>(`/api/resumes/${id}`);
      if (response.success && response.data) {
        // Handle template_id stored in root OR settings
        const tId =
          response.data.template_id ||
          response.data.settings?.template_id ||
          "ats";
        setCurrentTemplate(tId);
      } else {
        toast.error("Failed to load resume");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    setSaving(true);
    try {
      const response = await patch(`/api/resumes/${id}`, {
        template_id: templateId,
      });

      if (response.success) {
        toast.success("Template updated!");
        router.push(`/dashboard/resume/${id}/edit`);
      } else {
        toast.error(response.error || "Failed to update template");
        setSaving(false);
      }
    } catch (error) {
      toast.error("Failed to update template");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* minimal header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Choose a Template</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto p-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_REGISTRY.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative bg-white rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                ${
                  currentTemplate === template.id
                    ? "border-blue-600 shadow-lg ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                }
              `}
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Preview Area (Placeholder for now) */}
              <div
                className={`h-48 flex items-center justify-center p-6 ${
                  currentTemplate === template.id ? "bg-blue-50" : "bg-gray-100"
                }`}
              >
                <div className="text-center">
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2 block">
                    {template.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-700">
                    {template.name}
                  </h3>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{template.name}</h3>
                  {currentTemplate === template.id && (
                    <span className="bg-blue-600 text-white rounded-full p-1">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {template.description}
                </p>

                <button
                  className={`mt-4 w-full py-2 rounded-lg font-medium text-sm transition-colors
                    ${
                      currentTemplate === template.id
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  {saving && currentTemplate === template.id
                    ? "Applying..."
                    : currentTemplate === template.id
                    ? "Selected"
                    : "Use Template"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TemplateSelectionPage;
