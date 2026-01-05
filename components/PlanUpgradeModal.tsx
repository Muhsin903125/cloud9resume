import { useState, useEffect } from "react";
import SharedModal from "./SharedModal";
import Button from "./Button";
import { CheckIcon, SparklesIcon, CreditCardIcon } from "./Icons";
import {
  initiateDodoCheckout,
  buyCredits,
  fetchPlans,
  Plan,
} from "../lib/plansUtils";
import { toast } from "react-hot-toast";

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  triggeredBy?: "limit_reached" | "upgrade_prompt" | "manual";
  limitedFeature?: string;
}

export default function PlanUpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  triggeredBy,
  limitedFeature,
}: PlanUpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [creditsAddonId, setCreditsAddonId] = useState<string | null>(null);

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

  const handleUpgrade = async (productId: string, planId: string) => {
    if (!productId) {
      window.location.href = "/plans";
      return;
    }
    setLoading(planId);
    try {
      const result = await initiateDodoCheckout(productId, planId);
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
    <SharedModal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {limitedFeature
              ? `Upgrade for ${limitedFeature}`
              : "Upgrade Your Plan"}
          </h2>
          <p className="text-sm text-gray-500">
            Get access to advanced features and more credits
          </p>
        </div>

        <div className="space-y-4 mb-4">
          {/* Subscription Plans */}
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                plan.isPopular
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-2 right-4 px-3 py-0.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Best Value
                </div>
              )}
              {currentPlan === plan.id && (
                <div className="absolute -top-2 left-4 px-3 py-0.5 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Current Plan
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {plan.displayName}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.hasTrial && plan.trialPrice ? (
                      <>
                        <span className="text-2xl font-bold text-blue-600">
                          ${plan.trialPrice}
                        </span>
                        <span className="text-xs text-gray-500">
                          first month
                        </span>
                        <span className="text-xs text-gray-400">
                          then ${plan.price}/mo
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-xs text-gray-500">/mo</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {plan.features
                      .slice(0, 3)
                      .map((feature: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-gray-600"
                        >
                          <CheckIcon className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    variant={plan.isPopular ? "primary" : "secondary"}
                    onClick={() => handleUpgrade(plan.dodoProductId, plan.id)}
                    disabled={loading !== null || currentPlan === plan.id}
                    className="px-4 py-2 text-sm font-semibold"
                  >
                    {loading === plan.id
                      ? "Loading..."
                      : currentPlan === plan.id
                      ? "Current"
                      : plan.hasTrial
                      ? `Try $${plan.trialPrice}`
                      : "Upgrade"}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Credit Top-up Option */}
          <div className="relative p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    100 AI Credits
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">$5.00</p>
                  <p className="text-xs text-gray-500">
                    One-time purchase • Credits never expire
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={handleBuyCredits}
                  disabled={loading !== null}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  {loading === "credits" ? "Loading..." : "Buy Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          Secure checkout powered by Dodo Payments
        </p>
      </div>
    </SharedModal>
  );
}
