import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const PortfolioIntegration = () => {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    slug: "",
    password: "",
    isPrimary: false,
  });
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const colors = {
    primary: "#000000",
    secondary: "#666666",
    accent: "#3b82f6",
    border: "#e5e7eb",
    light: "#f9fafb",
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumeRes, portfoliosRes] = await Promise.all([
        fetch(`/api/resumes/${id}`, {
          headers: { "x-user-id": "user-id-here" },
        }),
        fetch("/api/resumes/portfolio", {
          headers: { "x-user-id": "user-id-here" },
        }),
      ]);

      const resumeData = await resumeRes.json();
      const portfoliosData = await portfoliosRes.json();

      setResume(resumeData.data);
      setPortfolios(
        portfoliosData.data?.filter((p: any) => p.resume_id === id) || []
      );
    } catch (err) {
      setError("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const publishPortfolio = async () => {
    try {
      setPublishing(true);
      const response = await fetch("/api/resumes/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-id-here",
        },
        body: JSON.stringify({
          resumeId: id,
          slug: newPortfolio.slug || undefined,
          password: newPortfolio.password || undefined,
          isPrimary: newPortfolio.isPrimary,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setError("");
        setPortfolios([data.data, ...portfolios]);
        setShowPublishForm(false);
        setNewPortfolio({ slug: "", password: "", isPrimary: false });
      } else {
        setError(data.error || "Failed to publish portfolio");
      }
    } catch (err) {
      setError("Failed to publish portfolio");
    } finally {
      setPublishing(false);
    }
  };

  const unpublishPortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch("/api/resumes/portfolio", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-id-here",
        },
        body: JSON.stringify({ portfolioId, isPublished: false }),
      });

      const data = await response.json();
      if (data.success) {
        setPortfolios(portfolios.filter((p) => p.id !== portfolioId));
      } else {
        setError(data.error || "Failed to unpublish portfolio");
      }
    } catch (err) {
      setError("Failed to unpublish portfolio");
    }
  };

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/portfolio/${slug}`
    );
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Portfolio - Cloud9Profile</title>
        </Head>
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading portfolio...
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Portfolio - {resume?.title} - Cloud9Profile</title>
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
              Portfolio Links
            </h1>
            <p style={{ fontSize: "14px", color: colors.secondary, margin: 0 }}>
              Share your resume as a public portfolio with customizable links
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

          {/* Publish Form */}
          {showPublishForm && (
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
                Publish New Portfolio Link
              </h2>

              <div style={{ display: "grid", gap: "16px" }}>
                {/* Slug Input */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: colors.primary,
                      marginBottom: "6px",
                    }}
                  >
                    Custom Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={newPortfolio.slug}
                    onChange={(e) =>
                      setNewPortfolio({ ...newPortfolio, slug: e.target.value })
                    }
                    placeholder="my-awesome-resume"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: colors.secondary,
                      margin: "6px 0 0 0",
                    }}
                  >
                    Leave empty to auto-generate
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: colors.primary,
                      marginBottom: "6px",
                    }}
                  >
                    Password Protection (optional)
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPortfolio.password}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          password: e.target.value,
                        })
                      }
                      placeholder="Leave empty for public access"
                      style={{
                        width: "100%",
                        padding: "10px",
                        paddingRight: "40px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: colors.secondary,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? (
                        <EyeSlashIcon
                          style={{ width: "20px", height: "20px" }}
                        />
                      ) : (
                        <EyeIcon style={{ width: "20px", height: "20px" }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Checkbox */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newPortfolio.isPrimary}
                    onChange={(e) =>
                      setNewPortfolio({
                        ...newPortfolio,
                        isPrimary: e.target.checked,
                      })
                    }
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: colors.primary,
                      fontWeight: "500",
                    }}
                  >
                    Set as primary portfolio
                  </span>
                </label>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    onClick={publishPortfolio}
                    disabled={publishing}
                    style={{
                      padding: "10px 20px",
                      background: publishing ? colors.border : colors.accent,
                      color: publishing ? colors.secondary : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: publishing ? "not-allowed" : "pointer",
                    }}
                  >
                    {publishing ? "Publishing..." : "Publish Portfolio"}
                  </button>
                  <button
                    onClick={() => setShowPublishForm(false)}
                    style={{
                      padding: "10px 20px",
                      background: "white",
                      color: colors.primary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showPublishForm && (
            <button
              onClick={() => setShowPublishForm(true)}
              style={{
                padding: "10px 20px",
                background: colors.accent,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "24px",
              }}
            >
              + Publish New Portfolio Link
            </button>
          )}

          {/* Portfolio Links List */}
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
              Active Portfolio Links
            </h2>

            {portfolios.length === 0 ? (
              <p
                style={{ fontSize: "14px", color: colors.secondary, margin: 0 }}
              >
                No portfolio links yet. Create one above to share your resume.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    style={{
                      padding: "16px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "6px",
                      background: colors.light,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: colors.primary,
                            margin: "0 0 4px 0",
                          }}
                        >
                          {portfolio.slug}
                          {portfolio.is_primary && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "12px",
                                background: "#fef3c7",
                                color: "#d97706",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              PRIMARY
                            </span>
                          )}
                        </h3>
                        <p
                          style={{
                            fontSize: "12px",
                            color: colors.secondary,
                            margin: 0,
                          }}
                        >
                          {portfolio.is_published ? "Public" : "Private"}{" "}
                          {portfolio.password_hash
                            ? "• Password Protected"
                            : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => unpublishPortfolio(portfolio.id)}
                        style={{
                          padding: "6px 12px",
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Unpublish
                      </button>
                    </div>

                    {/* Portfolio Link */}
                    <div
                      style={{
                        padding: "12px",
                        background: "white",
                        borderRadius: "4px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/portfolio/${portfolio.slug}`}
                        style={{
                          flex: 1,
                          padding: "8px",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      />
                      <button
                        onClick={() => copyToClipboard(portfolio.slug)}
                        style={{
                          padding: "8px 12px",
                          background: colors.accent,
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        {copiedSlug === portfolio.slug ? "✓ Copied" : "Copy"}
                      </button>
                      <a
                        href={`/portfolio/${portfolio.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "8px 12px",
                          background: colors.border,
                          color: colors.primary,
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          textDecoration: "none",
                        }}
                      >
                        Preview
                      </a>
                    </div>

                    {/* Analytics */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          padding: "8px",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{ fontWeight: "700", color: colors.accent }}
                        >
                          {portfolio.view_count || 0}
                        </div>
                        <div style={{ color: colors.secondary }}>Views</div>
                      </div>
                      <div
                        style={{
                          background: "white",
                          padding: "8px",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{ fontWeight: "700", color: colors.accent }}
                        >
                          {portfolio.download_count || 0}
                        </div>
                        <div style={{ color: colors.secondary }}>Downloads</div>
                      </div>
                      <div
                        style={{
                          background: "white",
                          padding: "8px",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{ fontWeight: "700", color: colors.accent }}
                        >
                          {portfolio.click_count || 0}
                        </div>
                        <div style={{ color: colors.secondary }}>Clicks</div>
                      </div>
                    </div>
                  </div>
                ))}
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

export default PortfolioIntegration;
