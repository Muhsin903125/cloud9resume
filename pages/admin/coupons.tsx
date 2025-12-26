import { NextPage } from "next";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { apiClient } from "../../lib/apiClient";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { TicketIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  expiry_date?: string;
  is_active: boolean;
  user_limit: number;
}

const AdminCoupons: NextPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    user_limit: "1",
    expiry_date: "",
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await apiClient.get("/admin/coupons");
    if (res.data) {
      setCoupons(res.data.coupons);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      user_limit: parseInt(formData.user_limit),
      plan_limit: ["pro", "pro_plus", "enterprise"], // Default to all paid plans
    };

    const res = await apiClient.post("/admin/coupons", payload);

    if (res.error) {
      alert(res.error);
    } else {
      setShowModal(false);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        max_uses: "",
        user_limit: "1",
        expiry_date: "",
      });
      fetchCoupons();
    }
    setFormLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${
          currentStatus ? "deactivate" : "activate"
        } this coupon?`
      )
    )
      return;

    const res = await apiClient.put(`/admin/coupons/${id}`, {
      is_active: !currentStatus,
    });
    if (!res.error) {
      setCoupons(
        coupons.map((c) =>
          c.id === id ? { ...c, is_active: !currentStatus } : c
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon permanently?")) return;
    const res = await apiClient.delete(`/admin/coupons/${id}`);
    if (!res.error) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  return (
    <AdminLayout title="Coupon Management">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="text-sm text-gray-500">
            Manage discount codes and promotions.
          </div>
          <Button onClick={() => setShowModal(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Coupon
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {coupon.current_uses} / {coupon.max_uses || "∞"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          coupon.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {coupon.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {coupon.expiry_date
                        ? new Date(coupon.expiry_date).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() =>
                          toggleStatus(coupon.id, coupon.is_active)
                        }
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {coupon.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Coupon"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Coupon Code">
            <input
              required
              type="text"
              className="w-full border rounded-lg p-2 uppercase font-mono"
              placeholder="SUMMER25"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <select
                className="w-full border rounded-lg p-2"
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({ ...formData, discount_type: e.target.value })
                }
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </FormField>
            <FormField label="Value">
              <input
                required
                type="number"
                className="w-full border rounded-lg p-2"
                placeholder={
                  formData.discount_type === "percentage" ? "20" : "10"
                }
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Max Uses (Total)">
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                placeholder="Unlimited"
                value={formData.max_uses}
                onChange={(e) =>
                  setFormData({ ...formData, max_uses: e.target.value })
                }
              />
            </FormField>
            <FormField label="Uses Per User">
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={formData.user_limit}
                onChange={(e) =>
                  setFormData({ ...formData, user_limit: e.target.value })
                }
              />
            </FormField>
          </div>

          <FormField label="Expiry Date">
            <input
              type="date"
              className="w-full border rounded-lg p-2"
              value={formData.expiry_date}
              onChange={(e) =>
                setFormData({ ...formData, expiry_date: e.target.value })
              }
            />
          </FormField>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminCoupons;
