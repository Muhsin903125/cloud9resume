import { UserProfile } from "./types";

export type PlanType = "free" | "starter" | "pro" | "pro_plus" | "enterprise";

export const PLAN_LIMITS = {
  free: {
    resumes: 3,
    portfolios: 1,
    cover_letters: 1,
    canAddExperience: true,
    hasWatermark: true,
    canUseAI: true,
    canPublishPortfolio: true,
    portfolioPublishDays: 30, // Free users get 30-day publishing trial
  },
  starter: {
    resumes: 5,
    portfolios: 1,
    cover_letters: 3,
    canAddExperience: true,
    hasWatermark: true,
    canUseAI: true,
    canPublishPortfolio: true,
    portfolioPublishDays: 30,
  },
  pro: {
    resumes: Infinity,
    portfolios: 5,
    cover_letters: Infinity,
    canAddExperience: true,
    hasWatermark: false,
    canUseAI: true,
    canPublishPortfolio: true,
    portfolioPublishDays: 0, // 0 = unlimited/no expiration
    customDomain: false,
  },
  pro_plus: {
    resumes: Infinity,
    portfolios: Infinity,
    cover_letters: Infinity,
    canAddExperience: true,
    hasWatermark: false,
    canUseAI: true,
    canPublishPortfolio: true,
    portfolioPublishDays: 0, // unlimited
    customDomain: true,
    interviewPrep: true,
    linkedInOptimization: true,
  },
  enterprise: {
    resumes: Infinity,
    portfolios: Infinity,
    cover_letters: Infinity,
    canAddExperience: true,
    hasWatermark: false,
    canUseAI: true,
    canPublishPortfolio: true,
    portfolioPublishDays: 0, // unlimited
    customDomain: true,
    interviewPrep: true,
    linkedInOptimization: true,
  },
};

export const WELCOME_BONUS = 25;

export const CREDIT_COSTS = {
  resume_download_pdf: 1,
  portfolio_publish: 5,
  portfolio_update: 1,
  ai_generation: 2,
  ai_fix: 1,
  cover_letter_generation: 5,
  ats_analysis: 5,
  ats_auto_apply: 5,
  portfolio_ai_generation: 10,
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

// Helper: Check if user can create cover letters
export function canCreateCoverLetter(
  plan: PlanType,
  currentCount: number
): boolean {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const limit = limits.cover_letters;
  return currentCount < limit;
}

// Helper: Get plan display name
export function getPlanName(plan: PlanType): string {
  switch (plan) {
    case "starter":
      return "Starter";
    case "pro":
      return "Professional"; // "Pro" in code, "Professional" in UI
    case "pro_plus":
      return "Premium"; // "Pro Plus" in code, "Premium" in UI
    case "enterprise":
      return "Enterprise";
    default:
      return "Free";
  }
}
