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
        <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 cursor-pointer w-fit">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Users</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user.name || "No Name"}
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                      ID: {user.id}
                    </span>
                    {user.is_admin && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600 font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Current Plan
                </label>
                <div className="text-lg font-medium text-gray-900 capitalize flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-gray-400" />
                  {user.plan}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Available Credits
                </label>
                <div className="text-lg font-medium text-gray-900 font-mono flex items-center gap-2">
                  <SignalIcon className="w-5 h-5 text-gray-400" />
                  {user.credits}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Resumes Created
                </label>
                <div className="text-lg font-medium text-gray-900">
                  {stats.resumes}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Portfolios Created
                </label>
                <div className="text-lg font-medium text-gray-900">
                  {stats.portfolios}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {user.plan !== "pro" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdate({ plan: "pro" })}
                    disabled={updating}
                  >
                    Upgrade to Pro
                  </Button>
                )}
                {user.plan !== "enterprise" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUpdate({ plan: "enterprise" })}
                    disabled={updating}
                  >
                    Upgrade to Enterprise
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdate({ is_active: !user.is_active })}
                  disabled={updating}
                >
                  {user.is_active ? "Deactivate Account" : "Activate Account"}
                </Button>

                <div className="ml-auto w-full md:w-auto mt-4 md:mt-0 flex gap-2">
                  <input
                    type="number"
                    placeholder="Add credits"
                    className="border rounded px-2 py-1 text-sm w-24"
                    id="creditInput"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const val = (
                        document.getElementById(
                          "creditInput"
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
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full max-h-[600px] overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
              Activity History
            </h3>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent activity.</p>
              ) : (
                activity.map((log) => (
                  <div
                    key={log.id}
                    className="text-sm border-l-2 border-slate-200 pl-3 py-1"
                  >
                    <div className="font-medium text-gray-800">
                      {log.description || log.action}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
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
