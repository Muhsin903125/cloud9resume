import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  EditIcon,
  DownloadIcon,
  CopyIcon,
  AIIcon,
  EyeIcon,
  ChevronLeftIcon,
} from "../../../../components/Icons";

const EnhancedResumeEditor = () => {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("edit");

  const navItems = [
    {
      id: "edit",
      label: "Edit",
      icon: EditIcon,
      action: () => setActiveTab("edit"),
    },
    {
      id: "export",
      label: "Export",
      icon: DownloadIcon,
      action: () => router.push(`/dashboard/resume/${id}/export`),
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: EyeIcon,
      action: () => router.push(`/dashboard/resume/${id}/portfolio`),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: EditIcon,
      action: () => router.push(`/dashboard/resume/${id}/analytics`),
    },
    {
      id: "ai-tools",
      label: "AI Tools",
      icon: AIIcon,
      action: () => router.push(`/dashboard/resume/${id}/ai-tools`),
    },
  ];

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        setResume(data.data);
      } else {
        setError(data.error || "Failed to load resume");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load resume");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {resume?.title ? `Edit ${resume.title}` : "Resume"} - Cloud9Profile
        </title>
      </Head>

      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard/resumes")}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeftIcon size={14} />
              Back
            </button>
            <h1 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
              {resume?.title || "Resume Editor"}
            </h1>
            <div className="w-10"></div> {/* Spacer for center alignment */}
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-100 bg-white overflow-x-auto scrollbar-hide">
            <div className="max-w-5xl mx-auto px-4 flex gap-6">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`
                        flex items-center gap-2 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap
                        ${
                          isActive
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                  >
                    <IconComponent
                      size={14}
                      className={isActive ? "text-blue-600" : "text-gray-400"}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <EditIcon size={18} className="text-gray-400" />
              Editor Workspace
            </h2>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <QuickActionButton
                icon={EyeIcon}
                label="View Resume"
                onClick={() =>
                  window.open(`/portfolio/${resume?.id}`, "_blank")
                }
              />
              <QuickActionButton
                icon={CopyIcon}
                label="Duplicate"
                onClick={() => alert("Coming soon")}
              />
              <QuickActionButton
                icon={DownloadIcon}
                label="Export PDF"
                onClick={() => router.push(`/dashboard/resume/${id}/export`)}
              />
              <QuickActionButton
                icon={AIIcon}
                label="AI Improve"
                onClick={() => router.push(`/dashboard/resume/${id}/ai-tools`)}
              />
            </div>

            {/* Navigation Suggestions */}
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100/50 mb-6">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Pro Tip:</strong> Use the tab bar above to switch
                between editing different sections, choosing templates, and
                analyzing your resume with AI.
              </p>
            </div>

            {/* Content Placeholder */}
            <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
                The section editor is currently being updated to match the new
                design system. Full editing capabilities will be restored
                shortly.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

const QuickActionButton = ({ icon: IconComponent, label, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm hover:bg-blue-50/10 transition-all"
    >
      <div className="p-2 bg-gray-50 rounded-lg text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-100 transition-colors">
        <IconComponent size={18} />
      </div>
      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
        {label}
      </span>
    </button>
  );
};

export default EnhancedResumeEditor;
