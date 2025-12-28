import React, { useEffect, useState } from "react";
import SharedModal from "./SharedModal";
import { fetchPlans, Plan, addCredits } from "../lib/plansUtils";
import { CheckIcon } from "./Icons";
import Button from "./Button";
import { toast } from "react-hot-toast";

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh stats
  currentPlanId?: string;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPlanId,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const result: any = await fetchPlans();
      // API returns { data: [plans], enterprise: {...} } inside the apiClient wrapper
      if (result.data && result.data.data) {
        setPlans(result.data.data);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
      toast.error("Failed to load available plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    // If already on this plan, maybe specific logic? For now allow re-selecting to add credits?
    // Usually upgrading means swiching.

    setProcessingId(plan.id);
    try {
      const result: any = await addCredits(plan.credits, plan.id);

      if (result.data && result.data.success) {
        const msg =
          plan.id === "starter"
            ? "Switched to Starter Plan! Experience section disabled."
            : `Upgraded to ${plan.displayName}! ${plan.credits} credits added.`;

        toast.success(msg);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Failed to upgrade plan");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error("An error occurred while upgrading");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="" size="xl">
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isProcessing = processingId === plan.id;
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`flex flex-col relative rounded-xl p-5 transition-all duration-300 ${
                  isPopular
                    ? "bg-white border-2 border-blue-600 shadow-xl scale-105 z-10"
                    : "bg-white border border-gray-200 shadow hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    Best Value
                  </div>
                )}

                <div className="mb-3 text-center">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                      isPopular ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {plan.displayName}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-black text-gray-900">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    <span className="ml-0.5 text-[10px] font-medium text-gray-400">
                      /{plan.billingPeriod === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium leading-tight px-2">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-2 mb-6 flex-1 bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                  {plan.features.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 flex-shrink-0 ${
                          isPopular ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        <CheckIcon size={10} className="stroke-[3]" />
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.limitations && plan.limitations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                      {plan.limitations.map((lim, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[10px] text-gray-400"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                          <span>{lim}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  disabled={isProcessing || isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2 text-xs font-bold rounded-lg shadow-none transition-all ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 border-0"
                      : isPopular
                      ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg text-white"
                      : "bg-gray-900 hover:bg-black text-white"
                  }`}
                >
                  {isProcessing
                    ? "Processing..."
                    : isCurrent
                    ? "Current Plan"
                    : "Choose Plan"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </SharedModal>
  );
};

export default PlanSelectionModal;
