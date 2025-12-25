import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Button from "../components/Button";
import Card from "../components/Card";
import { fetchPlans, Plan, addCredits } from "../lib/plansUtils";
import { useAuth } from "../lib/authUtils";
import { CheckIcon } from "../components/Icons";
import FAQ from "../components/FAQ";
import SEO from "../components/SEO";

const PlansPage: NextPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [enterprise, setEnterprise] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await fetchPlans();
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setPlans(result.data.data || []);
          if (result.data.enterprise) {
            setEnterprise(result.data.enterprise);
          }
        }
      } catch (err) {
        setError("Failed to load plans");
        console.error("Load plans error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      // For paid plans, we would integrate Stripe here
      // For Free/Starter, just update the plan directly via API

      // Add credits to user account (and update plan)
      const result = await addCredits(plan.credits, plan.id);

      if (result.error) {
        setError(result.error);
      } else {
        // Show success and redirect
        // For starter, show specific message
        const msg =
          plan.id === "starter"
            ? `Switched to Starter Plan! Experience section disabled. Portfolio unlocked.`
            : `Successfully upgraded to ${plan.displayName}! ${plan.credits} credits added.`;

        alert(msg);
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to upgrade plan");
      console.error("Upgrade error:", err);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleContactSales = () => {
    window.location.href =
      "mailto:sales@cloud9profile.com?subject=Enterprise Plan Inquiry";
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    price: "0",
    priceCurrency: "USD",
  };

  return (
    <>
      <SEO
        title="Plans & Pricing - Cloud9Profile"
        description="Choose the perfect plan for your career growth. Start free or upgrade anytime."
        keywords={["pricing", "plans", "subscriptions", "free resume builder"]}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mt-2 md:mt-10 mb-16">
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your career growth. Start free or
              upgrade anytime.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-sm mb-8 max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      plan.isPopular
                        ? "border-gray-900 shadow-xl scale-105 z-10"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    } bg-white`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 inset-x-0 bg-gray-900 text-white py-1 text-center">
                        <span className="text-xs font-semibold tracking-wide uppercase">
                          Best Value
                        </span>
                      </div>
                    )}

                    {plan.id === "starter" && (
                      <div className="absolute top-0 inset-x-0 bg-green-600 text-white py-1 text-center">
                        <span className="text-xs font-semibold tracking-wide uppercase">
                          For Freshers
                        </span>
                      </div>
                    )}

                    <div
                      className={`p-6 flex-1 flex flex-col ${
                        plan.isPopular || plan.id === "starter" ? "pt-10" : ""
                      }`}
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {plan.displayName}
                        </h3>
                        <p className="text-gray-500 text-xs min-h-[40px]">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-baseline mb-2">
                          <span className="text-4xl font-extrabold text-gray-900">
                            {plan.price === 0 ? "Free" : `$${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-500 ml-1 text-xs">
                              /mo
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">
                          {plan.credits} Credits
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <CheckIcon className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 text-xs text-left">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {/* Limitations (if any) */}
                        {plan.limitations &&
                          plan.limitations.map((limit, idx) => (
                            <div
                              key={`lim-${idx}`}
                              className="flex items-start opacity-70"
                            >
                              <span className="w-4 h-4 mr-2 text-red-400 flex items-center justify-center text-[10px] border border-red-400 rounded-full flex-shrink-0">
                                ✕
                              </span>
                              <span className="text-gray-500 text-xs text-left italic">
                                {limit}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* CTA Button */}
                      <Button
                        variant={plan.isPopular ? "primary" : "secondary"}
                        className="w-full mt-auto"
                        disabled={loadingPlanId === plan.id}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {loadingPlanId === plan.id
                          ? "Processing..."
                          : plan.price === 0
                          ? "Select Plan"
                          : "Upgrade"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enterprise Card */}
              {enterprise && (
                <div className="max-w-2xl mx-auto mb-16">
                  <div className="rounded-xl border-2 border-gray-900 bg-white p-8 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {enterprise.displayName}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {enterprise.description}
                        </p>
                        <ul className="space-y-2 mb-6">
                          {enterprise.features
                            .slice(0, 4)
                            .map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckIcon className="w-5 h-5 text-gray-900 mr-3 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-600">
                          + {Math.max(0, enterprise.features.length - 4)} more
                          features
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="primary"
                          onClick={handleContactSales}
                          className="whitespace-nowrap"
                        >
                          Contact Sales
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              <FAQ
                items={[
                  {
                    question: "Can I upgrade or downgrade my plan anytime?",
                    answer:
                      "Yes, you can change your plan at any time. Your credits never expire and will carry over when you upgrade.",
                  },
                  {
                    question: "Do credits expire?",
                    answer:
                      "No, credits never expire. Use them whenever you need, on your own schedule.",
                  },
                  {
                    question: "What happens when I run out of credits?",
                    answer:
                      "You can upgrade to a higher plan or purchase additional credits. You can also keep using the free plan with its monthly credit allowance.",
                  },
                  {
                    question: "Is there a money-back guarantee?",
                    answer:
                      "We stand behind our service. Contact us if you're not satisfied, and we'll work with you on a solution.",
                  },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlansPage;
