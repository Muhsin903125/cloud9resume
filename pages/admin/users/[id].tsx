import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../layouts/AdminLayout";
import { apiClient } from "../../../lib/apiClient";
import Button from "../../../components/Button";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  SignalIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

interface UserDetail {
  id: string;
  email: string;
  name?: string;
  plan: string;
  credits: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_admin: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  credits_used: number;
  description: string;
  created_at: string;
}

const UserDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState({ resumes: 0, portfolios: 0 });
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    const res = await apiClient.get(`/admin/users/${id}`);
    if (res.data) {
      setUser(res.data.profile);
      setStats(res.data.stats);
      setActivity(res.data.activity);
    }
    setLoading(false);
  };

  const handleUpdate = async (updates: Partial<UserDetail>) => {
    if (!confirm("Are you sure you want to make this change?")) return;

    setUpdating(true);
    const res = await apiClient.put(`/admin/users/${id}`, updates);
    if (!res.error) {
      // Refresh local state or just update partial
      setUser({ ...user!, ...updates });
      alert("User updated successfully");
    } else {
      alert("Failed to update user: " + res.error);
    }
    setUpdating(false);
  };

  if (loading)
    return <AdminLayout title="User Details">Loading...</AdminLayout>;
  if (!user)
    return <AdminLayout title="User Not Found">User not found</AdminLayout>;

  return (
    <AdminLayout title="User Details">
      <Link href="/admin/users">
        <div className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 mb-4 cursor-pointer w-fit transition-colors group">
          <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-medium">Back to Users</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500 border border-slate-200">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {user.name || "No Name"}
                  </h2>
                  <p className="text-xs text-gray-500 mb-1.5 font-mono">
                    {user.email}
                  </p>
                  <div className="flex gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                      {user.id}
                    </span>
                    {user.is_admin && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-bold border border-red-100">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  user.is_active
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Current Plan
                </label>
                <div className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-1.5">
                  <CreditCardIcon className="w-4 h-4 text-blue-500" />
                  {user.plan}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Available Credits
                </label>
                <div className="text-sm font-semibold text-gray-900 font-mono flex items-center gap-1.5">
                  <SignalIcon className="w-4 h-4 text-purple-500" />
                  {user.credits}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Resumes Created
                </label>
                <div className="text-sm font-semibold text-gray-900">
                  {stats.resumes}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Portfolios Created
                </label>
                <div className="text-sm font-semibold text-gray-900">
                  {stats.portfolios}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.plan !== "professional" && (
                  <Button
                    size="small"
                    className="!text-xs !py-1.5"
                    onClick={() => handleUpdate({ plan: "professional" })}
                    disabled={updating}
                  >
                    Upgrade to Pro
                  </Button>
                )}
                {user.plan !== "enterprise" && (
                  <Button
                    size="small"
                    variant="secondary"
                    className="!text-xs !py-1.5"
                    onClick={() => handleUpdate({ plan: "enterprise" })}
                    disabled={updating}
                  >
                    Upgrade to Enterprise
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outline"
                  className="!text-xs !py-1.5"
                  onClick={() => handleUpdate({ is_active: !user.is_active })}
                  disabled={updating}
                >
                  {user.is_active ? "Deactivate Account" : "Activate Account"}
                </Button>

                <div className="ml-auto w-full md:w-auto mt-2 md:mt-0 flex gap-1.5 items-center">
                  <input
                    type="number"
                    placeholder="Credits"
                    className="border border-slate-300 rounded px-2 py-1 text-xs w-20 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    id="creditInput"
                  />
                  <Button
                    size="small"
                    variant="secondary"
                    className="!text-xs !py-1.5"
                    onClick={() => {
                      const val = (
                        document.getElementById(
                          "creditInput",
                        ) as HTMLInputElement
                      ).value;
                      if (val)
                        handleUpdate({ credits: user.credits + parseInt(val) });
                    }}
                    disabled={updating}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-4 h-full max-h-[500px] overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5 uppercase tracking-wide sticky top-0 bg-white pb-2 border-b border-slate-50">
              <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
              Activity History
            </h3>
            <div className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-gray-400 text-xs italic">
                  No recent activity found.
                </p>
              ) : (
                activity.map((log) => (
                  <div
                    key={log.id}
                    className="text-xs border-l-2 border-slate-100 pl-3 py-0.5 hover:border-blue-400 transition-colors"
                  >
                    <div className="font-medium text-gray-700">
                      {log.description || log.action}
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          log.credits_used > 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {log.credits_used > 0
                          ? `-${log.credits_used}`
                          : `+${Math.abs(log.credits_used)}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetailsPage;
