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
} from "@heroicons/react/24/outline";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

type Step = "level" | "method" | "import";

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("level");
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSelection = async (level: "experienced" | "fresher") => {
    if (!user) return;
    setSelectedLevel(level);
    setLoading(true);

    try {
      const res = await apiClient.post("/user/complete-onboarding", {
        userId: user.id,
        experienceLevel: level,
      });

      if (res.error) {
        alert("Something went wrong. Please try again.");
      } else {
        setStep("method");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelection = (method: "import" | "scratch") => {
    if (method === "import") {
      setStep("import");
    } else {
      onComplete();
    }
  };

  const steps = [
    { id: "level", label: "Experience" },
    { id: "method", label: "Method" },
    { id: "import", label: "Import" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Header */}
          <div className="bg-blue-600 px-6 py-6 text-center relative">
            {/* Back Button */}
            {step !== "level" && (
              <button
                onClick={() => setStep(step === "import" ? "method" : "level")}
                className="absolute left-4 top-4 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-3">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
                    i <= currentStepIndex
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {i < currentStepIndex ? (
                    <CheckCircleIcon className="w-3 h-3" />
                  ) : (
                    <span className="w-3 h-3 flex items-center justify-center text-[8px]">
                      {i + 1}
                    </span>
                  )}
                  {s.label}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {step === "level" && "Welcome to Cloud9Profile"}
              {step === "method" && "Choose Your Starting Point"}
              {step === "import" && "Import Your Resume"}
            </h2>
            <p className="text-blue-100 text-sm">
              {step === "level" && "Tell us about your experience level"}
              {step === "method" &&
                "Select how you'd like to build your profile"}
              {step === "import" &&
                "Upload your existing resume to get started"}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Experience Level */}
            {step === "level" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Experienced */}
                  <button
                    onClick={() => handleSelection("experienced")}
                    disabled={loading}
                    className="group p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 transition-all text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">
                          Working Professional
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          I have work experience and want to enhance my career
                          profile
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Resume Builder
                      </span>
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Portfolio
                      </span>
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        ATS Checker
                      </span>
                    </div>
                  </button>

                  {/* Fresher */}
                  <button
                    onClick={() => handleSelection("fresher")}
                    disabled={loading}
                    className="group p-5 rounded-xl border-2 border-gray-200 hover:border-green-500 bg-white hover:bg-green-50/50 transition-all text-left relative"
                  >
                    <div className="absolute top-2 right-2 text-[8px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                      FREE CREDITS
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <AcademicCapIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">
                          Student / Fresher
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Starting my career and need help building my first
                          resume
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                        +10 Credits
                      </span>
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Templates
                      </span>
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Guided Setup
                      </span>
                    </div>
                  </button>
                </div>

                {/* Features Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-3">
                    What you'll get access to
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <DocumentTextIcon className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-medium text-gray-700">
                        Resume Builder
                      </p>
                    </div>
                    <div>
                      <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-medium text-gray-700">
                        Portfolio Builder
                      </p>
                    </div>
                    <div>
                      <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <ChartBarIcon className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-medium text-gray-700">
                        ATS Score Check
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Method Selection */}
            {step === "method" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Import Resume */}
                  <button
                    onClick={() => handleMethodSelection("import")}
                    className="group p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 transition-all text-left relative"
                  >
                    <div className="absolute top-2 right-2 text-[8px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      RECOMMENDED
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <CloudArrowUpIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">
                          Import Resume
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Upload your existing PDF or DOCX resume
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        Auto-fill all sections
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        Supports PDF and DOCX formats
                      </div>
                    </div>
                  </button>

                  {/* Start from Scratch */}
                  <button
                    onClick={() => handleMethodSelection("scratch")}
                    className="group p-5 rounded-xl border-2 border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                        <DocumentPlusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">
                          Start Fresh
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Build your resume step-by-step from scratch
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        50+ professional templates
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        Step-by-step guidance
                      </div>
                    </div>
                  </button>
                </div>

                {selectedLevel === "fresher" && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-green-800">
                        10 free credits added to your account!
                      </p>
                      <p className="text-[10px] text-green-600">
                        Use them to generate content and analyze resumes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Import */}
            {step === "import" && (
              <div className="max-w-xl mx-auto">
                <ResumeUploader
                  onUploadSuccess={(data, resumeId) => {
                    router.push(`/dashboard/resume/${resumeId}/templates`);
                  }}
                  onCancel={() => setStep("method")}
                />
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="pb-6 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Setting up your account...
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
