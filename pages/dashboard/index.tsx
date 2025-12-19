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

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string>("User");

  const [stats] = useState({
    resumesCreated: 3,
    portfoliosCreated: 1,
    atsScores: 5,
    creditsRemaining: 75,
  });

  // Get display name from user data
  useEffect(() => {
    if (user) {
      // Try to get name in order of preference:
      // 1. user.name (from Google OAuth)
      // 2. user.profile?.first_name (from email auth)
      // 3. Extract from email
      // 4. Default to 'User'
      const name =
        user.name ||
        user.profile?.first_name ||
        user.email?.split("@")[0] ||
        "User";

      setDisplayName(name);
    }
  }, [user]);

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
          <div className="mb-8 p-6 bg-gray-900 rounded-xl text-white shadow-lg shadow-gray-200/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Available Credits
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {user?.profile?.credits || stats.creditsRemaining}
                </p>
              </div>
              <Link href="/plans">
                <Button
                  variant="primary"
                  size="small"
                  className="bg-white text-gray-900 hover:bg-gray-100 text-xs font-medium h-9 px-4 border-0"
                >
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Resumes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.resumesCreated}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <DocumentIcon size={20} className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Portfolios
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.portfoliosCreated}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <PortfolioIcon size={20} className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    ATS Scans
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.atsScores}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <AnalyticsIcon size={20} className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Templates
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <TemplateIcon size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer h-full">
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
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                Recent Activity
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
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
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/history">
                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-gray-600">
                      View full history
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
