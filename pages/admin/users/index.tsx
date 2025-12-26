import { NextPage } from "next";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../../../layouts/AdminLayout";
import { apiClient } from "../../../lib/apiClient";
import Button from "../../../components/Button";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name?: string;
  plan: string;
  credits: number;
  created_at: string;
  is_active: boolean;
}

const AdminUsers: NextPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      search,
    });

    const res = await apiClient.get(`/admin/users?${query.toString()}`);
    if (res.data) {
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.total);
    }
    setLoading(false);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <AdminLayout title="User Management">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-72">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-8 pr-3 py-1.5 w-full rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-500">
            Total: <span className="font-bold text-gray-900">{totalUsers}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">User Profile</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Credits</th>
                <th className="px-3 py-2">Joined</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-xs text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading profiles...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-xs text-gray-500"
                  >
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-gray-900">
                            {user.name || "Unknown Name"}
                          </div>
                          <div className="text-[10px] text-gray-500 leading-none">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${
                          user.plan === "enterprise"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : user.plan === "pro"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : user.plan === "starter"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[10px] text-gray-500 tabular-nums">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50 opacity-0 group-hover:opacity-100">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-2 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeftIcon className="w-3 h-3" /> Prev
          </button>
          <span className="text-xs text-gray-500 font-medium">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Next <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
