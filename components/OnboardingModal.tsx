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
  const router = useRouter();
  const { user } = useAuth();

  const handleSelection = async (level: "experienced" | "fresher") => {
    if (!user) return;
    setLoading(true);

    try {
      const res = await apiClient.post("/user/complete-onboarding", {
        userId: user.id,
        experienceLevel: level,
      });

      if (res.error) {
        alert("Something went wrong. Please try again.");
      } else {
        // Move to next step instead of completing immediately
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
      // Create from scratch -> Close modal (Dashboard handles the rest)
      onComplete();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // Force user to choose
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl border border-gray-100 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            {step !== "level" && (
              <button
                onClick={() => setStep(step === "import" ? "method" : "level")}
                className="absolute left-0 top-1 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === "level" && "Welcome to Cloud9Profile! 👋"}
              {step === "method" && "How would you like to start?"}
              {step === "import" && "Import your Resume"}
            </h2>
            <p className="text-gray-500">
              {step === "level" &&
                "Help us personalize your experience by answering a quick question."}
              {step === "method" &&
                "Choose the best way to build your professional profile."}
              {step === "import" &&
                "Upload your existing resume to auto-fill your profile."}
            </p>
          </div>

          <div className="relative z-10 transition-all duration-300">
            {/* Step 1: Experience Level */}
            {step === "level" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelection("experienced")}
                  disabled={loading}
                  className="group relative p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="mb-3 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ApproverIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700">
                    Experienced
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I have work experience and want to optimize my professional
                    resume.
                  </p>
                </button>

                <button
                  onClick={() => handleSelection("fresher")}
                  disabled={loading}
                  className="group relative p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="mb-3 w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700">
                    Fresher / Student
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I am a student or recent graduate looking for my first job.
                  </p>
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    GET FREE CREDITS
                  </span>
                </button>
              </div>
            )}

            {/* Step 2: Method Selection */}
            {step === "method" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleMethodSelection("import")}
                  className="group relative p-6 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="mb-3 w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <CloudArrowUpIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-700">
                    Import Resume
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Upload your existing PDF or DOCX. user AI to extract data
                    automatically.
                  </p>
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                </button>

                <button
                  onClick={() => handleMethodSelection("scratch")}
                  className="group relative p-6 rounded-xl border border-gray-200 hover:border-gray-500 hover:bg-gray-50/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <div className="mb-3 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <DocumentPlusIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-gray-700">
                    Start from Scratch
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Build your resume step-by-step using our professional
                    templates.
                  </p>
                </button>
              </div>
            )}

            {/* Step 3: Import */}
            {step === "import" && (
              <div className="max-w-xl mx-auto">
                <ResumeUploader
                  onUploadSuccess={(data, resumeId) => {
                    // Navigate to template selection
                    router.push(`/dashboard/resume/${resumeId}/templates`);
                  }}
                  onCancel={() => setStep("method")}
                />
              </div>
            )}
          </div>

          {loading && (
            <div className="mt-6 text-center text-sm text-gray-400 animate-pulse">
              Setting up your workspace...
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function ApproverIcon(props: any) {
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
        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
      />
    </svg>
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
