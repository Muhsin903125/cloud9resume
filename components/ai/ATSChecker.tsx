import React, { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PlanSelectionModal from "../PlanSelectionModal";

interface ATSCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  resumeId?: string;
  onResumeUpdate?: () => void;
}

interface AnalysisResult {
  score: number;
  match_percentage: number;
  missing_keywords: {
    skills: string[];
    experience: string[];
    summary: string[];
  };
  found_keywords: string[];
  summary: string;
  formatting_issues: string[];
  role_fit: string;
  suggestions?: string[];
}

export const ATSChecker: React.FC<ATSCheckerProps> = ({
  isOpen,
  onClose,
  resumeData,
  resumeId,
  onResumeUpdate,
}) => {
  const [step, setStep] = useState<
    "input" | "analyzing" | "result" | "confirming" | "applying"
  >("input");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getTotalMissingKeywords = (kw: any) => {
    if (!kw) return 0;
    if (Array.isArray(kw)) return kw.length;
    return (
      (kw.skills?.length || 0) +
      (kw.experience?.length || 0) +
      (kw.summary?.length || 0)
    );
  };

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

      console.log("ATS Response:", res);

      const analysisData = res.data?.data || res.data;

      if (analysisData && analysisData.score !== undefined) {
        setResult(analysisData);
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

  const handleAutoApply = async () => {
    setStep("applying");

    try {
      const res = await apiClient.post("/ai/ats-apply-suggestions", {
        resumeData,
        jobDescription,
        resumeId,
        analysis: result,
      });

      if (res.data && res.data.success) {
        toast.success("Resume optimized successfully!");
        onResumeUpdate?.();
        setStep("input");
        setJobDescription("");
        setResult(null);
        onClose();
      } else {
        throw new Error(res.error || "Failed to apply suggestions");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to apply suggestions.");
      setStep("result");
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Custom Compact Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900">
              {step === "result"
                ? "ATS Analysis Results"
                : step === "confirming"
                ? "Confirm Auto-Optimize"
                : "ATS Optimizer"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {step === "input" && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2">
                  <SparklesIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-xs">
                      AI-Powered ATS Optimization
                    </h4>
                    <p className="text-[10px] text-blue-700 mt-0.5">
                      Paste a job description to analyze your resume. Get
                      keyword matches, ATS scores, and AI-powered suggestions.
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider">
                      <span className="text-blue-600">Analysis: 5 Credits</span>
                      <span className="text-blue-500">•</span>
                      <span className="text-indigo-600">
                        Auto-Apply: +10 Credits
                      </span>
                    </div>
                  </div>
                </div>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full h-40 p-2.5 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-xs text-gray-700"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAnalyze}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/30 text-xs"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Analyze Resume
                  </button>
                </div>
              </div>
            )}

            {step === "analyzing" && (
              <div className="flex flex-col items-center justify-center h-56 space-y-3">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-3 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-900">
                    Analyzing your resume...
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Checking keywords, formatting, and ATS compatibility.
                  </p>
                </div>
              </div>
            )}

            {step === "applying" && (
              <div className="flex flex-col items-center justify-center h-56 space-y-3">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-3 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-900">
                    Optimizing your resume...
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    AI is applying suggestions and updating your resume.
                  </p>
                </div>
              </div>
            )}

            {step === "result" && result && (
              <div className="space-y-2.5">
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 p-2.5 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm">
                  <div
                    className={`relative w-14 h-14 flex items-center justify-center rounded-full border-3 text-lg font-bold flex-shrink-0 ${getScoreColor(
                      result.score
                    )}`}
                  >
                    {result.score}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xs font-bold text-gray-900">
                      {result.role_fit || "Overall"} Match
                    </h3>
                    <p className="text-gray-600 text-[10px] mt-0.5 leading-tight">
                      {result.summary}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1 text-[9px] mt-1">
                      <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                        {result.found_keywords?.length || 0} Keywords Found
                      </div>
                      <div className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                        {getTotalMissingKeywords(result.missing_keywords)}{" "}
                        Missing
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords Sectioned */}
                {getTotalMissingKeywords(result.missing_keywords) > 0 && (
                  <div className="bg-red-50 p-2.5 rounded-lg border border-red-100 space-y-2">
                    <h4 className="flex items-center gap-1.5 font-bold text-red-900 text-xs">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      Missing Keywords
                    </h4>

                    {/* Skills Category */}
                    {!Array.isArray(result.missing_keywords) &&
                      result.missing_keywords.skills?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-red-700 uppercase tracking-wider">
                            Skills & Tools
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_keywords.skills.map((kw) => (
                              <span
                                key={kw}
                                className="bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Experience Category */}
                    {!Array.isArray(result.missing_keywords) &&
                      result.missing_keywords.experience?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-red-700 uppercase tracking-wider">
                            Experience & Industry Terms
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_keywords.experience.map((kw) => (
                              <span
                                key={kw}
                                className="bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Summary/Strategic Category */}
                    {!Array.isArray(result.missing_keywords) &&
                      result.missing_keywords.summary?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-red-700 uppercase tracking-wider">
                            Strategic & Summary
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_keywords.summary.map((kw) => (
                              <span
                                key={kw}
                                className="bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Fallback for Array structure (compatibility) */}
                    {Array.isArray(result.missing_keywords) && (
                      <div className="flex flex-wrap gap-1">
                        {result.missing_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Formatting Issues */}
                {result.formatting_issues &&
                  result.formatting_issues.length > 0 && (
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-1.5 text-xs">
                        Formatting Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {result.formatting_issues.map((issue, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 text-[10px] text-gray-600 leading-tight"
                          >
                            <XCircleIcon className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-1.5">
                  <button
                    onClick={() => {
                      setStep("input");
                      setJobDescription("");
                      setResult(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold text-xs transition-colors"
                  >
                    New Analysis
                  </button>
                  <button
                    onClick={() => setStep("confirming")}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/30 text-xs"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Auto-Apply Suggestions
                  </button>
                </div>
              </div>
            )}

            {step === "confirming" && result && (
              <div className="space-y-2.5">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-2">
                    <SparklesIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-indigo-900 text-xs">
                        Auto-Optimize Your Resume
                      </h3>
                      <p className="text-[10px] text-indigo-700 mt-0.5">
                        AI will automatically update your resume with:
                      </p>
                      <ul className="mt-1.5 space-y-1 text-[10px] text-indigo-800">
                        <li className="flex items-center gap-1.5">
                          <CheckCircleIcon className="w-3 h-3 text-indigo-600" />
                          Add {getTotalMissingKeywords(result.missing_keywords)}{" "}
                          missing keywords naturally
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircleIcon className="w-3 h-3 text-indigo-600" />
                          Rewrite sections for better ATS compatibility
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircleIcon className="w-3 h-3 text-indigo-600" />
                          Optimize formatting and structure
                        </li>
                      </ul>
                      <div className="mt-2 p-2 bg-white/70 rounded border border-indigo-200">
                        <p className="text-[9px] font-bold text-indigo-900 uppercase tracking-wider">
                          Cost: 10 Additional Credits
                        </p>
                        <p className="text-[9px] text-indigo-600 mt-0.5">
                          Your current resume will be updated. You can always
                          undo changes later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <button
                    onClick={() => setStep("result")}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAutoApply}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/30 text-xs"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Confirm & Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PlanSelectionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          toast.success("Credits added! You can now optimize your resume.");
          setShowUpgradeModal(false);
        }}
      />
    </>
  );
};
