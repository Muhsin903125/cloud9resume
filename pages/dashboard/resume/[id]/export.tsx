import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const ExportUI = () => {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState<any>(null);
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [error, setError] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [credits, setCredits] = useState(0);

  const colors = {
    primary: "#000000",
    secondary: "#666666",
    accent: "#3b82f6",
    border: "#e5e7eb",
    light: "#f9fafb",
  };

  const formats = [
    {
      id: "pdf",
      name: "PDF",
      description: "Professional PDF format",
      credits: 1,
    },
    {
      id: "docx",
      name: "Word Document",
      description: "Microsoft Word format",
      credits: 2,
    },
    {
      id: "json",
      name: "JSON Data",
      description: "Structured JSON format",
      credits: 0,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumeRes, exportsRes] = await Promise.all([
        fetch(`/api/resumes/${id}`, {
          headers: { "x-user-id": "user-id-here" },
        }),
        fetch(`/api/resumes/export?resumeId=${id}`, {
          headers: { "x-user-id": "user-id-here" },
        }),
      ]);

      const resumeData = await resumeRes.json();
      const exportsData = await exportsRes.json();

      setResume(resumeData.data);
      setExports(exportsData.data || []);
    } catch (err) {
      setError("Failed to load export data");
    } finally {
      setLoading(false);
    }
  };

  const queueExport = async () => {
    if (!selectedFormat) return;

    try {
      setExporting(true);
      const response = await fetch("/api/resumes/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-id-here",
        },
        body: JSON.stringify({ resumeId: id, format: selectedFormat }),
      });

      const data = await response.json();
      if (data.success) {
        setError("");
        setExports([data.data, ...exports]);
        setSelectedFormat("");
      } else {
        setError(data.error || "Failed to queue export");
      }
    } catch (err) {
      setError("Failed to queue export");
    } finally {
      setExporting(false);
    }
  };

  const downloadExport = (exportItem: any) => {
    if (exportItem.file_url) {
      window.open(exportItem.file_url, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#16a34a";
      case "failed":
        return "#dc2626";
      default:
        return colors.secondary;
    }
  };

  const selectedFormatObj = formats.find((f) => f.id === selectedFormat);

  if (loading) {
    return (
      <>
        <Head>
          <title>Export Resume - Cloud9Profile</title>
        </Head>
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading exports...
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Export {resume?.title} - Cloud9Profile</title>
      </Head>

      <div
        style={{
          background: colors.light,
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: colors.primary,
                margin: "0 0 8px 0",
              }}
            >
              Export Resume
            </h1>
            <p style={{ fontSize: "14px", color: colors.secondary, margin: 0 }}>
              Download {resume?.title} in your preferred format
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#dc2626",
                borderRadius: "6px",
                marginBottom: "24px",
              }}
            >
              {error}
            </div>
          )}

          {/* Export Options */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: colors.primary,
                margin: "0 0 16px 0",
              }}
            >
              Select Format
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {formats.map((format) => (
                <div
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  style={{
                    padding: "16px",
                    border:
                      selectedFormat === format.id
                        ? `2px solid ${colors.accent}`
                        : `1px solid ${colors.border}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    background:
                      selectedFormat === format.id ? "#dbeafe" : "white",
                    transition: "all 0.2s",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: colors.primary,
                      margin: "0 0 4px 0",
                    }}
                  >
                    {format.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: colors.secondary,
                      margin: "0 0 8px 0",
                    }}
                  >
                    {format.description}
                  </p>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: colors.accent,
                    }}
                  >
                    {format.credits === 0
                      ? "Free"
                      : `${format.credits} credit${
                          format.credits > 1 ? "s" : ""
                        }`}
                  </div>
                </div>
              ))}
            </div>

            {selectedFormatObj && (
              <div
                style={{
                  padding: "12px",
                  background: "#f0fdf4",
                  border: `1px solid #86efac`,
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ fontSize: "13px", color: "#15803d", margin: 0 }}>
                  ✓ Export will be queued and processed shortly. You'll be able
                  to download it from the history below.
                </p>
              </div>
            )}

            <button
              onClick={queueExport}
              disabled={!selectedFormat || exporting}
              style={{
                padding: "10px 20px",
                background:
                  selectedFormat && !exporting ? colors.accent : colors.border,
                color:
                  selectedFormat && !exporting ? "white" : colors.secondary,
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor:
                  selectedFormat && !exporting ? "pointer" : "not-allowed",
              }}
            >
              {exporting ? "Queueing..." : "Queue Export"}
            </button>
          </div>

          {/* Export History */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "24px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: colors.primary,
                margin: "0 0 16px 0",
              }}
            >
              Export History
            </h2>

            {exports.length === 0 ? (
              <p
                style={{ fontSize: "14px", color: colors.secondary, margin: 0 }}
              >
                No exports yet. Create one above to get started.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 0",
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        Format
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 0",
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 0",
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "12px 0",
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exports.map((exp, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: `1px solid ${colors.border}` }}
                      >
                        <td
                          style={{
                            padding: "12px 0",
                            textTransform: "uppercase",
                            fontWeight: "600",
                          }}
                        >
                          {exp.format}
                        </td>
                        <td style={{ padding: "12px 0" }}>
                          <span
                            style={{
                              color: getStatusColor(exp.export_status),
                              fontWeight: "600",
                            }}
                          >
                            {exp.export_status}
                          </span>
                        </td>
                        <td
                          style={{ padding: "12px 0", color: colors.secondary }}
                        >
                          {new Date(exp.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 0", textAlign: "right" }}>
                          {exp.export_status === "completed" && (
                            <button
                              onClick={() => downloadExport(exp)}
                              style={{
                                padding: "6px 12px",
                                background: colors.accent,
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div style={{ marginTop: "24px" }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: "10px 20px",
                background: colors.border,
                color: colors.primary,
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back to Resume
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportUI;
