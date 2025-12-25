import { NextPage } from "next";
import { useState, useRef } from "react";
import Head from "next/head";
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

const colors = {
  primary: "#0f172a", // slate-900
  secondary: "#64748b", // slate-500
  tertiary: "#94a3b8", // slate-400
  accent: "#2563eb", // blue-600
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  light: "#f8fafc", // slate-50
  border: "#e2e8f0", // slate-200
};

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <>
      <Head>
        <title>ATS Resume Checker - Cloud9Profile</title>
        <meta
          name="description"
          content="Free ATS resume checker. Analyze keyword match, formatting, and get recommendations."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 pt-24 font-sans">
        {/* Hero / Tool Section */}
        <section className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                ATS Resume Checker
              </h1>
              <p className="text-xl text-slate-400">
                Check how your resume parses against job descriptions. Used by
                over 10,000 job seekers.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl text-slate-900">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: results ? "1fr 300px" : "1fr",
                  gap: "40px",
                }}
              >
                {/* Left Column - Input */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {/* File Upload */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        color: colors.primary,
                      }}
                    >
                      Upload resume
                    </label>
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
                      style={{
                        border: `2px dashed ${
                          isDragging ? colors.accent : colors.border
                        }`,
                        borderRadius: "8px",
                        padding: "32px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: isDragging
                          ? "rgba(59, 130, 246, 0.05)"
                          : colors.light,
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          e.target.files && handleFileUpload(e.target.files[0])
                        }
                        style={{ display: "none" }}
                        disabled={isUploading}
                      />
                      <div
                        onClick={() =>
                          !isUploading && fileInputRef.current?.click()
                        }
                      >
                        {isUploading ? (
                          <>
                            <div
                              style={{ fontSize: "20px", marginBottom: "12px" }}
                            >
                              ⏳
                            </div>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "14px",
                                color: colors.secondary,
                              }}
                            >
                              Processing...
                            </p>
                          </>
                        ) : (
                          <>
                            <div
                              style={{ fontSize: "24px", marginBottom: "8px" }}
                            >
                              📄
                            </div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: colors.primary,
                              }}
                            >
                              Drag & drop or click to upload
                            </p>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "12px",
                                color: colors.tertiary,
                              }}
                            >
                              PDF, DOC, DOCX up to 10MB
                            </p>
                          </>
                        )}
                        {fileName && (
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              fontSize: "12px",
                              color: colors.success,
                            }}
                          >
                            ✓ {fileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resume Text */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: colors.primary,
                        }}
                      >
                        Resume text
                      </label>
                      {resumeText.length > 0 && (
                        <span
                          style={{ fontSize: "12px", color: colors.tertiary }}
                        >
                          {resumeText.length} characters
                        </span>
                      )}
                    </div>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume here..."
                      style={{
                        width: "100%",
                        height: "160px",
                        padding: "12px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        fontFamily: "inherit",
                        resize: "none",
                        boxSizing: "border-box",
                      }}
                      disabled={isUploading}
                    />
                  </div>

                  {/* Job Description */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: colors.primary,
                        }}
                      >
                        Job description
                      </label>
                      {jobDescription.length > 0 && (
                        <span
                          style={{ fontSize: "12px", color: colors.tertiary }}
                        >
                          {jobDescription.length} characters
                        </span>
                      )}
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description..."
                      style={{
                        width: "100%",
                        height: "120px",
                        padding: "12px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        fontFamily: "inherit",
                        resize: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Messages */}
                  {error && (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: colors.error,
                        background: "rgba(239, 68, 68, 0.1)",
                        border: `1px solid ${colors.error}`,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {emailSuccess && (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: colors.success,
                        background: "rgba(16, 185, 129, 0.1)",
                        border: `1px solid ${colors.success}`,
                      }}
                    >
                      ✓ Report sent to your email
                    </div>
                  )}

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={
                      isAnalyzing ||
                      !resumeText.trim() ||
                      !jobDescription.trim()
                    }
                    style={{
                      padding: "12px 24px",
                      background:
                        isAnalyzing ||
                        !resumeText.trim() ||
                        !jobDescription.trim()
                          ? colors.border
                          : colors.accent,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor:
                        isAnalyzing ||
                        !resumeText.trim() ||
                        !jobDescription.trim()
                          ? "not-allowed"
                          : "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    {isAnalyzing ? "⏳ Analyzing..." : "✨ Analyze"}
                  </button>
                </div>

                {/* Right Column - Results */}
                {results && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {/* Score Card */}
                    <div
                      style={{
                        background: "white",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            margin: "0 auto 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `${getScoreColor(results.score)}15`,
                            border: `3px solid ${getScoreColor(results.score)}`,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "28px",
                              fontWeight: "700",
                              color: getScoreColor(results.score),
                            }}
                          >
                            {results.score}
                          </span>
                        </div>
                      </div>
                      <h3
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: colors.primary,
                        }}
                      >
                        {getScoreLabel(results.score)}
                      </h3>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "12px",
                          color: colors.tertiary,
                        }}
                      >
                        {results.matchPercentage}% match
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div
                      style={{
                        background: "white",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                        padding: "16px",
                        fontSize: "13px",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "12px",
                          paddingBottom: "12px",
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: colors.tertiary }}>
                            Keywords
                          </span>
                          <span
                            style={{ fontWeight: "600", color: colors.primary }}
                          >
                            {results.matchedKeywords.length}/
                            {results.keywordStats.totalJDKeywords}
                          </span>
                        </div>
                        <div
                          style={{
                            background: colors.border,
                            height: "4px",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: colors.accent,
                              height: "100%",
                              width: `${results.keywordStats.matchPercentage}%`,
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: colors.tertiary }}>
                            Sections
                          </span>
                          <span
                            style={{ fontWeight: "600", color: colors.primary }}
                          >
                            {
                              Object.values(results.sections).filter(Boolean)
                                .length
                            }
                            /5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email Button */}
                    <button
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: colors.accent,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      📧 Email report
                    </button>

                    {showEmailForm && (
                      <div
                        style={{
                          background: "white",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "8px",
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="text"
                          value={emailData.name}
                          onChange={(e) =>
                            setEmailData({ ...emailData, name: e.target.value })
                          }
                          placeholder="Your name"
                          style={{
                            padding: "8px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "4px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
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
                          placeholder="Email"
                          style={{
                            padding: "8px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "4px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          onClick={handleSendEmail}
                          disabled={emailSending}
                          style={{
                            padding: "8px",
                            background: emailSending
                              ? colors.border
                              : colors.accent,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: emailSending ? "not-allowed" : "pointer",
                          }}
                        >
                          {emailSending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Results Section - Only visible if results exist */}
        {results && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-10 text-center">
                Detailed Analysis
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Matched Keywords */}
                {results.matchedKeywords.length > 0 && (
                  <div
                    style={{
                      background: "white",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      padding: "20px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: colors.success,
                      }}
                    >
                      ✓ Matched Keywords
                    </h3>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {results.matchedKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            background: `${colors.success}15`,
                            color: colors.success,
                            borderRadius: "4px",
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {results.missingKeywords.length > 0 && (
                  <div
                    style={{
                      background: "white",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      padding: "20px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: colors.error,
                      }}
                    >
                      ⚠ Missing Keywords
                    </h3>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {results.missingKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            background: `${colors.error}15`,
                            color: colors.error,
                            borderRadius: "4px",
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Educational Content */}
        {!results && (
          <>
            <section className="py-24 bg-white">
              <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">
                  What is an Applicant Tracking System (ATS)?
                </h2>
                <div className="prose prose-lg text-slate-500">
                  <p>
                    An ATS is software used by employers to scan, rank, and
                    filter resumes before they are ever seen by a human
                    recruiter. 75% of resumes are rejected by these automated
                    systems because they aren't formatted correctly or lack the
                    right keywords.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>
                      <strong>Parsing:</strong> The ATS strips your resume's
                      formatting to extract data.
                    </li>
                    <li>
                      <strong>Keywords:</strong> It searches for specific skills
                      and terms matching the job description.
                    </li>
                    <li>
                      <strong>Ranking:</strong> Candidates are ranked by a
                      "match score." Only top scorers get an interview.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-24 bg-slate-50">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">
                  How to Beat the ATS
                </h2>
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Tips List */}
                  <div className="grid gap-8">
                    {[
                      {
                        title: "Use Standard Headings",
                        desc: "Stick to standard section titles like 'Experience', 'Education', and 'Skills' so the bot knows where to look.",
                      },
                      {
                        title: "Avoid Graphics & Columns",
                        desc: "Complex layouts confuse the parser. Keep it simple with a clean, single-column text layout.",
                      },
                      {
                        title: "Mirror the Job Description",
                        desc: "Use the exact wording found in the job posting. If they ask for 'Project Management', don't write 'Managed Projects'.",
                      },
                      {
                        title: "Save as PDF or Word",
                        desc: "These are the most readable formats. Avoid images (JPG/PNG) as most ATS cannot read text from images.",
                      },
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2 text-slate-900">
                            {tip.title}
                          </h3>
                          <p className="text-slate-500">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                    <img
                      src={getAssetUrl("/ats-checker-preview.png")}
                      alt="ATS Scanning Process"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default PublicATSChecker;
