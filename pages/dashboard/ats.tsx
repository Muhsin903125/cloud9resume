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
} from "@heroicons/react/24/outline";

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
        <title>ATS Checker - Cloud9 Resume</title>
        <meta
          name="description"
          content="Optimize your resume for Applicant Tracking Systems"
        />
      </Head>

      <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-xs font-semibold text-gray-900">
                ATS Optimization
              </span>
            </div>
            {results && (
              <button
                onClick={() => {
                  setResults(null);
                  setUploadedFile(null);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ArrowPathIcon className="h-3 w-3" />
                New Analysis
              </button>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {!results ? (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Context (Smaller) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                    Beat the ATS.
                  </h1>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Most companies use Applicant Tracking Systems to filter
                    resumes. Check if yours makes the cut.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Keyword Analysis
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Compare your resume against the job description to find
                        missing keywords.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Smart Scoring
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Get a compatibility score and actionable feedback to
                        improve.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Input Area (Larger) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6">
                  <div className="space-y-5">
                    {/* File Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 Uppercase tracking-wide">
                        1. Upload Resume
                      </label>
                      <div
                        className={`relative group border border-dashed rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                          uploadedFile
                            ? "border-blue-500 bg-blue-50/30"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="p-6 text-center">
                          {uploadedFile ? (
                            <div className="flex items-center justify-center gap-2 text-blue-700 text-sm font-medium">
                              <DocumentTextIcon className="h-5 w-5" />
                              <span className="truncate max-w-[200px]">
                                {uploadedFile.name}
                              </span>
                              <span className="text-blue-400 text-xs ml-1">
                                (Click to change)
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <ArrowUpTrayIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <div className="text-sm text-gray-600 font-medium">
                                <span className="text-blue-600">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </div>
                              <p className="text-xs text-gray-400">
                                PDF, DOCX (Max 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* JD Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        2. Job Description
                      </label>
                      <textarea
                        className="w-full h-32 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none placeholder:text-gray-400 py-3 px-3.5 leading-relaxed"
                        placeholder="Paste the full job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      ></textarea>
                    </div>

                    {error && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={
                        isAnalyzing || !uploadedFile || !jobDescription.trim()
                      }
                      className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                      ) : (
                        "Run Analysis"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results View - Redesigned */
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              {/* Score Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">
                    Analysis Results
                  </h2>
                  <p className="text-sm text-gray-500 max-w-lg">
                    {results.score >= 80
                      ? "Excellent match! Your profile is well-aligned."
                      : results.score >= 60
                      ? "Good potential, but needs some optimization."
                      : "Low compatibility. Consider tailoring your resume further."}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Score
                    </div>
                    <div className="flex items-baseline justify-center">
                      <span
                        className={`text-4xl font-bold tracking-tight ${
                          results.score >= 80
                            ? "text-green-600"
                            : results.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {results.score}
                      </span>
                      <span className="text-base text-gray-400 ml-1">/100</span>
                    </div>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full mb-1">
                        Match
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {results.keywords.present.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full mb-1">
                        Miss
                      </div>
                      <div className="text-lg font-bold text-red-700">
                        {results.keywords.missing.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Missing Keywords */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Missing Keywords
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5 content-start">
                      {results.keywords.missing.length > 0 ? (
                        <>
                          {(showAllKeywords
                            ? results.keywords.missing
                            : results.keywords.missing.slice(0, 30)
                          ).map((k, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100"
                            >
                              {k}
                            </span>
                          ))}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic py-2">
                          No critical keywords missing. Great job!
                        </div>
                      )}
                    </div>
                    {results.keywords.missing.length > 30 && (
                      <button
                        onClick={() => setShowAllKeywords(!showAllKeywords)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 self-start mt-1 flex items-center gap-1"
                      >
                        {showAllKeywords
                          ? "Show Less"
                          : `+${results.keywords.missing.length - 30} More`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <LightBulbIcon className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Smart Recommendations
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {results.recommendations.length > 0 ? (
                      results.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-gray-600 text-sm items-start"
                        >
                          <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                          <span className="leading-snug">{rec}</span>
                        </li>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic py-2">
                        No specific recommendations.
                      </div>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ATSCheckerPage;
