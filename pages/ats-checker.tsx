import { NextPage } from "next";
import { useState, useRef } from "react";
import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";
import SEO from "../components/SEO";

interface ATSResult {
  score: number;
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordStats: {
    totalJDKeywords: number;
    matchedCount: number;
    matchPercentage: number;
  };
  sections: {
    hasContactInfo: boolean;
    hasEducation: boolean;
    hasExperience: boolean;
    hasSkills: boolean;
    hasProjects: boolean;
  };
  insights: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const PublicATSChecker: NextPage = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<ATSResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({ name: "", email: "" });
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or DOC/DOCX file");
      return;
    }

    try {
      setError("");
      setIsUploading(true);
      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pdf/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.text) {
        setResumeText(data.text);
        setError("");
      } else {
        setError(data.error || "Failed to extract text from file");
        setFileName("");
      }
    } catch (err) {
      setError(
        `Error processing file: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please enter your resume text");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter the job description");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.email || !emailData.name) {
      setError("Please fill in all fields");
      return;
    }

    if (!results) {
      setError("No analysis results to send");
      return;
    }

    setEmailSending(true);
    setError("");

    try {
      const response = await fetch("/api/ats/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: emailData.name,
          email: emailData.email,
          analysisData: results,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const data = await response.json();
      if (data.success) {
        setEmailSuccess(true);
        setShowEmailForm(false);
        setTimeout(() => setEmailSuccess(false), 5000);
      } else {
        setError(data.error || "Failed to send email");
      }
    } catch (err) {
      setError("Failed to send email. Please try again.");
      console.error(err);
    } finally {
      setEmailSending(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <>
      <SEO
        title="ATS Resume Checker - Cloud9Profile"
        description="Free ATS resume checker. Analyze keyword match, formatting, and get recommendations."
        canonical="https://cloud9profile.com/ats-checker"
      />

      <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight leading-[1.1] pt-2 pb-2">
              ATS Resume Checker
            </h1>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Optimize your resume for applicant tracking systems with
              AI-powered insights and keyword matching.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <div
              className={`${
                results ? "lg:col-span-12 xl:col-span-8" : "lg:col-span-12"
              } space-y-6`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resume Upload/Paste */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-500 group shadow-2xl flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400">01</span>
                      </div>
                      Your Resume
                    </h3>
                    {resumeText.length > 0 && (
                      <span className="text-xs text-slate-500 font-mono">
                        {resumeText.length} chars
                      </span>
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
                      if (file) handleFileUpload(file);
                    }}
                    className={`relative mb-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-white/5 bg-black/20 hover:border-white/10"
                    } p-6 text-center cursor-pointer`}
                    onClick={() =>
                      !isUploading && fileInputRef.current?.click()
                    }
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files[0])
                      }
                      className="hidden"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm text-slate-400">
                          Processing Document...
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                          <svg
                            className="w-8 h-8 text-slate-400 group-hover:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-white mb-1 leading-tight">
                          {fileName || "Drag & drop or click"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          PDF, DOCX up to 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Or paste your resume text here..."
                    className="w-full grow min-h-[300px] bg-black/20 border border-white/5 rounded-2xl p-6 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all font-mono leading-relaxed"
                  />
                </div>

                {/* Job Description */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-500 group shadow-2xl flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-purple-400">02</span>
                      </div>
                      Job Description
                    </h3>
                    {jobDescription.length > 0 && (
                      <span className="text-xs text-slate-500 font-mono">
                        {jobDescription.length} chars
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-6 bg-purple-500/5 px-4 py-3 rounded-xl border border-purple-500/10 italic leading-relaxed">
                    Paste the full job description to compare relevant skills
                    and keywords.
                  </p>

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description..."
                    className="w-full grow min-h-[300px] bg-black/20 border border-white/5 rounded-2xl p-6 text-sm text-slate-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-center pt-8">
                <button
                  onClick={handleAnalyze}
                  disabled={
                    isAnalyzing || !resumeText.trim() || !jobDescription.trim()
                  }
                  className="group relative px-12 py-5 bg-blue-600 rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3 font-black text-lg tracking-wide uppercase">
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        AI Analysis...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Start AI Analysis
                      </>
                    )}
                  </div>
                </button>
              </div>

              {error && (
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Results Sidebar - If results exist */}
            {results && (
              <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                {/* Score Card */}
                <div className="bg-slate-900 shadow-2xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all duration-500" />

                  <div className="relative z-10 text-center">
                    <div className="relative inline-block mb-6">
                      <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                        <circle
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="60"
                          cx="64"
                          cy="64"
                          className="text-white/5 sm:r-[70] sm:cx-[80] sm:cy-[80]"
                        />
                        <circle
                          strokeWidth="8"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * results.score) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="60"
                          cx="64"
                          cy="64"
                          className="text-blue-500 transition-all duration-1000 ease-out sm:r-[70] sm:cx-[80] sm:cy-[80]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-black text-white">
                          {results.score}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
                          Score
                        </span>
                      </div>
                    </div>

                    <h4 className="text-2xl font-black text-white mb-2">
                      {getScoreLabel(results.score)}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 text-center mx-auto">
                      Your resume has a{" "}
                      <span className="text-blue-400 font-bold">
                        {results.matchPercentage}%
                      </span>{" "}
                      keyword match rate.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">
                          Keywords
                        </div>
                        <div className="text-lg font-black text-white">
                          {results.matchedKeywords.length}/
                          {results.keywordStats.totalJDKeywords}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">
                          Sections
                        </div>
                        <div className="text-lg font-black text-white">
                          {
                            Object.values(results.sections).filter(Boolean)
                              .length
                          }
                          /5
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5 font-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Email Report
                    </button>
                  </div>
                </div>

                {/* Email Form Popover */}
                {showEmailForm && (
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={emailData.name}
                        onChange={(e) =>
                          setEmailData({ ...emailData, name: e.target.value })
                        }
                        placeholder="Your full name"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                      />
                      <input
                        type="email"
                        value={emailData.email}
                        onChange={(e) =>
                          setEmailData({ ...emailData, email: e.target.value })
                        }
                        placeholder="Email address"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                      />
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        {emailSending ? "Sending..." : "Send Report"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analysis View - Matched/Missing Keywords */}
          {results && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-1000">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black">Matched Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.matchedKeywords.length > 0 ? (
                    results.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold transition-all hover:bg-green-500/20"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm italic">
                      No keyword matches found yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords.length > 0 ? (
                    results.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all hover:bg-red-500/20"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm italic">
                      Excellent work! No major missing keywords.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:bg-slate-900 transition-all duration-300 focus-within:bg-slate-900">
                  <h4 className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-6">
                    Strengths
                  </h4>
                  <ul className="space-y-4">
                    {results.strengths.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-slate-400 leading-relaxed text-left"
                      >
                        <span className="text-blue-500 mt-1 flex-shrink-0">
                          ✦
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:bg-slate-900 transition-all duration-300 focus-within:bg-slate-900 text-left">
                  <h4 className="text-red-400 font-bold uppercase tracking-widest text-[10px] mb-6">
                    Focus Areas
                  </h4>
                  <ul className="space-y-4">
                    {results.weaknesses.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-slate-400 leading-relaxed text-left"
                      >
                        <span className="text-red-500 mt-1 flex-shrink-0">
                          ✦
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:bg-slate-900 transition-all duration-300 focus-within:bg-slate-900 text-left">
                  <h4 className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-6">
                    Next Steps
                  </h4>
                  <ul className="space-y-4">
                    {results.recommendations.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-slate-400 leading-relaxed text-left"
                      >
                        <span className="text-purple-500 mt-1 flex-shrink-0">
                          ✦
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Educational Content */}
        {!results && (
          <div className="mt-20 space-y-32 mb-20">
            <section className="relative overflow-hidden pt-20">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  What is an Applicant Tracking System?
                </h2>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[40px] p-12 shadow-3xl">
                  <p className="text-lg text-slate-400 leading-relaxed mb-12">
                    75% of resumes are rejected by automated systems before they
                    reach human eyes. The ATS is your first gatekeeper.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 text-xl font-black">
                        01
                      </div>
                      <h4 className="font-bold text-white uppercase text-xs tracking-widest">
                        Parsing
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        The system strips formatting to extract core data from
                        your document.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 text-xl font-black">
                        02
                      </div>
                      <h4 className="font-bold text-white uppercase text-xs tracking-widest">
                        Keywords
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        It matches your skills against specific terms in the job
                        description.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 text-xl font-black">
                        03
                      </div>
                      <h4 className="font-bold text-white uppercase text-xs tracking-widest">
                        Ranking
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Candidates are ranked by a match score. High scorers get
                        the interview.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900/30 py-32">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                  <div className="lg:w-1/2">
                    <h2 className="text-4xl font-black mb-12 text-white">
                      How to Beat the System
                    </h2>
                    <div className="grid gap-6">
                      {[
                        {
                          title: "Standard Headings",
                          desc: "Use 'Experience', 'Education', and 'Skills' to avoid confusing the bot.",
                        },
                        {
                          title: "Single Column Layout",
                          desc: "Complex grids and graphics are the #1 cause of parsing failures.",
                        },
                        {
                          title: "Exact Match Keywords",
                          desc: "Use 'Project Management' if that's what's in the JD, precisely.",
                        },
                        {
                          title: "Professional Formats",
                          desc: "PDF is best, but ensure it's text-based and not a scanned image.",
                        },
                      ].map((tip, i) => (
                        <div
                          key={i}
                          className="group p-6 bg-white/5 border border-white/5 rounded-3xl transition-all hover:bg-white/10 hover:translate-x-2"
                        >
                          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            {tip.title}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {tip.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-1/2 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900 rounded-[40px] overflow-hidden border border-white/10">
                      <img
                        src={getAssetUrl("/ats-checker-preview.png")}
                        alt="ATS Professional Scanning"
                        className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicATSChecker;
