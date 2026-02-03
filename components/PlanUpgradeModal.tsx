import { useState, useEffect } from "react";
import SharedModal from "./SharedModal";
import Button from "./Button";
import {
  CheckIcon,
  SparklesIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  initiateDodoCheckout,
  buyCredits,
  fetchPlans,
  Plan,
  verifyCoupon,
} from "../lib/plansUtils";
import { toast } from "react-hot-toast";

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  triggeredBy?: "limit_reached" | "upgrade_prompt" | "manual";
  limitedFeature?: string;
  errorMessage?: string;
}

export default function PlanUpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  triggeredBy,
  limitedFeature,
  errorMessage,
}: PlanUpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [creditsAddonId, setCreditsAddonId] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponStatus, setCouponStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [couponMessage, setCouponMessage] = useState("");

  // Fetch plans and IDs on mount
  useEffect(() => {
    if (isOpen) {
      const loadPlans = async () => {
        try {
          const result = await fetchPlans();
          if (result.data) {
            setPlans(result.data.data || []);
            setCreditsAddonId(result.data.creditsAddonId);
          }
        } catch (err) {
          console.error("Failed to load plans", err);
        }
      };
      loadPlans();
    }
  }, [isOpen]);

  // Filter plans to show only current and higher plans
  const availablePlans = plans.filter((plan) => {
    const planOrder = { free: 0, professional: 1, premium: 2 };
    const currentOrder = planOrder[currentPlan as keyof typeof planOrder] || 0;
    const thisPlanOrder = planOrder[plan.id as keyof typeof planOrder] || 0;
    return thisPlanOrder >= currentOrder && plan.id !== "free";
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      setCouponStatus("error");
      return;
    }

    setCouponStatus("loading");
    setCouponMessage("");

    try {
      const result = await verifyCoupon(couponCode);
      if (result.data?.valid) {
        setAppliedCoupon(result.data.coupon);
        setCouponStatus("success");
        const discountText =
          result.data.coupon.discount_type === "percentage"
            ? `${result.data.coupon.discount_value}% off`
            : `$${result.data.coupon.discount_value} off`;
        setCouponMessage(`Coupon applied! ${discountText}`);
      } else {
        setCouponStatus("error");
        setCouponMessage("Invalid coupon code");
      }
    } catch (error: any) {
      setCouponStatus("error");
      setCouponMessage(error.response?.data?.error || "Invalid coupon code");
    }
  };

  const handleUpgrade = async (productId: string, planId: string) => {
    if (!productId) {
      window.location.href = "/plans";
      return;
    }
    setLoading(planId);
    try {
      const result = await initiateDodoCheckout(
        productId,
        planId,
        appliedCoupon?.code, // Pass coupon code if applied
      );
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        window.location.href = "/plans";
      }
    } catch (error) {
      window.location.href = "/plans";
    } finally {
      setLoading(null);
    }
  };

  const handleBuyCredits = async () => {
    if (!creditsAddonId) {
      toast.error("Credit top-ups are currently unavailable");
      return;
    }
    setLoading("credits");
    try {
      const result = await buyCredits(creditsAddonId);
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error("Credit purchase error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      theme="dark"
    >
      <div className="p-4 md:p-6 bg-slate-900 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            {limitedFeature ? `Unlock ${limitedFeature}` : "Upgrade Your Plan"}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Get access to advanced career tools and AI power to land your dream
            job
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-1.5 bg-red-500/20 rounded-lg">
              <SparklesIcon className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-0.5">
                Action Required
              </p>
              <p className="text-sm text-red-200/80 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative group rounded-xl border transition-all duration-300 overflow-hidden ${
                plan.isComingSoon
                  ? "bg-slate-800/20 border-slate-800 opacity-60"
                  : plan.isPopular
                    ? "bg-slate-800/60 border-blue-500/30 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10"
                    : "bg-slate-800/40 border-slate-700 hover:bg-slate-800/60 hover:border-slate-600"
              }`}
            >
              {plan.isPopular && !plan.isComingSoon && (
                <div className="absolute top-0 right-0 pointer-events-none">
                  <div className="bg-gradient-to-bl from-blue-600 to-transparent w-12 h-12 opacity-40 blur-lg"></div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                    <SparklesIcon className="w-2.5 h-2.5" />
                    Best Value
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-stretch h-full">
                {/* Left Column: Info & Price (30%) */}
                <div className="md:w-[30%] p-5 flex flex-col justify-center flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-700/50">
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      plan.isComingSoon ? "text-slate-500" : "text-white"
                    }`}
                  >
                    {plan.displayName}
                  </h3>

                  {plan.isComingSoon ? (
                    <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-400 border border-slate-600 w-fit">
                      Coming Soon
                    </div>
                  ) : plan.hasTrial && plan.trialPrice ? (
                    <div className="flex flex-col items-start">
                      <div className="flex items-start gap-2">
                        <span className="text-3xl font-bold text-white tracking-tight -mt-1">
                          ${plan.trialPrice}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/20 uppercase mt-1">
                          50% OFF
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                        <p>
                          {" "}
                          <span className="line-through decoration-slate-600 text-slate-500 mr-1">
                            ${plan.price}
                          </span>
                          for first month,
                        </p>
                        <p>then ${plan.price}/mo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-slate-400">/mo</span>
                    </div>
                  )}
                </div>

                {/* Middle Column: Features (45%) */}
                <div className="md:w-[45%] p-4 flex items-center border-b md:border-b-0 md:border-r border-slate-700/50 bg-slate-800/20">
                  <ul
                    className={`grid grid-cols-2 gap-x-2 gap-y-1.5 w-full ${
                      plan.isComingSoon ? "opacity-50" : ""
                    }`}
                  >
                    {plan.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-1.5 text-[10px] text-slate-300 leading-tight"
                      >
                        <CheckIcon
                          className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                            plan.isComingSoon
                              ? "text-slate-600"
                              : "text-blue-400"
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Column: Action (25%) */}
                <div className="md:w-[25%] p-4 flex flex-col justify-center items-center bg-slate-800/10">
                  <Button
                    variant={
                      plan.isPopular && !plan.isComingSoon
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() =>
                      !plan.isComingSoon &&
                      handleUpgrade(plan.dodoProductId, plan.id)
                    }
                    disabled={
                      loading !== null ||
                      currentPlan === plan.id ||
                      plan.isComingSoon
                    }
                    className={`w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      plan.isComingSoon
                        ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        : plan.isPopular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 border-none text-white shadow-md shadow-blue-900/20"
                          : "bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white"
                    }`}
                  >
                    {loading === plan.id ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Wait...
                      </>
                    ) : currentPlan === plan.id ? (
                      "Current"
                    ) : plan.isComingSoon ? (
                      "Waitlist"
                    ) : (
                      <>
                        {plan.hasTrial ? "Claim Offer" : "Upgrade"}
                        {!plan.isComingSoon && (
                          <SparklesIcon className="w-3.5 h-3.5" />
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Code Section */}
        <div className="border-t border-slate-800/50 pt-4 pb-2">
          <div className="px-1">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (couponStatus !== "idle") {
                    setCouponStatus("idle");
                    setCouponMessage("");
                  }
                }}
                placeholder="Enter code"
                disabled={couponStatus === "success"}
                className={`flex-1 max-w-[200px] px-3 py-2 bg-slate-800 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  couponStatus === "success"
                    ? "border-green-500/50 bg-green-900/20"
                    : couponStatus === "error"
                      ? "border-red-500/50 focus:ring-red-500/30"
                      : "border-slate-700 focus:ring-blue-500/30"
                }`}
              />
              <Button
                variant="secondary"
                size="small"
                onClick={handleApplyCoupon}
                disabled={
                  loading !== null ||
                  couponStatus === "loading" ||
                  couponStatus === "success" ||
                  !couponCode.trim()
                }
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  couponStatus === "success"
                    ? "bg-green-600 text-white border-green-500"
                    : "bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600"
                }`}
              >
                {couponStatus === "loading" ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : couponStatus === "success" ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>

            {/* Feedback Message */}
            {couponMessage && (
              <div
                className={`mt-2 px-3 py-2 rounded-lg text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 ${
                  couponStatus === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-300"
                    : "bg-red-500/10 border border-red-500/20 text-red-300"
                }`}
              >
                {couponStatus === "success" ? (
                  <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <SparklesIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{couponMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Credit Top Up */}
        {currentPlan !== "free" && (
          <div className="border-t border-slate-800/50 pt-3">
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded text-indigo-400">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">
                    Credit Top-up
                  </span>
                  <span className="text-[10px] text-slate-500">
                    100 Credits for $5.00
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={handleBuyCredits}
                disabled={loading !== null}
                className="px-3 py-1.5 text-[10px] bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all font-medium"
              >
                {loading === "credits" ? "..." : "Buy Credits"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </SharedModal>
  );
}
