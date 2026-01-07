import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { apiClient } from "../lib/apiClient";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authUtils";
import { ResumeUploader } from "./ai/ResumeUploader";
import {
  CloudArrowUpIcon,
  DocumentPlusIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EnvelopeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

type Step = "method" | "import";

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Mark onboarding as complete when modal opens
  React.useEffect(() => {
    if (isOpen && user) {
      const completeOnboarding = async () => {
        try {
          await apiClient.post("/user/complete-onboarding", {
            userId: user.id,
          });
        } catch (error) {
          console.error("Onboarding error:", error);
        }
      };
      completeOnboarding();
    }
  }, [isOpen, user]);

  const handleMethodSelection = async (method: "import" | "scratch") => {
    if (method === "import") {
      setStep("import");
    } else {
      // Create a new resume and redirect to editor
      try {
        setLoading(true);
        const response = await apiClient.post("/resumes", {
          title: "My Resume",
        });

        if (response.data && response.data.success && response.data.data) {
          // Navigate directly to the editor page
          window.location.href = `/dashboard/resume/${response.data.data.id}/edit`;
        } else {
          console.error("Failed to create resume");
          onComplete();
        }
      } catch (error) {
        console.error("Error creating resume:", error);
        onComplete();
      } finally {
        setLoading(false);
      }
    }
  };

  const steps = [
    { id: "method", label: "Method" },
    { id: "import", label: "Import" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-lg"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-100">
          {/* Progress Bar */}
          <div className="h-1.5 bg-gradient-to-r from-gray-100 to-gray-50">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 transition-all duration-700 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Header */}
          <div className="relative px-8 py-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700">
            {/* Back Button */}
            {step === "import" && (
              <button
                onClick={() => setStep("method")}
                className="absolute left-6 top-6 text-white/90 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-5">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                    i <= currentStepIndex
                      ? "bg-white/25 text-white shadow-lg scale-105"
                      : "bg-white/10 text-white/60 scale-95"
                  }`}
                >
                  {i < currentStepIndex ? (
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-[9px] font-bold">
                      {i + 1}
                    </span>
                  )}
                  {s.label}
                </div>
              ))}
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {step === "method" && "Welcome to Cloud9Profile"}
                {step === "import" && "Import Your Resume"}
              </h2>
              <p className="text-blue-100/90 text-sm leading-relaxed max-w-lg mx-auto">
                {step === "method" &&
                  "Choose how you'd like to build your professional profile"}
                {step === "import" &&
                  "Upload your existing resume to get started quickly"}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 1: Method Selection */}
            {step === "method" && (
              <div className="space-y-6">
                {/* Welcome Info Banner */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-100 mb-6">
                  <div className="flex items-center gap-2 mb-5">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      What You'll Get Access To
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center group">
                      <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DocumentTextIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        Resume Builder
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ATS-optimized templates
                      </p>
                    </div>
                    <div className="text-center group">
                      <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BriefcaseIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        Portfolio Builder
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Showcase your work
                      </p>
                    </div>
                    <div className="text-center group">
                      <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <EnvelopeIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        Cover Letters
                      </p>
                      <p className="text-[10px] text-gray-500">
                        AI-powered writing
                      </p>
                    </div>
                    <div className="text-center group">
                      <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ChartBarIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        ATS Score Check
                      </p>
                      <p className="text-[10px] text-gray-500">Beat the bots</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Import Resume */}
                  <button
                    onClick={() => handleMethodSelection("import")}
                    className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-white hover:shadow-xl transition-all duration-300 text-left relative transform hover:-translate-y-1"
                  >
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                      RECOMMENDED
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CloudArrowUpIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1 text-lg">
                          Import Resume
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Upload your existing PDF or DOCX resume
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Auto-fill all sections instantly
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Supports PDF and DOCX formats
                      </div>
                    </div>
                  </button>

                  {/* Start from Scratch */}
                  <button
                    onClick={() => handleMethodSelection("scratch")}
                    className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-400 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DocumentPlusIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1 text-lg">
                          Start Fresh
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Build your resume step-by-step from scratch
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        50+ professional templates
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Step-by-step guidance
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Import */}
            {step === "import" && (
              <div className="max-w-xl mx-auto">
                <ResumeUploader
                  onUploadSuccess={(data, resumeId) => {
                    // Navigate directly to the editor page
                    window.location.href = `/dashboard/resume/${resumeId}/edit`;
                  }}
                  onCancel={() => setStep("method")}
                />
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="pb-8 text-center">
              <div className="inline-flex items-center gap-3 text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full border border-blue-100 shadow-lg">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Setting up your account...</span>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function AcademicCapIcon(props: any) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.24 50.552 50.552 0 0 0-2.658.813m-15.482 0A50.923 50.923 0 0 1 12 13.489a50.92 50.92 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
      />
    </svg>
  );
}
