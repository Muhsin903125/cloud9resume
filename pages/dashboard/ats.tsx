import { NextPage } from "next";
import { useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  SparklesIcon,
  XMarkIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { getAssetUrl } from "../../lib/common-functions";

interface ATSAnalysis {
  score: number;
  keywords: {
    present: string[];
    missing: string[];
  };
  issues: string[];
  recommendations: string[];
}

const ATSCheckerPage: NextPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ATSAnalysis | null>(null);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState(""); // Simplified for consistency
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/pdf/extract-text", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.success && data.text) {
          setResumeText(data.text);
        } else {
          setError("Failed to extract text from file");
        }
      } catch (err) {
        setError("Error processing file");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && !resumeText) {
      setError("Please upload a resume first");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please provide a job description");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || uploadedFile?.name,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setResults({
          score: data.data.score,
          keywords: {
            present: data.data.matchedKeywords,
            missing: data.data.missingKeywords,
          },
          issues: data.data.weaknesses,
          recommendations: data.data.recommendations,
        });
        setShowAllKeywords(false);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Head>
        <title>ATS Optimizer - Cloud9Profile</title>
      </Head>

      {/* Force White Theme for Dashboard */}
      <style jsx global>{`
        :root {
          --quartz-base: #ffffff !important;
        }
        body {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }
      `}</style>

      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/10 overflow-x-hidden relative">
        {/* Atmosphere */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Header / Sub-Nav */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                  ATS Optimizer PRO
                </h1>
              </div>

              {results && (
                <button
                  onClick={() => {
                    setResults(null);
                    setUploadedFile(null);
                    setJobDescription("");
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Clear Results
                </button>
              )}
            </div>
          </div>
        </motion.header>

        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="input-stage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                    High Precision <span className="text-blue-600">Scan.</span>
                  </h2>
                  <p className="text-base text-slate-500 font-light max-w-2xl mx-auto">
                    Optimized for latest recruitment protocols.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-10 shadow-xl shadow-blue-500/5 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resume Upload Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                          01
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                          Resume Protocol
                        </h4>
                      </div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`min-h-[200px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${
                          uploadedFile
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-white"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {uploadedFile ? (
                          <div className="text-center group">
                            <DocumentTextIcon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                            <p className="text-xs font-black text-slate-900 truncate max-w-[180px]">
                              {fileName}
                            </p>
                            <p className="text-[9px] text-blue-500 font-bold uppercase mt-1">
                              Node Locked
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ArrowUpTrayIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-xs font-bold text-slate-900">
                              Upload Resume
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                              PDF / DOCX
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* JD Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                          02
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                          Analysis Target
                        </h4>
                      </div>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job description here..."
                        className="w-full h-full min-h-[200px] bg-slate-50/50 border-2 border-slate-200 rounded-[32px] p-6 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center pt-6 border-t border-slate-100">
                    {error && (
                      <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mb-4">
                        {error}
                      </p>
                    )}
                    <button
                      onClick={handleAnalyze}
                      disabled={
                        isAnalyzing || !uploadedFile || !jobDescription.trim()
                      }
                      className="px-12 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 text-sm"
                    >
                      {isAnalyzing ? "Analyzing Matrix..." : "Ignite Scan"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* High Clarity Results View */
              <motion.div
                key="results-stage"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white border border-slate-200 rounded-[48px] p-8 sm:p-12 shadow-xl shadow-blue-500/5 text-center">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2 block">
                    Engine Response
                  </span>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8">
                    Match Integrity: {results.score}%
                  </h2>

                  <div className="h-3 w-full bg-slate-100 rounded-full mb-12 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${results.score}%` }}
                      className="h-full bg-slate-900 rounded-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        Matched Nodes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.present.slice(0, 15).map((k, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                        Critical Gaps
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.missing.slice(0, 15).map((k, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-red-500"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default ATSCheckerPage;
