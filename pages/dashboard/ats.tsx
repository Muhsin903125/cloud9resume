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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
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
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/ats/analyze-file", {
        method: "POST",
        body: formData,
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
        <meta
          name="description"
          content="Optimize your resume for Applicant Tracking Systems"
        />
      </Head>

      <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
        {/* Glowing Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Navigation / Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-blue-400" />
                    ATS Optimizer
                  </h1>
                </div>
              </div>

              {results && (
                <button
                  onClick={() => {
                    setResults(null);
                    setUploadedFile(null);
                    setJobDescription("");
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  New Session
                </button>
              )}
            </div>
          </div>
        </motion.header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="input-stage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid lg:grid-cols-12 gap-12"
              >
                {/* Left: Branding & Context */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                        Enterprise AI Grade
                      </span>
                    </motion.div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                      Master the <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Recruitment Bot.
                      </span>
                    </h2>

                    <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                      Our advanced AI dissects job descriptions to map the exact
                      neural pathways HR bots use to rank candidates.
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {[
                      {
                        icon: <ChartBarIcon className="w-6 h-6" />,
                        title: "Precision Mapping",
                        desc: "Identify critical hard skills and hidden cultural keywords.",
                        color: "blue",
                      },
                      {
                        icon: <CheckCircleIcon className="w-6 h-6" />,
                        title: "Trust Verified",
                        desc: "Simulation mode shows exactly what the recruiter sees.",
                        color: "green",
                      },
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all group"
                      >
                        <div
                          className={`p-4 rounded-2xl bg-${feature.color}-500/10 text-${feature.color}-400 group-hover:scale-110 transition-transform`}
                        >
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right: Interaction Area */}
                <div className="lg:col-span-12 xl:col-span-7">
                  <div className="bg-slate-900 border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -mr-32 -mt-32" />

                    <div className="relative z-10 space-y-10">
                      {/* Step 1: Upload */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                            Step 01 / Upload Resume
                          </h4>
                          {uploadedFile && (
                            <button
                              onClick={() => setUploadedFile(null)}
                              className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
                            >
                              remove file
                            </button>
                          )}
                        </div>

                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file) setUploadedFile(file);
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative border-2 border-dashed rounded-[32px] transition-all duration-500 cursor-pointer p-10 text-center ${
                            uploadedFile
                              ? "border-blue-500/50 bg-blue-500/5"
                              : isDragging
                              ? "border-blue-500 bg-blue-500/10 scale-[0.98]"
                              : "border-white/5 bg-black/20 hover:border-white/10"
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
                            <div className="flex flex-col items-center gap-4">
                              <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400">
                                <DocumentTextIcon className="w-8 h-8" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-white truncate max-w-[300px]">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest mt-1">
                                  Ready for analysis
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-4">
                              <div className="p-4 bg-white/5 rounded-2xl text-slate-600 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                                <ArrowUpTrayIcon className="w-8 h-8" />
                              </div>
                              <div>
                                <p className="text-slate-400 font-bold">
                                  Drag resume or{" "}
                                  <span className="text-blue-400 underline decoration-blue-400/30">
                                    browse files
                                  </span>
                                </p>
                                <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mt-2">
                                  PDF, DOCX • MAX 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step 2: JD */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                          Step 02 / Targeting
                        </h4>
                        <div className="relative group/textarea">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-0 group-focus-within/textarea:opacity-20 transition duration-500"></div>
                          <textarea
                            className="relative w-full h-48 rounded-3xl border border-white/5 bg-black/40 p-6 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none font-mono"
                            placeholder="Paste the target job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                          ></textarea>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-3"
                        >
                          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      <button
                        onClick={handleAnalyze}
                        disabled={
                          isAnalyzing || !uploadedFile || !jobDescription.trim()
                        }
                        className="group relative w-full py-6 bg-blue-600 rounded-[28px] overflow-hidden shadow-2xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:hover:scale-100"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-center gap-3 font-black text-lg tracking-widest uppercase">
                          {isAnalyzing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              AI Crunching...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="w-6 h-6" />
                              Ignite Optimization
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Results View - Reimagined */
              <motion.div
                key="results-stage"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="space-y-10"
              >
                {/* Score Dashboard */}
                <div className="bg-slate-900 border border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 shadow-3xl flex flex-col xl:flex-row items-center justify-between gap-12 sm:gap-16 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/[0.03] skew-x-12 blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-2xl text-center xl:text-left">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6"
                    >
                      Analysis Result
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                      {results.score >= 80
                        ? "Optimization Level: Elite"
                        : results.score >= 60
                        ? "Strategic Progress Made"
                        : "Critical Gap Detected"}
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                      {results.score >= 80
                        ? "Your resume exhibits perfect semantic alignment with common recruitment algorithms."
                        : results.score >= 60
                        ? "Structural alignment is strong, but keyword density requires minor calibration for top-tier ranking."
                        : "Algorithms may struggle to categorize your profile. Focus on the high-level recommendations below."}
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative group/score">
                      <div className="absolute -inset-4 bg-blue-600/10 rounded-full blur-2xl group-hover/score:bg-blue-600/20 transition-all" />
                      <div className="relative flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/5 bg-slate-900 shadow-inner">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle
                            strokeWidth="6"
                            stroke="currentColor"
                            fill="transparent"
                            r="60"
                            cx="64"
                            cy="64"
                            className="text-white/5 sm:r-[76] sm:cx-[80] sm:cy-[80]"
                          />
                          <motion.circle
                            initial={{ strokeDashoffset: 480 }}
                            animate={{
                              strokeDashoffset:
                                480 - (480 * results.score) / 100,
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeWidth="6"
                            strokeDasharray={480}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="60"
                            cx="64"
                            cy="64"
                            className={`transition-all duration-1000 ${
                              results.score >= 80
                                ? "text-blue-500"
                                : results.score >= 60
                                ? "text-yellow-500"
                                : "text-red-500"
                            } sm:r-[76] sm:cx-[80] sm:cy-[80]`}
                          />
                        </svg>
                        <div className="text-center">
                          <div className="text-3xl sm:text-5xl font-black text-white tracking-tighter">
                            {results.score}
                          </div>
                          <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Score / 100
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block h-24 w-px bg-white/5" />

                    <div className="space-y-6 min-w-[200px]">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>Matches</span>
                          <span className="text-green-400">
                            {results.keywords.present.length}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (results.keywords.present.length /
                                  (results.keywords.present.length +
                                    results.keywords.missing.length)) *
                                100
                              }%`,
                            }}
                            className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>Gap Analysis</span>
                          <span className="text-red-400">
                            {results.keywords.missing.length}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (results.keywords.missing.length /
                                  (results.keywords.present.length +
                                    results.keywords.missing.length)) *
                                100
                              }%`,
                            }}
                            className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.5)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Detailed Gap Analysis */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                      <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
                        <ExclamationTriangleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">
                          Algorithm Blindspots
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                          Found in Job Description but not in your resume
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      {results.keywords.missing.length > 0 ? (
                        <div className="flex flex-wrap gap-2.5">
                          {(showAllKeywords
                            ? results.keywords.missing
                            : results.keywords.missing.slice(0, 24)
                          ).map((k, i) => (
                            <motion.span
                              key={i}
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                              }}
                              className="px-4 py-2 bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-bold rounded-xl transition-all"
                            >
                              {k}
                            </motion.span>
                          ))}
                          {results.keywords.missing.length > 24 &&
                            !showAllKeywords && (
                              <button
                                onClick={() => setShowAllKeywords(true)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                              >
                                + {results.keywords.missing.length - 24} More
                                Hidden
                              </button>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center opacity-50 grayscale group hover:grayscale-0 transition-all duration-700">
                          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                            <CheckCircleIcon className="w-10 h-10" />
                          </div>
                          <h4 className="text-lg font-black text-white">
                            Semantic Perfection
                          </h4>
                          <p className="text-sm text-slate-500 max-w-xs mt-2">
                            Recruiters will find exactly what they are searching
                            for in your profile.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Strategic Roadmap */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900 border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                        <LightBulbIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">
                          Strategic Roadmap
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                          AI suggestions to dominate the shortlist
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {results.recommendations.length > 0 ? (
                        results.recommendations.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex gap-4 group/item"
                          >
                            <div className="shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 flex items-center justify-center group-hover/item:border-blue-500/50 group-hover/item:text-blue-400 transition-all">
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium py-1 group-hover/item:text-slate-200 transition-colors">
                              {rec}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
                          <SparklesIcon className="w-12 h-12 text-slate-600 mb-4" />
                          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
                            Optimal State Reached
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
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
