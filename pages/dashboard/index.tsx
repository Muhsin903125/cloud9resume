import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../../components/Button";
import { useAuth } from "../../lib/authUtils";
import {
  DocumentIcon,
  SaveIcon,
  ActivityIcon,
  TemplateIcon,
  PortfolioIcon,
  AIIcon,
  AnalyticsIcon,
  ArrowRightIcon,
} from "../../components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../lib/apiClient";

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string>("User");

  const [stats, setStats] = useState({
    resumesCreated: 0,
    portfoliosCreated: 0,
    atsScores: 0,
    templatesUsed: 8,
    creditsRemaining: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Get display name from user data
  useEffect(() => {
    if (user) {
      const name =
        user.name ||
        user.profile?.first_name ||
        user.email?.split("@")[0] ||
        "User";

      setDisplayName(name);
    }
  }, [user]);

  // Fetch real data
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setIsDataLoading(true);
    try {
      const result = await apiClient.get("/dashboard");

      if (result.data && (result.data as any).success) {
        const payload = (result.data as any).data;
        setStats(payload.stats);

        // Format activities for display
        const activityList = payload.recentActivities.map((act: any) => ({
          ...act,
          timestamp: formatTimestamp(new Date(act.timestamp)),
        }));

        setRecentActivities(activityList);
      } else {
        console.error(
          "Dashboard data fetch failed:",
          result.error || result.message
        );
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const recentActivity = [
    {
      id: 1,
      type: "resume",
      title: "Software Engineer Resume",
      action: "Updated",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "ats",
      title: "Marketing Manager Resume",
      action: "ATS Checked",
      timestamp: "1 day ago",
    },
    {
      id: 3,
      type: "portfolio",
      title: "Design Portfolio",
      action: "Created",
      timestamp: "3 days ago",
    },
  ];

  const quickActions = [
    {
      title: "Create Resume",
      description: "Build a professional resume",
      href: "/dashboard/resume",
      icon: DocumentIcon,
    },
    {
      title: "Build Portfolio",
      description: "Showcase your projects",
      href: "/dashboard/portfolio",
      icon: PortfolioIcon,
    },
    {
      title: "ATS Check",
      description: "Optimize for tracking systems",
      href: "/dashboard/ats",
      icon: AnalyticsIcon,
    },
    {
      title: "Manage Credits",
      description: "View and refill credits",
      href: "/plans",
      icon: DocumentIcon,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "resume":
        return <DocumentIcon size={20} />;
      case "portfolio":
        return <PortfolioIcon size={20} />;
      case "ats":
        return <AnalyticsIcon size={20} />;
      default:
        return <ActivityIcon size={20} />;
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Cloud9Profile</title>
        <meta
          name="description"
          content="Manage your resumes, portfolios, and career tools"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 relative">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                Welcome, {displayName}
              </span>
              <div className="h-4 w-px bg-gray-200 mx-1"></div>
              <Link href="/plans">
                <Button
                  variant="secondary"
                  size="small"
                  className="text-xs py-1.5 h-8"
                >
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
          {/* Credits Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 bg-gray-900 rounded-xl text-white shadow-lg shadow-gray-200/50"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Available Credits
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {isDataLoading ? "..." : stats.creditsRemaining}
                </p>
              </div>
              <Link href="/plans" passHref>
                <Button
                  variant="primary"
                  size="small"
                  className="bg-white text-gray-900 hover:bg-gray-100 text-xs font-medium h-9 px-4 border-0"
                >
                  Buy Credits
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                label: "Resumes",
                value: stats.resumesCreated,
                icon: DocumentIcon,
              },
              {
                label: "Portfolios",
                value: stats.portfoliosCreated,
                icon: PortfolioIcon,
              },
              {
                label: "ATS Scans",
                value: stats.atsScores,
                icon: AnalyticsIcon,
              },
              {
                label: "Templates",
                value: stats.templatesUsed,
                icon: TemplateIcon,
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {isDataLoading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <stat.icon size={20} className="text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Quick Actions
              </h2>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.4,
                    },
                  },
                }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href} passHref>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.95 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <action.icon size={20} />
                        </div>
                        <ArrowRightIcon
                          size={16}
                          className="text-gray-300 group-hover:text-blue-500 transition-colors"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {action.description}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                Recent Activity
              </h2>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full"
              >
                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px]">
                  {isDataLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-xs text-gray-400">
                        Loading activity...
                      </p>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 p-1.5 bg-gray-100 rounded text-gray-500 flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                                {activity.action}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {activity.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      No recent activity found.
                    </div>
                  )}
                </div>
                <Link href="/dashboard/history" passHref>
                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer mt-auto">
                    <p className="text-xs font-medium text-gray-600">
                      View full history
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
