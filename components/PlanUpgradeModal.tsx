import { useState } from "react";
import SharedModal from "./SharedModal";
import Button from "./Button";
import { CheckIcon, SparklesIcon } from "./Icons";

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
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // Redirect to plans page
    window.location.href = "/plans";
  };

  const professionalPlan = {
    name: "Professional",
    price: 12.99,
    trialPrice: 6.5,
    credits: 200,
    features: [
      "Unlimited Resumes",
      "Unlimited Cover Letters",
      "5 Published Portfolios",
      "200 AI Credits/month",
      "No watermarks",
      "Advanced ATS features",
    ],
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {limitedFeature
            ? `Unlock ${limitedFeature}`
            : "Upgrade to Professional"}
        </h2>
        <p className="text-gray-600">Get unlimited access to all features</p>
      </div>

      {/* Professional Plan Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {professionalPlan.name}
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-blue-600">
                ${professionalPlan.trialPrice}
              </span>
              <span className="text-sm text-gray-500">for 14 days</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Then ${professionalPlan.price}/month
            </p>
          </div>
          <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {professionalPlan.credits} credits/mo
          </div>
        </div>

        <div className="space-y-2">
          {professionalPlan.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Maybe Later
        </Button>
        <Button
          variant="primary"
          onClick={handleUpgrade}
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Loading..." : "Start 14-Day Trial"}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Cancel anytime. No hidden fees.
      </p>
    </SharedModal>
  );
}
