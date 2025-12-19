import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const AIToolsUI = () => {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState(0);
  const [userPlan, setUserPlan] = useState("free");
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [processingFeature, setProcessingFeature] = useState<string | null>(
    null
  );

  const colors = {
    primary: "#000000",
    secondary: "#666666",
    accent: "#3b82f6",
    border: "#e5e7eb",
    light: "#f9fafb",
  };

  const aiFeatures = [
    {
      id: "summary",
      name: "Generate Summary",
      description: "AI-powered professional summary generation",
      credits: 2,
      plan: "starter",
      icon: "✨",
    },
    {
      id: "keywords",
      name: "Optimize Keywords",
      description: "Enhance resume with ATS-friendly keywords",
      credits: 3,
      plan: "starter",
      icon: "🔍",
    },
    {
      id: "bullets",
      name: "Enhance Bullets",
      description: "Improve achievement descriptions",
      credits: 2,
      plan: "starter",
      icon: "⭐",
    },
    {
      id: "cover-letter",
      name: "Generate Cover Letter",
      description: "Create tailored cover letters",
      credits: 5,
      plan: "pro",
      icon: "📝",
    },
    {
      id: "grammar",
      name: "Grammar Check",
      description: "Professional grammar and spelling review",
      credits: 1,
      plan: "starter",
      icon: "✏️",
    },
    {
      id: "section-rewrite",
      name: "Rewrite Section",
      description: "Completely rewrite any resume section",
      credits: 4,
      plan: "pro",
      icon: "📄",
    },
  ];

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes/${id}`, {
        headers: { "x-user-id": "user-id-here" },
      });
      const data = await response.json();
      setResume(data.data);
      // Mock user plan and credits
      setUserPlan("pro");
      setCredits(50);
    } catch (err) {
      setError("Failed to load resume");
    } finally {
      setLoading(false);
    }
  };

  const useAIFeature = async (featureId: string) => {
    const feature = aiFeatures.find((f) => f.id === featureId);
    if (!feature) return;

    if (credits < feature.credits) {
      setError(
        `Insufficient credits. Need ${feature.credits}, have ${credits}`
      );
      return;
    }

    try {
      setProcessingFeature(featureId);
      // Simulate AI API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCredits(credits - feature.credits);
      setActiveFeature(null);
      setError("");
    } catch (err) {
      setError("Failed to process request");
    } finally {
      setProcessingFeature(null);
    }
  };

  const canUseFeature = (feature: any) => {
    const planTiers = { free: 0, starter: 1, pro: 2, pro_plus: 3 };
    const userTier = planTiers[userPlan as keyof typeof planTiers] || 0;
    const featureTier = planTiers[feature.plan as keyof typeof planTiers] || 0;
    return userTier >= featureTier;
  };

  const FeatureCard = ({ feature }: any) => {
    const hasCredits = credits >= feature.credits;
    const canUse = canUseFeature(feature);

    return (
      <div
        style={{
          background: "white",
          border:
            activeFeature === feature.id
              ? `2px solid ${colors.accent}`
              : `1px solid ${colors.border}`,
          borderRadius: "8px",
          padding: "20px",
          cursor: canUse ? "pointer" : "not-allowed",
          opacity: canUse ? 1 : 0.5,
          transition: "all 0.2s",
        }}
        onClick={() => canUse && setActiveFeature(feature.id)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "28px" }}>{feature.icon}</div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              background: hasCredits ? "#dbeafe" : "#fecaca",
              color: hasCredits ? colors.accent : "#dc2626",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {feature.credits} credit{feature.credits > 1 ? "s" : ""}
          </span>
        </div>

        <h3
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: colors.primary,
            margin: "0 0 4px 0",
          }}
        >
          {feature.name}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: colors.secondary,
            margin: "0 0 12px 0",
          }}
        >
          {feature.description}
        </p>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "11px",
              background: "#dbeafe",
              color: colors.accent,
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {feature.plan}
          </span>
          {!canUse && (
            <span
              style={{
                fontSize: "11px",
                background: "#fecaca",
                color: "#dc2626",
                padding: "4px 8px",
                borderRadius: "4px",
                fontWeight: "600",
              }}
            >
              Plan Required
            </span>
          )}
        </div>

        {activeFeature === feature.id && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                useAIFeature(feature.id);
              }}
              disabled={processingFeature === feature.id || !hasCredits}
              style={{
                width: "100%",
                padding: "8px 12px",
                background:
                  hasCredits && canUse ? colors.accent : colors.border,
                color: hasCredits && canUse ? "white" : colors.secondary,
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: hasCredits && canUse ? "pointer" : "not-allowed",
              }}
            >
              {processingFeature === feature.id
                ? "Processing..."
                : hasCredits
                ? "Use Feature"
                : "Insufficient Credits"}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>AI Tools - Cloud9Profile</title>
        </Head>
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading AI tools...
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>AI Tools - {resume?.title} - Cloud9Profile</title>
      </Head>

      <div
        style={{
          background: colors.light,
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              marginBottom: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: colors.primary,
                  margin: "0 0 8px 0",
                }}
              >
                AI Tools
              </h1>
              <p
                style={{ fontSize: "14px", color: colors.secondary, margin: 0 }}
              >
                Enhance your resume with AI-powered features
              </p>
            </div>
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

          {/* Credits Status */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: colors.secondary,
                    margin: "0 0 6px 0",
                  }}
                >
                  Available Credits
                </h3>
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: colors.accent,
                    margin: 0,
                  }}
                >
                  {credits}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: colors.secondary,
                    margin: "0 0 6px 0",
                  }}
                >
                  Current Plan
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: colors.primary,
                    margin: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {userPlan}
                </p>
              </div>
              <button
                style={{
                  padding: "10px 20px",
                  background: colors.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Buy Credits
              </button>
            </div>
          </div>

          {/* Feature Tabs */}
          <div
            style={{
              marginBottom: "24px",
              display: "flex",
              gap: "8px",
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: "16px",
              overflowX: "auto",
            }}
          >
            <button
              style={{
                padding: "8px 16px",
                background:
                  activeFeature === null ? colors.accent : "transparent",
                color: activeFeature === null ? "white" : colors.primary,
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => setActiveFeature(null)}
            >
              All Features
            </button>
            <button
              style={{
                padding: "8px 16px",
                background:
                  activeFeature === "writing" ? colors.accent : "transparent",
                color: activeFeature === "writing" ? "white" : colors.primary,
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => setActiveFeature("writing")}
            >
              Writing
            </button>
            <button
              style={{
                padding: "8px 16px",
                background:
                  activeFeature === "optimization"
                    ? colors.accent
                    : "transparent",
                color:
                  activeFeature === "optimization" ? "white" : colors.primary,
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => setActiveFeature("optimization")}
            >
              Optimization
            </button>
          </div>

          {/* Features Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {aiFeatures.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>

          {/* Info Banner */}
          <div
            style={{
              background: "#eff6ff",
              border: `1px solid #bfdbfe`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: colors.accent,
                margin: "0 0 8px 0",
              }}
            >
              💡 Pro Tips
            </h3>
            <ul
              style={{
                fontSize: "13px",
                color: colors.secondary,
                margin: 0,
                paddingLeft: "20px",
              }}
            >
              <li>Start with Grammar Check to fix basic errors</li>
              <li>Use Optimize Keywords before ATS checking</li>
              <li>Cover letters work best with targeted company information</li>
            </ul>
          </div>

          {/* Back Button */}
          <div>
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

export default AIToolsUI;
