import { NextPage } from "next";
import { useState } from "react";
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
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

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
        <title>ATS Checker - Cloud9Profile</title>
        <meta
          name="description"
          content="Optimize your resume for Applicant Tracking Systems"
        />
      </Head>

      <div className="min-h-screen font-sans text-gray-900 bg-gray-50 selection:bg-blue-100 selection:text-blue-900 relative">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 sticky top-0 z-30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-blue-600" />
                  ATS Optimization
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Ensure your resume passes automated screening
                </p>
              </div>
              {results && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setResults(null);
                    setUploadedFile(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  New Analysis
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Column: Context */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
                      Beat the <span className="text-blue-600">ATS Bot</span>.
                    </h2>
                    <p className="text-lg text-gray-500 leading-relaxed mb-6">
                      75% of resumes are rejected by automated systems before a
                      human ever sees them. Don't let yours be one of them.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Keyword Analysis
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          We scan your resume against the job description to
                          find critical missing keywords.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Smart Scoring
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Get a 0-100 compatibility score and actionable
                          feedback to improve your chances.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Input Area */}
                <div className="lg:col-span-7">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 md:p-8">
                    <div className="space-y-6">
                      {/* File Upload */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          1. Upload Resume
                        </label>
                        <div
                          className={`relative group border-2 border-dashed rounded-xl transition-all duration-300 ${
                            uploadedFile
                              ? "border-blue-500 bg-blue-50/20"
                              : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="p-8 text-center">
                            {uploadedFile ? (
                              <div className="flex flex-col items-center justify-center gap-3">
                                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                  <DocumentTextIcon className="h-6 w-6" />
                                </div>
                                <div className="text-blue-900 font-medium text-lg">
                                  {uploadedFile.name}
                                </div>
                                <span className="text-blue-500 text-sm font-medium">
                                  Click to change file
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <div className="h-12 w-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                                  <ArrowUpTrayIcon className="h-6 w-6" />
                                </div>
                                <div className="text-gray-600 font-medium">
                                  <span className="text-blue-600 hover:underline">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                  PDF, DOCX (Max 5MB)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* JD Input */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          2. Job Description
                        </label>
                        <div className="relative">
                          <textarea
                            className="w-full h-40 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm resize-none placeholder:text-gray-400 py-4 px-4 leading-relaxed transition-all"
                            placeholder="Paste the full job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                          ></textarea>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex items-center gap-3"
                        >
                          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        disabled={
                          isAnalyzing || !uploadedFile || !jobDescription.trim()
                        }
                        className="w-full py-4 px-6 bg-gray-900 text-white text-base font-bold rounded-xl hover:bg-black focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-900/10"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Analyzing Resume...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-5 h-5" />
                            Start Analysis
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Results View - Redesigned */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Score Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="relative z-10 max-w-xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Analysis Complete
                    </h2>
                    <p className="text-base text-gray-500">
                      {results.score >= 80
                        ? "Excellent match! Your resume is highly optimized for this role."
                        : results.score >= 60
                        ? "Good potential. A few tweaks to keywords and phrasing could significantly boost your score."
                        : "Low compatibility detected. We recommend tailoring your resume more closely to the job description."}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 relative z-10">
                    <div className="text-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        ATS Score
                      </div>
                      <div className="flex items-baseline justify-center">
                        <span
                          className={`text-6xl font-black tracking-tighter ${
                            results.score >= 80
                              ? "text-green-600"
                              : results.score >= 60
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {results.score}
                        </span>
                        <span className="text-xl text-gray-400 ml-1 font-medium">
                          /100
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block h-16 w-px bg-gray-200"></div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-500 font-medium">
                          Matches
                        </div>
                        <div className="flex-1 h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${
                                (results.keywords.present.length /
                                  (results.keywords.present.length +
                                    results.keywords.missing.length)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold text-green-600 w-6 text-right">
                          {results.keywords.present.length}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-500 font-medium">
                          Missing
                        </div>
                        <div className="flex-1 h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${
                                (results.keywords.missing.length /
                                  (results.keywords.present.length +
                                    results.keywords.missing.length)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold text-red-600 w-6 text-right">
                          {results.keywords.missing.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Missing Keywords */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Missing Keywords
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Critical terms found in JD but not in your resume
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.missing.length > 0 ? (
                          <>
                            {(showAllKeywords
                              ? results.keywords.missing
                              : results.keywords.missing.slice(0, 20)
                            ).map((k, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100"
                              >
                                {k}
                              </span>
                            ))}
                          </>
                        ) : (
                          <div className="w-full py-12 text-center">
                            <div className="inline-flex p-4 bg-green-50 rounded-full text-green-600 mb-3">
                              <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <p className="text-gray-900 font-medium">
                              All keywords matched!
                            </p>
                            <p className="text-sm text-gray-500">
                              Your resume covers all the bases.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {results.keywords.missing.length > 20 && (
                      <button
                        onClick={() => setShowAllKeywords(!showAllKeywords)}
                        className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 py-2 px-4 hover:bg-blue-50 rounded-lg transition-colors self-start"
                      >
                        {showAllKeywords
                          ? "Show Less"
                          : `View ${
                              results.keywords.missing.length - 20
                            } more keywords`}
                      </button>
                    )}
                  </motion.div>

                  {/* Recommendations */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                        <LightBulbIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Smart Improvements
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Actionable tips to increase your score
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-4">
                      {results.recommendations.length > 0 ? (
                        results.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="flex gap-4 text-gray-600 text-sm group"
                          >
                            <span className="shrink-0 h-6 w-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed py-1">{rec}</span>
                          </li>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-400 mb-3">
                            <SparklesIcon className="w-8 h-8" />
                          </div>
                          <p>No specific recommendations.</p>
                        </div>
                      )}
                    </ul>
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
