import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../../components/Button";
import { useAuth } from "../../lib/authUtils";
import {
  DocumentIcon,
  PortfolioIcon,
  AnalyticsIcon,
  ActivityIcon,
  ArrowRightIcon,
  MailIcon,
  PlusIcon,
} from "../../components/Icons";
import { motion } from "framer-motion";
import { apiClient } from "../../lib/apiClient";
import PlanUpgradeModal from "../../components/PlanUpgradeModal";
import OnboardingModal from "../../components/OnboardingModal";
import { toast } from "react-hot-toast";
import { PLAN_LIMITS, PlanType } from "../../lib/subscription";
import { formatDistanceToNow } from "date-fns";

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [displayName, setDisplayName] = useState<string>("User");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [stats, setStats] = useState({
    resumesCreated: 0,
    portfoliosCreated: 0,
    atsScores: 0,
    portfolioViews: 0,
    templatesUsed: 8,
    creditsRemaining: 0,
    plan: "free" as PlanType,
    portfolioExpiresAt: null as string | null,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    if (user) {
      const name =
        user.name ||
        user.profile?.first_name ||
        user.email?.split("@")[0] ||
        "User";
      setDisplayName(name);

      // Sync credits from user profile (same source as sidebar)
      const profileCredits = user.profile?.credits;
      if (profileCredits !== undefined) {
        setStats((prev) => ({
          ...prev,
          creditsRemaining: profileCredits,
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (
      router.query.status === "success" ||
      router.query.payment === "success"
    ) {
      toast.success("Payment successful! Updating account...");
      router.replace("/dashboard", undefined, { shallow: true });
      fetchDashboardData();
      setTimeout(() => fetchDashboardData(true), 2000);
      setTimeout(() => fetchDashboardData(true), 5000);
    }
  }, [router.query.status, router.query.payment]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user && user.profile && user.profile.onboarding_completed === false) {
        setShowOnboarding(true);
      }
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.profile?.onboarding_completed]);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsDataLoading(true);
    try {
      const result = await apiClient.get("/dashboard");
      if (result.data && (result.data as any).success) {
        const payload = (result.data as any).data;
        setStats({
          ...payload.stats,
          creditsRemaining: payload.stats.creditsRemaining,
        });
        const activityList = payload.recentActivities.map((act: any) => ({
          ...act,
          timestamp: formatTimestamp(new Date(act.timestamp)),
        }));
        setRecentActivities(activityList);
      }
    } catch (error) {
      console.error("Dashboard data fetch error", error);
    } finally {
      if (!silent) setIsDataLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "resume":
        return <DocumentIcon size={16} />;
      case "portfolio":
        return <PortfolioIcon size={16} />;
      case "ats":
        return <AnalyticsIcon size={16} />;
      case "cover_letter":
        return <MailIcon size={16} />;
      default:
        return <ActivityIcon size={16} />;
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
        {/* Animated Background Vectors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          {/* Top Right Blue Blob */}
          <motion.div
            className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Bottom Left Purple Blob */}
          <motion.div
            className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Center Amber Accent */}
          <motion.div
            className="absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-amber-300/10 rounded-full blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                Here's what's happening with your career profile today.
              </p>
            </div>

            {/* Premium Status Bar */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md border border-white/50 p-2 pr-3 rounded-2xl shadow-lg shadow-blue-500/5 ring-1 ring-black/5">
              <div className="px-4 py-2 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100/50 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Credits
                </span>
                <span className="text-xl font-bold text-blue-600 leading-none mt-0.5">
                  {isDataLoading ? (
                    <span className="text-gray-300 animate-pulse">...</span>
                  ) : (
                    stats.creditsRemaining
                  )}
                </span>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Current Plan
                  </span>
                  <span className="text-sm font-bold text-gray-900 capitalize">
                    {stats.plan.replace("_", " ")}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {stats.plan === "free" && (
                    <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
                      50% Off First Month
                    </span>
                  )}
                  <Button
                    variant="primary"
                    size="small"
                    className="h-8 px-4 text-xs font-bold rounded-xl bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95"
                    onClick={() => setShowPlanModal(true)}
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Stats Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Stats Cards */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Overview
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Resumes",
                      count: stats.resumesCreated,
                      icon: DocumentIcon,
                      href: "/dashboard/resume",
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                      border: "group-hover:border-blue-200",
                    },
                    {
                      label: "Portfolios",
                      count: stats.portfoliosCreated,
                      icon: PortfolioIcon,
                      href: "/dashboard/portfolio",
                      color: "text-purple-600",
                      bg: "bg-purple-50",
                      border: "group-hover:border-purple-200",
                    },
                    {
                      label: "Cover Letters",
                      count: stats.atsScores,
                      icon: MailIcon,
                      href: "/dashboard/cover-letters",
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                      border: "group-hover:border-emerald-200",
                    },
                  ].map((item, i) => (
                    <Link href={item.href} key={i}>
                      <motion.div
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={`group bg-white rounded-2xl p-5 border border-transparent shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden ring-1 ring-gray-100 ${item.border}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`p-3 rounded-xl ${item.bg} ${item.color}`}
                          >
                            <item.icon size={22} />
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 p-1.5 rounded-lg text-gray-400">
                            <ArrowRightIcon size={14} />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {item.count}
                          </p>
                          <p className="text-sm font-medium text-gray-500">
                            {item.label}
                          </p>
                        </div>
                        {/* Decorative gradient blur */}
                        <div
                          className={`absolute -bottom-4 -right-4 w-16 h-16 ${item.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}
                        ></div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1 mb-4">
                  Create New
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Resume",
                      icon: PlusIcon,
                      href: "/dashboard/resume/create",
                      color: "blue",
                    },
                    {
                      title: "Portfolio",
                      icon: PlusIcon,
                      href: "/dashboard/portfolio",
                      color: "purple",
                    },
                    {
                      title: "ATS Check",
                      icon: AnalyticsIcon,
                      href: "/dashboard/ats",
                      color: "orange",
                    },
                    {
                      title: "Add Credits",
                      icon: PlusIcon,
                      onClick: () => setShowPlanModal(true),
                      color: "gray",
                    },
                  ].map((action, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.onClick}
                      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center group ring-1 ring-gray-50"
                    >
                      {action.href ? (
                        <Link
                          href={action.href}
                          className="w-full h-full flex flex-col items-center justify-center gap-3"
                        >
                          <div
                            className={`p-3 rounded-full bg-${action.color}-50 text-${action.color}-500 group-hover:bg-${action.color}-100 transition-colors`}
                          >
                            <action.icon size={20} />
                          </div>
                          <span className="font-semibold text-sm text-gray-700">
                            {action.title}
                          </span>
                        </Link>
                      ) : (
                        <>
                          <div
                            className={`p-3 rounded-full bg-${action.color}-50 text-${action.color}-500 group-hover:bg-${action.color}-100 transition-colors`}
                          >
                            <action.icon size={20} />
                          </div>
                          <span className="font-semibold text-sm text-gray-700">
                            {action.title}
                          </span>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Portfolio Expiration Banner */}
              {stats.portfolioExpiresAt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Portfolio Trial Ending
                      </h3>
                      <p className="text-amber-100 text-sm">
                        Expires{" "}
                        {formatDistanceToNow(
                          new Date(stats.portfolioExpiresAt),
                          { addSuffix: true },
                        )}
                        . Upgrade to stay online.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setShowPlanModal(true)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar: Activity */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900">Recent Activity</h2>
                  <Link
                    href="/dashboard/history"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wide"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                  {isDataLoading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Loading activity...
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((act, i) => (
                      <div key={i} className="relative pl-10 group">
                        <div className="absolute left-[9px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500 z-10 group-hover:scale-110 group-hover:border-blue-600 transition-all shadow-sm"></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {act.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                              {act.action}
                            </span>
                            <span className="text-xs text-gray-400">
                              {act.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <PlanUpgradeModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={stats.plan}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          window.location.reload();
        }}
      />
    </>
  );
};

export default DashboardPage;
