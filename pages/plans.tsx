import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import {
  fetchPlans,
  Plan,
  addCredits,
  initiateDodoCheckout,
} from "../lib/plansUtils";
import { useAuth } from "../lib/authUtils";
import { CheckIcon, SparklesIcon } from "../components/Icons";
import FAQ from "../components/FAQ";
import SEO from "../components/SEO";

const PlansPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

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
      router.push("/login?redirect=/plans");
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      if (plan.price === 0) {
        const result = await addCredits(plan.credits, plan.id);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push("/dashboard");
        return;
      }

      if (!plan.dodoProductId) {
        setError("Payment integration error: Missing Product ID");
        return;
      }

      const result = await initiateDodoCheckout(plan.dodoProductId, plan.id);

      if (result.error) {
        setError(result.error);
      } else if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError("Failed to generate checkout link");
      }
    } catch (err) {
      setError("Failed to upgrade plan");
      console.error("Upgrade error:", err);
    } finally {
      if (plan.price === 0) setLoadingPlanId(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <SEO
        title="Plans - Cloud9Profile"
        description="Choose the perfect plan for your career growth."
        keywords={["pricing", "plans"]}
      />

      <div className="min-h-screen bg-slate-900 text-slate-50 overflow-hidden relative selection:bg-blue-500/30">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Invest in Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Future
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Unlock the full potential of your career with our AI-powered
              tools.
              <br className="hidden md:block" /> Simple pricing, no hidden fees.
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-8 text-center max-w-md mx-auto"
            >
              {error}
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-20"
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={item}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`relative flex flex-col p-6 rounded-3xl bg-slate-800/50 border transition-all duration-300 ${
                    plan.isPopular
                      ? "border-blue-500/50 shadow-2xl shadow-blue-500/10 z-10 scale-105"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && !plan.isComingSoon && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <SparklesIcon className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {plan.displayName}
                    </h3>
                    <p className="text-slate-400 text-sm h-10 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-700/50">
                    <div className="flex flex-col mb-2">
                      {plan.hasTrial && plan.trialPrice ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                              ${plan.trialPrice}
                            </span>
                            <span className="text-sm text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                              50% OFF
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-slate-400 text-sm">
                              for first month, then
                            </span>
                            <span className="text-slate-300 text-sm font-medium">
                              ${plan.price}/mo
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-white">
                            {plan.price === 0 ? "Free" : `$${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-slate-500 ml-1 text-sm">
                              /mo
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-xs font-medium border border-slate-700">
                      {plan.credits} AI Credits
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <div className="bg-blue-500/10 rounded-full p-0.5 mr-3 mt-0.5">
                          <CheckIcon className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={
                      !plan.isComingSoon && plan.id !== loadingPlanId
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      !plan.isComingSoon && plan.id !== loadingPlanId
                        ? { scale: 0.98 }
                        : {}
                    }
                    className={`w-full py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-600/25 text-white shadow-blue-900/20"
                        : "bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white"
                    } ${
                      plan.isComingSoon || loadingPlanId === plan.id
                        ? "opacity-50 cursor-not-allowed grayscale"
                        : ""
                    }`}
                    disabled={loadingPlanId === plan.id || plan.isComingSoon}
                    onClick={() => !plan.isComingSoon && handleSelectPlan(plan)}
                  >
                    {loadingPlanId === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing
                      </span>
                    ) : plan.price === 0 ? (
                      "Get Started Free"
                    ) : plan.isComingSoon ? (
                      "Coming Soon"
                    ) : plan.hasTrial ? (
                      `Claim 50% Off - $${plan.trialPrice}`
                    ) : (
                      "Upgrade Plan"
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h3>
            <FAQ
              items={[
                {
                  question: "Can I cancel my subscription anytime?",
                  answer:
                    "Yes, you can cancel your subscription at any time. You'll keep access to your plan features and remaining credits until the end of your billing cycle.",
                },
                {
                  question: "Do my credits roll over?",
                  answer:
                    "Your credits never expire! Whether you're on a monthly plan or buying credit packs, they stay in your account until you use them.",
                },
                {
                  question: "Can I separate my personal and work profiles?",
                  answer:
                    "Absolutely. You can create different resumes and portfolios for different purposes within a single account.",
                },
              ]}
              theme="dark"
            />
          </div>

          <div className="text-center mt-20 pt-10 border-t border-slate-800">
            <p className="text-slate-500 text-sm">
              Need a custom plan for your team?{" "}
              <a
                href="mailto:sales@cloud9profile.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Contact Sales
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlansPage;
