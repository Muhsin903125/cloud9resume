import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAPIAuth } from "../../../hooks/useAPIAuth";
import { CoverLetter } from "../../../lib/types";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function EditCoverLetter() {
  const router = useRouter();
  const { id } = router.query;
  const { get, patch } = useAPIAuth();

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [tab, setTab] = useState<"full" | "short">("full");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentShort, setContentShort] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (id) fetchLetter();
  }, [id]);

  const fetchLetter = async () => {
    try {
      setLoading(true);
      const response = await get<CoverLetter>(`/api/cover-letters/${id}`);
      if (response.success && response.data) {
        setLetter(response.data);
        setTitle(response.data.title);
        setContent(response.data.content);
        setContentShort(response.data.content_short || "");
        setJobTitle(response.data.job_title || "");
        setCompanyName(response.data.company_name || "");
      } else {
        toast.error("Failed to load cover letter");
        router.push("/dashboard/cover-letters");
      }
    } catch (err) {
      toast.error("Failed to load");
      router.push("/dashboard/cover-letters");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const response = await patch<CoverLetter>(`/api/cover-letters/${id}`, {
        title,
        content,
        content_short: contentShort,
        job_title: jobTitle,
        company_name: companyName,
      });

      if (response.success) {
        toast.success("Saved successfully");
      } else {
        toast.error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tab === "full" ? content : contentShort);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Simple print for now
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!letter) return null;

  return (
    <>
      <Head>
        <title>{title || "Cover Letter"} - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 z-20 print:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/cover-letters"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold text-gray-900 border-none focus:ring-0 focus:outline-none bg-transparent placeholder-gray-400 w-64 md:w-96"
                placeholder="Untitled Letter"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Copy content"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ClipboardIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download/Print"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-gray-200 mx-2" />

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Metadata Inputs */}
            <div className="grid grid-cols-2 gap-4 print:hidden">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                  Company
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                  Role
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Main Content (A4 Aspect Ratio container for visual cue) */}
            <div className="bg-white shadow-sm border border-gray-200 min-h-[800px] p-8 print:shadow-none print:border-none print:p-0 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 mb-4 print:hidden">
                <button
                  onClick={() => setTab("full")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "full"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Full Letter
                </button>
                <button
                  onClick={() => setTab("short")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "short"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Short Version (LinkedIn/Email)
                </button>
              </div>

              <textarea
                value={tab === "full" ? content : contentShort}
                onChange={(e) =>
                  tab === "full"
                    ? setContent(e.target.value)
                    : setContentShort(e.target.value)
                }
                className="w-full flex-1 text-gray-800 text-base leading-relaxed resize-none focus:outline-none placeholder-gray-300 font-serif print:hidden"
                placeholder={
                  tab === "full"
                    ? "Start writing your cover letter..."
                    : "Write a short message for LinkedIn or Email..."
                }
              />
              {/* Print-only view (Always print full for now as standard) */}
              <div
                className="hidden print:block whitespace-pre-wrap text-black leading-relaxed"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: "12pt",
                }}
              >
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
