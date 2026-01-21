import { NextPage } from "next";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/authUtils";

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
  const { isAuthenticated } = useAuth();
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
  const resultsRef = useRef<HTMLDivElement>(null);

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
        }`,
      );
      setFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please upload your resume");
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
        // Auto-scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
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
        // Reset all fields
        setResumeText("");
        setJobDescription("");
        setResults(null);
        setFileName("");
        setEmailData({ name: "", email: "" });

        setTimeout(() => setEmailSuccess(false), 6000);
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

  return (
    <>
      <SEO
        title="Free ATS Resume Checker & Scanner"
        description="Check your resume's ATS compatibility for free. Get instant feedback on keyword matching, formatting, and structural integrity to land more interviews."
        canonical="https://cloud9profile.com/ats-checker"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "ATS Checker", item: "/ats-checker" },
        ]}
      />

      {/* Force White Theme Injection */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Bricolage+Grotesque:opsz,wght@12..96,300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap");

        :root {
          --accent-primary: #3b82f6;
          --accent-secondary: #8b5cf6;
          --quartz-base: #ffffff !important;
          --quartz-high: #f8fafc !important;
        }

        body {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }

        .font-outfit {
          font-family: "Outfit", sans-serif;
        }
        .font-bricolage {
          font-family: "Bricolage Grotesque", sans-serif;
        }
        .font-mono {
          font-family: "JetBrains Mono", monospace;
        }
      `}</style>

      <div className="min-h-screen bg-white text-slate-900 font-bricolage selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
        {/* Atmosphere Layer */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-50/40 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -45, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-50/30 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Email Success Notification */}
          <AnimatePresence>
            {emailSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
              >
                <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-widest text-blue-400">
                      Dispatch Complete
                    </h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      The intelligence report has been sent to your target
                      email.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rearranged Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest font-black text-blue-600 font-outfit">
                AI Match Engine 4.0
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 font-outfit tracking-tighter leading-none">
              Power Up Your <br />{" "}
              <span className="text-blue-600">Resume Match</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
              Rearranged analysis flow for faster insights. Just drop your file
              and paste the job targets below.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Action Matrix - Rearranged Flow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-blue-500/5 p-4 sm:p-8 overflow-hidden relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Side A: Resume Nodes */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black font-outfit shadow-md shadow-slate-200">
                      01
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black font-outfit uppercase tracking-tighter text-slate-900 leading-none">
                        The Credential
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Upload PDF or DOCX
                      </p>
                    </div>
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
                    onClick={() =>
                      !isUploading && fileInputRef.current?.click()
                    }
                    className={`relative min-h-[220px] rounded-[32px] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-6 cursor-pointer group ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200 bg-slate-50/30 hover:border-blue-400 hover:bg-white"
                    }`}
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
                      <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
                        <p className="font-black font-outfit text-slate-400 uppercase tracking-widest text-[9px]">
                          Scanning Matrix...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`mb-4 p-4 rounded-xl transition-all duration-500 ${isDragging ? "bg-blue-600 text-white scale-110" : "bg-white text-slate-400 group-hover:text-blue-600 group-hover:shadow-lg shadow-sm"}`}
                        >
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                        </div>
                        <p className="text-base font-black text-slate-900 mb-1 font-outfit text-center px-4">
                          {fileName || "Secure File Drop"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                          Validated Node Protocol
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Side B: Target Grid */}
                <div className="space-y-6 flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black font-outfit shadow-md shadow-blue-200">
                      02
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black font-outfit uppercase tracking-tighter text-slate-900 leading-none">
                        The Target
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Paste Job Description
                      </p>
                    </div>
                  </div>

                  <div className="relative flex-1 group">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description nodes here..."
                      className="w-full h-full min-h-[220px] bg-slate-50/50 border-2 border-slate-200 rounded-[32px] p-6 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bricolage resize-none shadow-inner"
                    />
                    <div className="absolute bottom-4 right-6 text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">
                      {jobDescription.length} units
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Analysis Trigger */}
              <div className="flex flex-col items-center pt-8 border-t border-slate-100 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={
                    isAnalyzing || !resumeText.trim() || !jobDescription.trim()
                  }
                  className="relative px-12 py-4 bg-slate-900 rounded-full overflow-hidden transition-all disabled:opacity-30 disabled:grayscale group shadow-xl shadow-slate-900/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative flex items-center gap-3 text-white font-black text-base tracking-widest uppercase font-outfit">
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Crunching...
                      </>
                    ) : (
                      <>
                        <span>Run Match Analysis</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </>
                    )}
                  </div>
                </motion.button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-red-100"
                  >
                    Matrix Alert: {error}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Results Reveal - Prominent Centerspace */}
            <AnimatePresence>
              {results && (
                <motion.div
                  ref={resultsRef}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white border border-slate-200 rounded-[40px] p-6 sm:p-12 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                    <div className="max-w-3xl mx-auto flex flex-col items-center">
                      <div className="text-center mb-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2 block">
                          Final Verification
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                          Match Integrity
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
                        {/* Match Percentage Matrix */}
                        <div className="text-center space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Global Score
                          </p>
                          <div className="text-6xl font-black text-slate-900 font-outfit">
                            {results.score}
                            <span className="text-xl text-blue-500">%</span>
                          </div>
                        </div>

                        {/* Visual Kinetic Progress */}
                        <div className="md:col-span-2 space-y-8">
                          <div className="space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                Keyword Density
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {results.matchedKeywords.length} /{" "}
                                {results.keywordStats.totalJDKeywords}
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${results.score}%` }}
                                className="h-full bg-slate-900 rounded-full shadow-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                Structural Scan
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {
                                  Object.values(results.sections).filter(
                                    Boolean,
                                  ).length
                                }{" "}
                                / 5 Nodes
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(Object.values(results.sections).filter(Boolean).length / 5) * 100}%`,
                                }}
                                className="h-full bg-blue-600 rounded-full shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Call to Action Grid */}
                      <div className="mt-12 w-full pt-10 border-t border-slate-100 flex flex-col items-center">
                        {!isAuthenticated ? (
                          <div className="max-w-md w-full text-center space-y-6">
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                              Export Intelligence Report
                            </h4>
                            <p className="text-sm text-slate-500 font-light leading-relaxed">
                              Full forensic breakdown of matched nodes and
                              structural blindspots generated.
                            </p>

                            <div className="space-y-2">
                              <input
                                type="text"
                                value={emailData.name}
                                onChange={(e) =>
                                  setEmailData({
                                    ...emailData,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="OPERATOR NAME"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-mono focus:border-blue-600 outline-none transition-all"
                              />
                              <input
                                type="email"
                                value={emailData.email}
                                onChange={(e) =>
                                  setEmailData({
                                    ...emailData,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="TARGET EMAIL"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-mono focus:border-blue-600 outline-none transition-all"
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSendEmail}
                                disabled={emailSending}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] font-outfit shadow-lg shadow-blue-500/10"
                              >
                                {emailSending
                                  ? "DISPATCHING..."
                                  : "SEND VERIFIED REPORT"}
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 text-center max-w-lg"
                          >
                            <h4 className="text-xl font-black text-blue-600 font-outfit mb-1">
                              Matrix Dispatch Complete
                            </h4>
                            <p className="text-sm text-blue-500/80 font-bold uppercase tracking-widest">
                              Full digital report synchronized with your
                              account.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Branding Sub-Sections */}
        <section className="mt-24 px-4 max-w-5xl mx-auto py-24 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter leading-none mb-6">
                Structural <br />{" "}
                <span className="text-blue-600 italic">Integrity.</span>
              </h2>
              <p className="text-base text-slate-500 leading-relaxed font-light mb-8">
                Building a resume isn't enough. You must build a
                machine-readable document that prioritizes semantic hierarchy.
              </p>
              <div className="space-y-3">
                {[
                  "Neural Parsing",
                  "Token Matching",
                  "Hierarchy Validation",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-slate-900 font-black font-outfit uppercase tracking-tighter text-[11px]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/5 blur-[80px] rounded-full" />
              <img
                src={getAssetUrl("/ats-checker-preview.png")}
                alt="ATS Resume Checker Analysis and Keyword Match Preview"
                className="relative rounded-[32px] shadow-xl border border-slate-200"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PublicATSChecker;
