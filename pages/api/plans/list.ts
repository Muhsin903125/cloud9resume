import { NextApiRequest, NextApiResponse } from "next";

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  credits: number;
  features: string[];
  isPopular?: boolean;
  hasTrial?: boolean;
  trialPrice?: number;
  trialDays?: number;
  isComingSoon?: boolean;
  description: string;
  limitations?: string[];
  dodoProductId?: string;
}

// Define all available plans
const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    displayName: "Free",
    price: 0,
    billingPeriod: "monthly",
    credits: 5,
    description: "Perfect for trying out Cloud9Profile",
    features: [
      "3 Resumes",
      "1 Portfolio",
      "Portfolio Publishing (30 days)",
      "1 Cover Letter",
      "5 AI Credits",
      "Basic ATS Checker",
      "Standard Templates",
      "PDF Export (with watermark)",
    ],
    limitations: [
      "Portfolio expires after 30 days",
      "PDF exports have watermark",
      "Limited AI credits",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    displayName: "Professional",
    price: 12.99,
    billingPeriod: "monthly",
    credits: 200,
    isPopular: true,
    hasTrial: true,
    trialPrice: 6.49,
    trialDays: 14,
    description: "Everything you need for a successful job search",
    features: [
      "Unlimited Resumes",
      "5 Published Portfolios",
      "Unlimited Cover Letters",
      "200 AI Credits/month",
      "AI Resume Generation",
      "Cover Letter Generator",
      "Advanced ATS Scoring",
      "JD Optimization",
      "PDF Export (no watermark)",
      "Portfolio Publishing",
      "Priority Email Support",
    ],
    dodoProductId:
      process.env.DODO_PROFESSIONAL_PRODUCT_ID ||
      "prod_professional_placeholder",
  },
  premium: {
    id: "premium",
    name: "Premium",
    displayName: "Premium",
    price: 24.99,
    billingPeriod: "monthly",
    credits: 500,
    isComingSoon: true,
    description: "Advanced features for career professionals",
    features: [
      "Everything in Professional",
      "500 AI Credits/month",
      "Unlimited Portfolios",
      "Interview Prep (AI Mock Interviews)",
      "LinkedIn Profile Optimization",
      "Custom Domain for Portfolio",
      "Advanced OCR",
      "Priority Chat Support",
      "Early Access to New Features",
    ],
    dodoProductId:
      process.env.DODO_PREMIUM_PRODUCT_ID || "prod_premium_placeholder",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    displayName: "Enterprise",
    price: 0,
    billingPeriod: "yearly",
    credits: 1000,
    description: "For teams and organizations",
    features: [
      "Unlimited Everything",
      "Custom Integrations",
      "Dedicated Account Manager",
    ],
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (id && typeof id === "string") {
      const plan = PLANS[id];
      if (!plan) {
        return res.status(404).json({
          error: "Plan not found",
        });
      }
      return res.status(200).json({ data: plan });
    }

    const plans = Object.values(PLANS)
      .filter((plan) => plan.id !== "enterprise")
      .sort((a, b) => {
        // Custom sort order: Free, Professional, Premium
        const order = ["free", "professional", "premium"];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });

    return res.status(200).json({
      data: plans,
      enterprise: PLANS.enterprise,
      creditsAddonId: process.env.DODO_CREDITS_ADDON_PRODUCT_ID || null,
    });
  } catch (error) {
    console.error("Fetch plans error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
