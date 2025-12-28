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
  description: string;
  limitations?: string[];
}

// Define all available plans
const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    displayName: "Free Plan",
    price: 0,
    billingPeriod: "monthly",
    credits: 10,
    description: "Perfect for getting started",
    features: ["1 Resume", "1 Portfolio", "5 AI Credits", "Standard Templates"],
    limitations: ["Max 1 Resume", "Max 1 Portfolio"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    displayName: "Starter (Fresher)",
    price: 0,
    billingPeriod: "monthly",
    credits: 10,
    description: "Best for students & freshers",
    features: [
      "1 Resume",
      "1 Portfolio",
      "5 AI Credits",
      "Portfolio Publishing",
    ],
    limitations: ["No Experience Section", "Max 1 Resume"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    displayName: "Pro Plan",
    price: 9.99,
    billingPeriod: "monthly",
    credits: 150,
    isPopular: true,
    description: "For serious job seekers",
    features: [
      "5 Resumes",
      "2 Portfolios",
      "150 AI Credits",
      "Advanced ATS Scoring",
      "AI Resume Suggestions",
      "Cover Letter Generator",
      "PDF Downloads",
      "Priority Email Support",
    ],
  },
  pro_plus: {
    id: "pro_plus",
    name: "Pro Plus",
    displayName: "Pro Plus",
    price: 19.99,
    billingPeriod: "monthly",
    credits: 400,
    description: "Max power for professionals",
    features: [
      "Unlimited Resumes",
      "10 Portfolios",
      "400 AI Credits",
      "Priority ATS Scoring",
      "Interview Prep",
      "LinkedIn Optimization",
      "Custom Domain",
      "Priority Support",
    ],
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
        // Custom sort order: Free, Starter, Pro, Pro+
        const order = ["free", "starter", "pro", "pro_plus"];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });

    return res.status(200).json({
      data: plans,
      enterprise: PLANS.enterprise,
    });
  } catch (error) {
    console.error("Fetch plans error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
