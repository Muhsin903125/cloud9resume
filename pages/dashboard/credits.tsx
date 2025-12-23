import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Button from "../../components/Button";
import Card from "../../components/Card";
import PlanSelectionModal from "../../components/PlanSelectionModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { fetchPlans, Plan } from "../../lib/plansUtils";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";

const CreditsPage: NextPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "subscription"
  >("overview");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(
    null
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
            <>
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg shadow-blue-900/20">
                      <div className="text-5xl font-bold mb-2">
                        {data?.stats?.current || 0}
                      </div>
                      <p className="text-blue-100 font-medium text-sm">
                        Amount Available
                      </p>
                    </Card>
                    <Card className="p-6">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {data?.stats?.used || 0}
                      </div>
                      <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                        Used This Month
                      </p>
                    </Card>
                    <Card className="p-6">
                      <div className="text-xl font-bold text-gray-900 mb-1 capitalize">
                        {data?.stats?.plan || "Free"}
                      </div>
                      <p className="text-gray-500 text-sm mb-4">Current Plan</p>
                      <div className="text-xs text-gray-400">
                        Resets on {data?.stats?.resetDate}
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Quick Actions
                    </h2>
                    <div className="grid sm:grid-cols-4 gap-4">
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
                      >
                        <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">
                          ⚡
                        </span>
                        <span className="font-semibold text-gray-900 text-sm">
                          Add Credits
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">
                      Transaction History
                    </h3>
                  </div>
                  {data?.history?.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {data.history.map((item: any, i: number) => {
                        const isNegative = item.credits_used < 0; // Negative usage means addition
                        const amount = Math.abs(item.credits_used);
                        return (
                          <div
                            key={i}
                            className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm capitalize">
                                {item.action.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(item.created_at)}
                              </p>
                            </div>
                            <div
                              className={`text-sm font-bold ${
                                isNegative ? "text-green-600" : "text-gray-900"
                              }`}
                            >
                              {isNegative ? "+" : "-"}
                              {amount}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      No transaction history found.
                    </div>
                  )}
                </Card>
              )}

              {activeTab === "subscription" && (
                <div className="max-w-2xl">
                  <Card className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 capitalize mb-1">
                          {currentPlanDetails?.displayName || data?.stats?.plan}
                        </h3>
                        <p className="text-gray-500">
                          {currentPlanDetails?.price === 0
                            ? "Free Plan"
                            : `$${currentPlanDetails?.price}/month`}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          data?.stats?.plan === "free"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        Active
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-600">Billing Cycle</span>
                        <span className="font-medium">Monthly</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-600">Next Billing Date</span>
                        <span className="font-medium">
                          {data?.stats?.resetDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={() => setShowPlanModal(true)}>
                        {data?.stats?.plan === "free"
                          ? "Upgrade Plan"
                          : "Change Plan"}
                      </Button>
                      {data?.stats?.plan !== "free" && (
                        <Button
                          variant="secondary"
                          onClick={handleCancelSubscription}
                          className="text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlanId={data?.stats?.plan}
        onSuccess={fetchData}
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
