import { apiClient } from "./apiClient";

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

// Fetch all plans
export async function fetchPlans() {
  return apiClient.get("/plans/list");
}

// Fetch specific plan
export async function fetchPlan(planId: string) {
  return apiClient.get(`/plans/list?id=${planId}`);
}

// Use credits (deduct from account)
export async function useCredit(creditsUsed: number, action: string) {
  const token = localStorage.getItem("x_user_auth_token");
  if (!token) {
    return {
      error: "Not authenticated",
      message: "You must be logged in to use credits",
    };
  }

  return apiClient.post("/credits/useCredit", {
    token,
    creditsUsed,
    action,
  });
}

// Add credits (purchase/refill)
export async function addCredits(
  creditsToAdd: number,
  planId: string,
  paymentIntentId?: string
) {
  const token = localStorage.getItem("x_user_auth_token");
  if (!token) {
    return {
      error: "Not authenticated",
      message: "You must be logged in to add credits",
    };
  }

  return apiClient.post("/credits/addCredits", {
    creditsToAdd,
    planId,
    paymentIntentId,
  });
}

// Initiate Dodo Checkout
export async function initiateDodoCheckout(productId: string, planId: string) {
  const token = localStorage.getItem("x_user_auth_token");
  if (!token) {
    return {
      error: "Not authenticated",
      message: "You must be logged in to checkout",
    };
  }

  return apiClient.post("/payments/create-checkout", {
    productId,
    planId,
  });
}

// Initiate Dodo Checkout for top-up credits
export async function buyCredits(productId: string) {
  const token = localStorage.getItem("x_user_auth_token");
  if (!token) {
    return {
      error: "Not authenticated",
      message: "You must be logged in to buy credits",
    };
  }

  return apiClient.post("/payments/create-checkout", {
    productId,
    planId: "credits_addon",
  });
}

// Get credit cost for operation
export const CREDIT_COSTS = {
  resume_generation: 2,
  resume_parsing: 5,
  ats_scan: 5,
  portfolio_creation: 3,
  interview_prep: 2,
  cover_letter: 1,
};

// Verify Coupon
export async function verifyCoupon(
  code: string,
  planId?: string,
  userId?: string
) {
  return apiClient.post("/coupons/verify", { code, planId, userId });
}
