import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Card from "../../components/Card";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";

const HistoryPage: NextPage = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "resume" | "portfolio">("all");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get("/dashboard/history");
      if (res.data && res.data.success && res.data.data) {
        setActivities(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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

  const filteredActivities = activities.filter((act) =>
    filter === "all" ? true : act.type === filter
  );

  const getIcon = (type: string) => {
    return type === "resume" ? "📄" : "🎨";
  };

  return (
    <>
      <Head>
        <title>Activity History - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen font-sans text-gray-900 bg-[#F8FAFC]">
        <header className="bg-white border-b border-gray-200 sticky top-top z-30">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              Activity History
            </h1>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {(["all", "resume", "portfolio"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    filter === f
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {f}s
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <Card
                    key={activity.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                        {getIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {activity.title || "Untitled"}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {activity.action} •{" "}
                          <span className="capitalize">{activity.type}</span>
                          {activity.status && (
                            <span
                              className={`ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                activity.status === "Active" ||
                                activity.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {activity.status}
                            </span>
                          )}
                          {activity.type === "portfolio" &&
                            typeof activity.views === "number" && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                {activity.views}
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                  <p className="text-gray-500">No activities found.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default HistoryPage;
