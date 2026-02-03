import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { CREDIT_COSTS } from "@/lib/subscription";
import { CreditConfirmModal } from "../modals/CreditConfirmModal";
import PlanUpgradeModal from "../PlanUpgradeModal";
import { apiClient } from "@/lib/apiClient";
import toast from "react-hot-toast";

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
  const [balance, setBalance] = useState(0);
  const [showConfirmAnalyze, setShowConfirmAnalyze] = useState(false);
  const [showConfirmApply, setShowConfirmApply] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      // Lock overflow when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchBalance = async () => {
    try {
      const { data } = await apiClient.get("/credits");
      if (data?.success) {
        setBalance(data.data.stats.current);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const analyzeCost = CREDIT_COSTS.ats_analysis;
  const applyCost = CREDIT_COSTS.ats_auto_apply;

  const getTotalMissingKeywords = (kw: any) => {
    if (!kw) return 0;
    if (Array.isArray(kw)) return kw.length;
    return (
      (kw.skills?.length || 0) +
      (kw.experience?.length || 0) +
      (kw.summary?.length || 0)
    );
  };

  const handleAnalyzeClick = () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description.");
      return;
    }
    setShowConfirmAnalyze(true);
  };

  const confirmAnalyze = async () => {
    setShowConfirmAnalyze(false);
    setStep("analyzing");

    try {
      const res = await apiClient.post("/ai/ats-optimize", {
        resumeData,
        jobDescription,
        resumeId,
      });

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
    if (score >= 80) return "text-blue-600 border-blue-200 bg-blue-50";
    if (score >= 60) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl mx-2 sm:mx-4 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">
                      {step === "result"
                        ? "Analysis Report"
                        : "ATS AI Optimizer"}
                    </h2>
                    <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                      Powered by Cloud9 AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all transform hover:rotate-90"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
                <AnimatePresence mode="wait">
                  {step === "input" && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-blue-900 mb-0.5">
                            Target Job Description
                          </h4>
                          <p className="text-xs text-blue-700/80 leading-relaxed max-w-lg">
                            We'll compare your current resume against this job
                            posting to identify missing keywords.
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                {analyzeCost} Credits Analyze
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                              <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">
                                +{applyCost} Credits Auto-Apply
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the full job description here..."
                          className="relative w-full h-48 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-xs text-gray-700 placeholder:text-gray-400 font-mono leading-relaxed shadow-sm"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAnalyzeClick}
                          className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-gray-900/10 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <SparklesIcon className="w-4 h-4" />
                          Start Analysis
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {(step === "analyzing" || step === "applying") && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
                        <div
                          className={`absolute inset-0 border-4 ${
                            step === "applying"
                              ? "border-purple-500"
                              : "border-blue-500"
                          } border-t-transparent rounded-full animate-spin`}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {step === "applying" ? (
                            <FireIcon className="w-6 h-6 text-purple-500" />
                          ) : (
                            <ArrowPathIcon className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">
                        {step === "applying"
                          ? "Applying Optimization..."
                          : "Processing Analysis..."}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium max-w-xs text-center">
                        Synthesizing data points to optimize your strategy.
                      </p>
                    </motion.div>
                  )}

                  {step === "result" && result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Score Highlight */}
                      <div className="relative overflow-hidden bg-white border border-gray-100 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
                        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-blue-50 rotate-12 blur-3xl pointer-events-none transition-all" />

                        <div
                          className={`relative flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-full border-4 font-black text-2xl shadow-xl ${getScoreColor(
                            result.score,
                          )}`}
                        >
                          {result.score}
                        </div>

                        <div className="flex-1 text-center md:text-left relative z-10">
                          <h3 className="text-lg font-black text-gray-900 mb-1 tracking-tight">
                            {result.role_fit || "Strategic"} Fit Analysis
                          </h3>
                          <p className="text-gray-500 text-xs leading-relaxed italic mb-3">
                            "{result.summary}"
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg flex items-center gap-1.5">
                              <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-[10px] font-black text-green-600 uppercase">
                                {result.found_keywords?.length || 0} Matched
                              </span>
                            </div>
                            <div className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-1.5">
                              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-[10px] font-black text-red-600 uppercase">
                                {getTotalMissingKeywords(
                                  result.missing_keywords,
                                )}{" "}
                                Missing
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Missing Keywords Details */}
                      {getTotalMissingKeywords(result.missing_keywords) > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-gray-100 p-4 rounded-2xl space-y-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-red-50 rounded-lg">
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                              </div>
                              <h4 className="font-black text-gray-900 uppercase text-[9px] tracking-widest text-red-500">
                                Critical Skill Gaps
                              </h4>
                            </div>

                            <div className="space-y-4">
                              {/* Skills */}
                              {!Array.isArray(result.missing_keywords) &&
                                result.missing_keywords.skills?.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">
                                      Hard Skills & Tools
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {result.missing_keywords.skills.map(
                                        (kw) => (
                                          <span
                                            key={kw}
                                            className="px-2 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md text-[10px] font-bold"
                                          >
                                            {kw}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Industry Terms */}
                              {!Array.isArray(result.missing_keywords) &&
                                result.missing_keywords.experience?.length >
                                  0 && (
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">
                                      Foundational Experience
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {result.missing_keywords.experience.map(
                                        (kw) => (
                                          <span
                                            key={kw}
                                            className="px-2 py-1 bg-orange-50 border border-orange-100 text-orange-600 rounded-md text-[10px] font-bold"
                                          >
                                            {kw}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Formatting and Suggestions */}
                          <div className="bg-white border border-gray-100 p-4 rounded-2xl space-y-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gray-50 rounded-lg">
                                <XCircleIcon className="w-4 h-4 text-gray-400" />
                              </div>
                              <h4 className="font-black text-gray-900 uppercase text-[9px] tracking-widest text-gray-400">
                                Formatting Issues
                              </h4>
                            </div>

                            <div className="space-y-2">
                              {result.formatting_issues &&
                              result.formatting_issues.length > 0 ? (
                                result.formatting_issues.map((issue, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 p-2 bg-gray-50/50 rounded-lg transition-all hover:bg-gray-50 group"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                                    <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                                      {issue}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                  <CheckCircleIcon className="w-6 h-6 text-green-500/30 mb-1" />
                                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                    No issues found
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Final Actions */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setStep("input");
                            setJobDescription("");
                            setResult(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all hover:translate-x-[-2px]"
                        >
                          <ArrowPathIcon className="w-3.5 h-3.5" />
                          Back
                        </button>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setShowConfirmApply(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                          >
                            <SparklesIcon className="w-4 h-4" />
                            Auto-Apply Suggestions
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreditConfirmModal
        isOpen={showConfirmAnalyze}
        onClose={() => setShowConfirmAnalyze(false)}
        onConfirm={confirmAnalyze}
        title="Analyze Resume"
        description="We'll scan your resume against the job description to find keyword gaps and compatibility issues."
        cost={analyzeCost}
        balance={balance}
      />

      <CreditConfirmModal
        isOpen={showConfirmApply}
        onClose={() => setShowConfirmApply(false)}
        onConfirm={() => {
          setShowConfirmApply(false);
          handleAutoApply();
        }}
        title="Auto-Optimize Resume"
        description="AI will naturally integrate missing keywords and rephrase sections of your resume for maximum ATS compatibility."
        cost={applyCost}
        balance={balance}
      />

      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan="free"
        errorMessage="You've reached your credit limit. Upgrade your plan to get more credits and access advanced AI optimization features."
      />
    </>
  );
};
