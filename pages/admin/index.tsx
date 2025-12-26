import { NextPage } from "next";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { apiClient } from "../../lib/apiClient";
import {
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  CreditCardIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalUsers: number;
  activeSubs: number;
  proUsers: number;
  revenue: number;
  lastUpdated: string;
}

const AdminDashboard: NextPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiClient.get("/admin/stats");
    if (res.error) {
      setError(res.error);
    } else {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "TOAL USERS",
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: "text-blue-600",
      bgLight: "bg-blue-50",
      trend: "+12%", // Placeholder
    },
    {
      title: "PRO SUBSCRIBERS",
      value: stats?.proUsers || 0,
      icon: StarIcon,
      color: "text-purple-600",
      bgLight: "bg-purple-50",
      trend: "+5%", // Placeholder
    },
    {
      title: "ACTIVE SUBSCRIPTIONS",
      value: stats?.activeSubs || 0,
      icon: CreditCardIcon,
      color: "text-indigo-600",
      bgLight: "bg-indigo-50",
      trend: "+2%", // Placeholder
    },
    {
      title: "ESTIMATED REVENUE",
      value: `$${stats?.revenue || 0}`,
      icon: CurrencyDollarIcon,
      color: "text-green-600",
      bgLight: "bg-green-50",
      trend: "+8%", // Placeholder
    },
  ];

  if (loading) return <AdminLayout title="Dashboard">Loading...</AdminLayout>;

  return (
    <AdminLayout title="Dashboard">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-xs font-medium border border-red-100">
          Error: {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex justify-between items-start mb-2">
              <div
                className={`p-2 rounded-md ${stat.bgLight} group-hover:scale-105 transition-transform`}
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                {stat.title}
              </p>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
          Quick Actions
        </h2>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium shadow-sm shadow-blue-200 transition-colors">
            Create User
          </button>
          <button className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium shadow-sm shadow-purple-200 transition-colors">
            Create Coupon
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50 text-xs font-medium transition-colors hover:text-slate-800">
            Export Reports
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
