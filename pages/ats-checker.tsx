import { NextPage } from "next";
import { useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import logo from "@/public/logo.png";

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
  primary: "#000000",
  secondary: "#666666",
  tertiary: "#999999",
  accent: "#3b82f6",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  light: "#f9fafb",
  border: "#e5e7eb",
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

      <div style={{ background: colors.light, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "24px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <img
                  src={logo.src}
                  alt="Cloud9Profile Logo"
                  style={{
                    height: "32px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </Link>
              <Link
                href="/login"
                style={{
                  fontSize: "14px",
                  color: colors.secondary,
                  textDecoration: "none",
                  borderBottom: `1px solid ${colors.border}`,
                  paddingBottom: "4px",
                }}
              >
                Sign in
              </Link>
            </div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: colors.primary,
                margin: "0 0 8px 0",
              }}
            >
              ATS Resume Checker
            </h1>
            <p
              style={{ fontSize: "14px", color: colors.tertiary, margin: "0" }}
            >
              Check how your resume matches the job description
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 16px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: results ? "1fr 300px" : "1fr",
              gap: "40px",
            }}
          >
            {/* Left Column - Input */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
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
                        <div style={{ fontSize: "20px", marginBottom: "12px" }}>
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
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>
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
                    <span style={{ fontSize: "12px", color: colors.tertiary }}>
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
                    <span style={{ fontSize: "12px", color: colors.tertiary }}>
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
                  isAnalyzing || !resumeText.trim() || !jobDescription.trim()
                }
                style={{
                  padding: "12px 24px",
                  background:
                    isAnalyzing || !resumeText.trim() || !jobDescription.trim()
                      ? colors.border
                      : colors.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor:
                    isAnalyzing || !resumeText.trim() || !jobDescription.trim()
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
                      <span style={{ color: colors.tertiary }}>Keywords</span>
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
                      <span style={{ color: colors.tertiary }}>Sections</span>
                      <span
                        style={{ fontWeight: "600", color: colors.primary }}
                      >
                        {Object.values(results.sections).filter(Boolean).length}
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
                        setEmailData({ ...emailData, email: e.target.value })
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

          {/* Detailed Results */}
          {results && (
            <div
              style={{
                marginTop: "60px",
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
                    {results.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          background: "rgba(16, 185, 129, 0.1)",
                          color: colors.success,
                          borderRadius: "4px",
                          border: `1px solid ${colors.success}40`,
                        }}
                      >
                        {kw}
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
                    ✗ Missing Keywords
                  </h3>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {results.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          background: "rgba(239, 68, 68, 0.1)",
                          color: colors.error,
                          borderRadius: "4px",
                          border: `1px solid ${colors.error}40`,
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {results.insights.length > 0 && (
                <div
                  style={{
                    background: "white",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "20px",
                    gridColumn: "span 1",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: colors.primary,
                    }}
                  >
                    💡 Insights
                  </h3>
                  <ul
                    style={{
                      margin: "0",
                      padding: "0",
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {results.insights.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "12px",
                          color: colors.secondary,
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths */}
              {results.strengths.length > 0 && (
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
                    ✅ Strengths
                  </h3>
                  <ul
                    style={{
                      margin: "0",
                      padding: "0",
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {results.strengths.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "12px",
                          color: colors.secondary,
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {results.weaknesses.length > 0 && (
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
                      color: colors.warning,
                    }}
                  >
                    ⚠️ Needs Improvement
                  </h3>
                  <ul
                    style={{
                      margin: "0",
                      padding: "0",
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {results.weaknesses.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "12px",
                          color: colors.secondary,
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations.length > 0 && (
                <div
                  style={{
                    background: "white",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "20px",
                    gridColumn: "span 1",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: colors.primary,
                    }}
                  >
                    🎯 Recommendations
                  </h3>
                  <ul
                    style={{
                      margin: "0",
                      padding: "0",
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {results.recommendations.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "12px",
                          color: colors.secondary,
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            marginTop: "60px",
            padding: "24px",
            textAlign: "center",
            fontSize: "12px",
            color: colors.tertiary,
          }}
        >
          © 2025 Cloud9Profile. Free ATS checker.
        </div>
      </div>
    </>
  );
};

export default PublicATSChecker;
