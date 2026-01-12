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
import PlanSelectionModal from "../PlanSelectionModal";
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
    if (score >= 80) return "text-blue-400 border-blue-400/50 bg-blue-500/10";
    if (score >= 60)
      return "text-yellow-400 border-yellow-400/50 bg-yellow-500/10";
    return "text-red-400 border-red-400/50 bg-red-500/10";
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl mx-2 sm:mx-4 bg-[#0f172a] border border-white/10 rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-6 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <SparklesIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight uppercase">
                      {step === "result"
                        ? "Analysis Report"
                        : "ATS AI Optimizer"}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                      Powered by Cloud9 AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-900/40">
                <AnimatePresence mode="wait">
                  {step === "input" && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl">
                          <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-black text-blue-100 mb-1">
                            Target Job Description
                          </h4>
                          <p className="text-sm text-blue-300/70 leading-relaxed max-w-lg">
                            We'll compare your current resume against this job
                            posting to identify missing keywords and formatting
                            improvements.
                          </p>
                          <div className="mt-4 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                {analyzeCost} Credits Analyze
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                +{applyCost} Credits Auto-Apply
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the full job description here..."
                          className="relative w-full h-64 p-6 bg-black/40 border border-white/5 rounded-3xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none text-sm text-slate-300 placeholder:text-slate-600 font-mono leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={onClose}
                          className="px-6 py-3 text-slate-400 hover:text-white font-bold text-sm uppercase transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAnalyzeClick}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <SparklesIcon className="w-5 h-5" />
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
                      className="flex flex-col items-center justify-center py-20"
                    >
                      <div className="relative mb-10">
                        <div className="w-24 h-24 rounded-full border-4 border-white/5"></div>
                        <div
                          className={`absolute inset-0 border-4 ${
                            step === "applying"
                              ? "border-purple-500"
                              : "border-blue-500"
                          } border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.5)]`}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {step === "applying" ? (
                            <FireIcon className="w-8 h-8 text-purple-400" />
                          ) : (
                            <ArrowPathIcon className="w-8 h-8 text-blue-400" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        {step === "applying"
                          ? "Applying Optimization..."
                          : "Processing AI Analysis..."}
                      </h3>
                      <p className="text-slate-500 font-medium max-w-xs text-center">
                        Our AI models are cross-referencing millions of data
                        points to optimize your strategy.
                      </p>
                    </motion.div>
                  )}

                  {step === "result" && result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Score Highlight */}
                      <div className="relative overflow-hidden bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl sm:rounded-[40px] flex flex-col md:flex-row items-center gap-6 sm:gap-8 group">
                        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-blue-600/5 rotate-12 blur-3xl pointer-events-none group-hover:bg-blue-600/10 transition-all" />

                        <div
                          className={`relative flex-shrink-0 w-28 h-28 flex items-center justify-center rounded-full border-4 font-black text-3xl shadow-2xl ${getScoreColor(
                            result.score
                          )} shadow-${
                            result.score >= 60
                              ? result.score >= 80
                                ? "blue"
                                : "yellow"
                              : "red"
                          }-900/20`}
                        >
                          {result.score}
                        </div>

                        <div className="flex-1 text-center md:text-left relative z-10">
                          <h3 className="text-xl font-black text-white mb-2 tracking-tight">
                            {result.role_fit || "Strategic"} Fit Analysis
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed italic">
                            "{result.summary}"
                          </p>
                          <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-400" />
                              <span className="text-xs font-black text-green-400 uppercase">
                                {result.found_keywords?.length || 0} Matched
                              </span>
                            </div>
                            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                              <span className="text-xs font-black text-red-400 uppercase">
                                {getTotalMissingKeywords(
                                  result.missing_keywords
                                )}{" "}
                                Missing
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Missing Keywords Details */}
                      {getTotalMissingKeywords(result.missing_keywords) > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-500/10 rounded-xl">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                              </div>
                              <h4 className="font-black text-white uppercase text-[10px] tracking-widest text-red-400">
                                Critical Skill Gaps
                              </h4>
                            </div>

                            <div className="space-y-6">
                              {/* Skills */}
                              {!Array.isArray(result.missing_keywords) &&
                                result.missing_keywords.skills?.length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">
                                      Hard Skills & Tools
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {result.missing_keywords.skills.map(
                                        (kw) => (
                                          <span
                                            key={kw}
                                            className="px-3 py-1 bg-red-500/5 border border-red-500/10 text-red-400/80 rounded-lg text-xs font-medium"
                                          >
                                            {kw}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Industry Terms */}
                              {!Array.isArray(result.missing_keywords) &&
                                result.missing_keywords.experience?.length >
                                  0 && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">
                                      Foundational Experience
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {result.missing_keywords.experience.map(
                                        (kw) => (
                                          <span
                                            key={kw}
                                            className="px-3 py-1 bg-red-500/5 border border-red-500/10 text-red-400/80 rounded-lg text-xs font-medium"
                                          >
                                            {kw}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Formatting and Suggestions */}
                          <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-xl">
                                <XCircleIcon className="w-5 h-5 text-slate-400" />
                              </div>
                              <h4 className="font-black text-white uppercase text-[10px] tracking-widest text-slate-400">
                                Formatting Issues
                              </h4>
                            </div>

                            <div className="space-y-3">
                              {result.formatting_issues &&
                              result.formatting_issues.length > 0 ? (
                                result.formatting_issues.map((issue, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 bg-white/2 rounded-xl transition-all hover:bg-white/5 group"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 group-hover:bg-slate-400" />
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                      {issue}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/10">
                                  <CheckCircleIcon className="w-8 h-8 text-green-500/30 mb-2" />
                                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                    No issues found
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Final Actions */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
                        <button
                          onClick={() => {
                            setStep("input");
                            setJobDescription("");
                            setResult(null);
                          }}
                          className="flex items-center gap-2 px-8 py-3 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all hover:translate-x-[-4px]"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Back to Analysis
                        </button>

                        <div className="flex items-center gap-4">
                          <div className="hidden lg:block text-right">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">
                              Recommended Action
                            </p>
                            <p className="text-xs text-blue-400 font-black tracking-tight tracking-wide">
                              AI-Powered Optimization
                            </p>
                          </div>
                          <button
                            onClick={() => setShowConfirmApply(true)}
                            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[24px] font-black text-sm uppercase shadow-2xl shadow-blue-600/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3"
                          >
                            <SparklesIcon className="w-6 h-6" />
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
