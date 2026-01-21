import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../../lib/authUtils";
import { TEMPLATE_REGISTRY } from "../../../lib/template-registry";
import { apiClient } from "../../../lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/Button";
import { toast } from "react-hot-toast";

const CreateResumePage: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<
    (typeof TEMPLATE_REGISTRY)[0] | null
  >(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateResume = async (templateId: string) => {
    setIsCreating(true);
    setPreviewTemplate(null);
    const loadingToast = toast.loading("Creating your resume...");

    try {
      const result = await apiClient.post("/resumes", {
        title: "Untitled Resume",
        templateId: templateId,
      });

      if (result.data && (result.data as any).success) {
        toast.success("Resume created!", { id: loadingToast });
        const resumeId = (result.data as any).data.id;
        router.push(`/dashboard/resume/${resumeId}/edit`);
      } else {
        throw new Error("Failed to create resume");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not create resume. Please try again.", {
        id: loadingToast,
      });
      setIsCreating(false);
    }
  };

  const openPreview = (
    e: React.MouseEvent,
    template: (typeof TEMPLATE_REGISTRY)[0],
  ) => {
    e.stopPropagation();
    setPreviewTemplate(template);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500">Loading templates...</span>
        </div>
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
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <h1 className="text-sm font-semibold text-gray-900">
                Choose a Template
              </h1>
            </div>
            <span className="text-xs text-gray-400">
              {TEMPLATE_REGISTRY.length} templates
            </span>
          </div>
        </div>

        {/* Main - Max 5 columns */}
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {TEMPLATE_REGISTRY.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ y: -3 }}
                className={`group relative bg-white rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  selectedTemplate === template.id
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                }`}
                onClick={() => handleCreateResume(template.id)}
              >
                {/* Preview Image - Cropped height */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {template.previewUrl ? (
                    <img
                      src={template.previewUrl}
                      alt={template.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No Preview
                    </div>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={(e) => openPreview(e, template)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <EyeIcon className="w-3.5 h-3.5 text-gray-600" />
                  </button>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="primary"
                      className="shadow-lg transform scale-90 group-hover:scale-100 transition-transform text-xs py-1.5 px-3"
                    >
                      Use
                    </Button>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    {template.isAtsSafe && (
                      <span className="bg-green-50 text-green-600 text-[8px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ml-1">
                        ATS
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {previewTemplate.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {previewTemplate.category} Template
                  </p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Image */}
              <div className="flex-1 overflow-auto bg-gray-100 p-4">
                <img
                  src={previewTemplate.previewUrl}
                  alt={previewTemplate.name}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleCreateResume(previewTemplate.id)}
                >
                  Use This Template
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creating Overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Creating resume...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateResumePage;
