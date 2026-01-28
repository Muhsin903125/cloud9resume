import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Button from "../../components/Button";
import Card from "../../components/Card";
import PlanUpgradeModal from "../../components/PlanUpgradeModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { fetchPlans, Plan } from "../../lib/plansUtils";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { motion } from "framer-motion";
import { ArrowRightIcon, StarIcon, PlusIcon, MinusIcon } from "lucide-react";

const CreditsPage: NextPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "subscription"
  >("overview");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(
    null,
  );
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Credits & History
      const creditRes: any = await apiClient.get("/credits");

      // Fetch Plans to get details of current plan
      const plansRes: any = await fetchPlans();

      if (creditRes.data && creditRes.data.success && creditRes.data.data) {
        setData(creditRes.data.data);

        // Find current plan details
        if (plansRes.data && plansRes.data.success && plansRes.data.data) {
          const planId = creditRes.data.data.stats.plan;
          const allPlans = plansRes.data.data.data || plansRes.data.data; // Handle nested data if any

          const planObj = Array.isArray(allPlans)
            ? allPlans.find((p: any) => p.id === planId)
            : allPlans[planId];

          setCurrentPlanDetails(planObj || null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load credits data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    // TODO: Implement API call
    toast.success("Subscription cancellation request received.");
    setShowCancelModal(false);
  };

  return (
    <>
      <Head>
        <title>Credits & Subscription - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen font-sans text-gray-900 bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Credits & Plans</h1>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowPlanModal(true)}
              >
                Buy Credits / Upgrade
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-5xl mx-auto px-6 flex gap-6 mt-[-1px]">
            {["overview", "history", "subscription"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                } capitalize`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            /* Content */
            <div className="max-w-6xl mx-auto px-4 py-8">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border border-gray-200 rounded-xl p-1 shadow-sm max-w-md mx-auto">
                  <TabsTrigger
                    value="overview"
                    className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 font-medium"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 font-medium"
                  >
                    History
                  </TabsTrigger>
                  <TabsTrigger
                    value="subscription"
                    className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 font-medium"
                  >
                    Subscription
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Credit Balance Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg
                          className="w-32 h-32"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05 .82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.58 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.47 .33 2.62 1.26 2.94 3.02h-1.99c-.25-1.02-.83-1.69-2.22-1.69-1.58 0-2.27 .94-2.27 1.59 0 .87 .68 1.6 2.68 2.11 2.79 .71 4.15 1.85 4.15 3.55 .01 1.74-1.25 2.96-3.32 3.37z" />
                        </svg>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">
                          Available Credits
                        </h3>
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {data?.stats?.current || 0}
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                          Use credits to build resumes, generate portfolios, and
                          access premium features.
                        </p>

                        <button
                          onClick={() => setShowPlanModal(true)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                          <span>Buy More Credits</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>

                    {/* Plan Details Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">
                            Current Plan
                          </h3>
                          <div className="text-3xl font-bold text-gray-900 capitalize">
                            {data?.stats?.plan || "Free"}
                          </div>
                          <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </div>
                        </div>
                        {/* Placeholder Icon or Graphic */}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Member Since</span>
                          <span className="font-medium text-gray-900">
                            {data?.subscription?.start_date
                              ? new Date(
                                  data.subscription.start_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Reset Date</span>
                          <span className="font-medium text-gray-900">
                            {data?.subscription?.current_period_end
                              ? new Date(
                                  data.subscription.current_period_end,
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => setShowPlanModal(true)}
                          className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Quick Breakdown / Cost Reference Table */}
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Credit Costs
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        {[
                          { action: "Resume Generation", cost: 2, icon: "📄" },
                          { action: "Portfolio Website", cost: 10, icon: "🌐" },
                          { action: "Cover Letter", cost: 5, icon: "✉️" },
                          { action: "ATS Analysis", cost: 5, icon: "🎯" },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="p-4 flex items-center justify-between sm:block sm:text-center"
                          >
                            <div className="flex items-center gap-3 sm:block sm:mb-2">
                              <span className="text-2xl sm:text-3xl">
                                {item.icon}
                              </span>
                              <span className="font-medium text-gray-900 sm:block sm:mt-2">
                                {item.action}
                              </span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.cost} credits
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">
                      Transaction History
                    </h3>
                    {data?.history && data.history.length > 0 ? (
                      <div className="space-y-4">
                        {data.history.map((tx: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                              >
                                {tx.amount > 0 ? (
                                  <PlusIcon size={14} />
                                ) : (
                                  <MinusIcon size={14} />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {tx.description ||
                                    (tx.amount > 0
                                      ? "Purchased Credits"
                                      : "Used Credits")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(tx.created_at).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(tx.created_at).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-gray-900"}`}
                            >
                              {tx.amount > 0 ? "+" : ""}
                              {tx.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        No transaction history found.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="subscription">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <StarIcon size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 capitalize">
                        {data?.stats?.plan || "Free"} Plan
                      </h2>
                      <p className="text-gray-500 mt-2">
                        You are currently on the {data?.stats?.plan || "free"}{" "}
                        tier.
                      </p>
                    </div>

                    <div className="space-y-4 bg-gray-50 rounded-xl p-6 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <span className="font-semibold text-green-600">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Billing Cycle</span>
                        <span className="font-semibold text-gray-900">
                          {data?.stats?.plan === "free"
                            ? "Lifetime"
                            : "Monthly"}
                        </span>
                      </div>
                      {data?.subscription?.current_period_end && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Renews On</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(
                              data.subscription.current_period_end,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        Change Plan
                      </button>
                      {data?.stats?.plan !== "free" && (
                        <button
                          onClick={handleCancelSubscription}
                          className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      <PlanUpgradeModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={data?.stats?.plan}
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Subscription"
        message="Are you sure you want to cancel? This will downgrade you to the Free plan at the end of the billing period."
        confirmText="Confirm Cancellation"
        isDestructive={true}
      />
    </>
  );
};

export default CreditsPage;
