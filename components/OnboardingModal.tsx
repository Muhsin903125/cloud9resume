import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { apiClient } from "../lib/apiClient";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authUtils";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
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
        onComplete();
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
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
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Cloud9Profile! 👋
            </h2>
            <p className="text-gray-500">
              Help us personalize your experience by answering a quick question.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Experienced Option */}
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

            {/* Fresher Option */}
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
