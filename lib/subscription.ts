import { UserProfile } from "./types";

export type PlanType = "free" | "starter" | "pro" | "pro_plus" | "enterprise";

export const PLAN_LIMITS = {
  free: {
    resumes: 1,
    portfolios: 1,
    canAddExperience: true,
  },
  starter: {
    resumes: 1,
    portfolios: 1,
    canAddExperience: false, // Fresher restriction
  },
  pro: {
    resumes: 5,
    portfolios: 2,
    canAddExperience: true,
  },
  pro_plus: {
    resumes: Infinity,
    portfolios: 10,
    canAddExperience: true,
  },
  enterprise: {
    resumes: Infinity,
    portfolios: Infinity,
    canAddExperience: true,
  },
};

export const CREDIT_COSTS = {
  resume_download: 5,
  portfolio_publish: 10, // First publish usually higher or flat rate?
  portfolio_update: 2, // Cheaper to update
  ai_generation: 2,
  ai_fix: 1,
};

// Helper: Check if user can create more resources
export function canCreateResource(
  plan: PlanType,
  currentCount: number,
  resourceType: "resumes" | "portfolios"
): boolean {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const limit = limits[resourceType];
  return currentCount < limit;
}

// Helper: Check if user can add specific sections
export function canAddSection(plan: PlanType, sectionType: string): boolean {
  if (sectionType === "experience") {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    return limits.canAddExperience;
  }
  return true;
}

// Helper: Get plan display name
export function getPlanName(plan: PlanType): string {
  switch (plan) {
    case "starter":
      return "Starter (Fresher)";
    case "pro":
      return "Pro";
    case "pro_plus":
      return "Pro+";
    case "enterprise":
      return "Enterprise";
    default:
      return "Free";
  }
}
