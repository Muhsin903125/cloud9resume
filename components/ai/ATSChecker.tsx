import React, { useState } from "react";
import SharedModal from "../SharedModal";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import PlanSelectionModal from "../PlanSelectionModal";

interface ATSCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  resumeId?: string;
}

interface AnalysisResult {
  score: number;
  match_percentage: number;
  missing_keywords: string[];
  found_keywords: string[];
  summary: string;
  formatting_issues: string[];
  role_fit: string;
}

export const ATSChecker: React.FC<ATSCheckerProps> = ({
  isOpen,
  onClose,
  resumeData,
  resumeId,
}) => {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description.");
      return;
    }

    setStep("analyzing");

    try {
      const res = await apiClient.post("/ai/ats-optimize", {
        resumeData,
        jobDescription,
        resumeId,
      });

      if (res.data) {
        setResult(res.data);
        setStep("result");
        toast.success("Analysis complete!");
      } else {
        throw new Error(res.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze.");
      setStep("input");
      if (
        error?.status === 402 ||
        error?.status === 403 ||
        error?.message?.includes("credits")
      ) {
        setShowUpgradeModal(true);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === "result" ? "ATS Analysis Results" : "ATS Optimizer"}
    >
      <div className="max-w-2xl mx-auto min-h-[400px]">
        {step === "input" && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <SparklesIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">
                  Optimize for a specific job
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Paste the job description below. Our AI will analyze your
                  resume against it, check for keywords, and give you a match
                  score.
                </p>
                <div className="mt-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Cost: 5 Credits
                </div>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description here..."
              className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-700"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyze}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Analyze Now
              </button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center h-80 space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                Analyzing your resume...
              </h3>
              <p className="text-gray-500">
                Checking keywords, formatting, and relevance.
              </p>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center sm:text-left">
              <div
                className={`relative w-24 h-24 flex items-center justify-center rounded-full border-4 text-3xl font-bold flex-shrink-0 ${getScoreColor(
                  result.score
                ).replace("bg-", "")}`}
              >
                {result.score}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {result.role_fit} Match
                </h3>
                <p className="text-gray-500 text-sm mt-1 mb-2">
                  {result.summary}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {result.found_keywords.length} Keywords Found
                  </div>
                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded">
                    {result.missing_keywords.length} Missing
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missing_keywords.length > 0 && (
              <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                <h4 className="flex items-center gap-2 font-bold text-red-900 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-white border border-red-200 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-red-600 mt-3">
                  Tip: Add these exact keywords to your Skills or Summary
                  section.
                </p>
              </div>
            )}

            {/* Formatting / Issues */}
            {result.formatting_issues.length > 0 && (
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">
                  Formatting Checks
                </h4>
                <ul className="space-y-2">
                  {result.formatting_issues.map((issue, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <XCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep("input")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        )}
      </div>

      <PlanSelectionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          toast.success("Credits added! You can now analyze your resume.");
          setShowUpgradeModal(false);
        }}
      />
    </SharedModal>
  );
};
