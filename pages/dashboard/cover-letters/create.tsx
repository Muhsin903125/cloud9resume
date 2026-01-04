import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAPIAuth } from "../../../hooks/useAPIAuth";
import { Resume, CoverLetter } from "../../../lib/types";
import {
  ArrowLeftIcon,
  SparklesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CreateCoverLetter() {
  const router = useRouter();
  const { get, post } = useAPIAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await get<Resume[]>("/api/resumes");
      if (response.success && response.data) {
        setResumes(response.data);
        // Auto-select primary or first
        const primary = response.data.find((r) => r.is_primary);
        if (primary) setSelectedResumeId(primary.id);
        else if (response.data.length > 0)
          setSelectedResumeId(response.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume");
      return;
    }
    if (!jobDescription) {
      toast.error("Please paste the job description");
      return;
    }

    try {
      setGenerating(true);

      const resume = resumes.find((r) => r.id === selectedResumeId);
      // We need resume text. For now, we assume the API handles fetching it using ID,
      // OR we fetch it here. The geneate API I wrote expects `resumeText`.
      // Getting resume text from here is hard because `resumes` list might not have full content.
      // Reviewing API: generate-cover-letter.ts expects `resumeText`.
      // Reviewing API: resumes/index.ts returns sections.
      // I should modify generate-cover-letter.ts to accept `resumeId` OR fetch full resume here.
      // Fetching full resume content involves parsing the sections.

      // Let's refactor: I will pass resumeId to the generation API, and let the API fetch the text.
      // BUT, my generation API currently expects text.
      // Let's fetch the resume detail first.

      const resumeDetailRes = await get<Resume>(
        `/api/resumes/${selectedResumeId}`
      );
      if (!resumeDetailRes.success || !resumeDetailRes.data) {
        throw new Error("Failed to fetch resume details");
      }

      // Construct approximate text from sections
      // Construct text using helper
      const sections = resumeDetailRes.data.sections || [];
      const resumeText = formatResumeToText(sections);

      console.log("Extracted Resume Text Length:", resumeText.length);

      const payload = {
        resumeText: resumeText || "Resume content placeholder",
        jobDescription,
        companyName,
        jobTitle,
      };

      const aiRes = await post<any>("/api/ai/generate-cover-letter", payload);

      if (!aiRes.success) {
        if (aiRes.error?.includes("credits")) {
          toast.error("Insufficient credits");
        } else {
          toast.error(aiRes.error || "Generation failed");
        }
        return;
      }

      // Parse AI response (it might be object { full, short } or just string if fallback)
      let fullContent = "";
      let shortContent = "";

      if (typeof aiRes.data === "string") {
        fullContent = aiRes.data;
      } else if (typeof aiRes.data === "object") {
        fullContent = aiRes.data.full || "";
        shortContent = aiRes.data.short || "";
      }

      // Create the cover letter record
      const createRes = await post<CoverLetter>("/api/cover-letters", {
        title: `${jobTitle || "Cover Letter"} - ${companyName || "Draft"}`,
        content: fullContent,
        content_short: shortContent,
        resume_id: selectedResumeId,
        job_description: jobDescription,
        company_name: companyName,
        job_title: jobTitle,
      });

      if (createRes.success && createRes.data) {
        toast.success("Cover letter generated!");
        router.push(`/dashboard/cover-letters/${createRes.data.id}`);
      } else {
        toast.error("Failed to save cover letter");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to format resume sections into text for AI
  function formatResumeToText(sections: any[]) {
    if (!sections || !Array.isArray(sections)) return "";

    const sorted = [...sections].sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    );
    let text = "";

    // Extract Personal Info if present
    const personal = sorted.find((s) => s.section_type === "personal_info");
    if (personal?.section_data) {
      const p = personal.section_data;
      text += `Name: ${p.fullName || p.name || ""}\n`;
      if (p.email) text += `Email: ${p.email}\n`;
      if (p.phone) text += `Phone: ${p.phone}\n`;
      if (p.linkedin) text += `LinkedIn: ${p.linkedin}\n`;
      text += "\n";
    }

    for (const section of sorted) {
      if (section.section_type === "personal_info") continue;
      if (section.section_type === "declaration") continue;

      // Section Title
      text += `\n--- ${
        section.title || section.section_type.replace(/_/g, " ").toUpperCase()
      } ---\n`;

      const data = section.section_data;
      if (!data) continue;

      // Handle different data structures
      if (typeof data === "string") {
        text += data + "\n";
      } else if (data.text) {
        // Summary object often has .text
        text += data.text + "\n";
      } else if (Array.isArray(data) || Array.isArray(data.items)) {
        // List based sections (Experience, Education, etc)
        const items = Array.isArray(data) ? data : data.items || [];
        for (const item of items) {
          const title =
            item.title ||
            item.position ||
            item.degree ||
            item.school ||
            item.institution ||
            item.language ||
            "";
          const subtitle = item.company || item.issuer || item.location || "";
          const date = item.startDate
            ? `${item.startDate} - ${item.endDate || "Present"}`
            : item.date || item.graduationDate || "";

          if (title) text += `${title}`;
          if (subtitle) text += ` at ${subtitle}`;
          if (date) text += ` (${date})`;
          text += "\n";

          if (item.description) text += `${item.description}\n`;
          if (item.points && Array.isArray(item.points)) {
            text += item.points.map((p: string) => `- ${p}`).join("\n") + "\n";
          }
          text += "\n";
        }
      } else if (typeof data === "object") {
        // Skills map (category: [skills])
        Object.entries(data).forEach(([key, val]) => {
          if (key === "items") return;
          if (Array.isArray(val)) {
            const skills = val
              .map((v: any) => (typeof v === "string" ? v : v.name || v))
              .join(", ");
            text += `${key}: ${skills}\n`;
          }
        });
      }
    }
    return text;
  }

  const handleCreateBlank = async () => {
    try {
      setGenerating(true);
      const createRes = await post<CoverLetter>("/api/cover-letters", {
        title: "Untitled Cover Letter",
        content: "",
        resume_id: selectedResumeId || undefined,
      });

      if (createRes.success && createRes.data) {
        router.push(`/dashboard/cover-letters/${createRes.data.id}`);
      } else {
        toast.error("Failed to create");
      }
    } catch (err) {
      toast.error("Failed to create");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Cover Letter - Cloud9Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard/cover-letters"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Create Cover Letter
              </h1>
              <p className="text-sm text-gray-600">
                Let AI craft a tailored cover letter based on your resume and
                the job description.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Resume Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume
                </label>
                {loading ? (
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  >
                    <option value="">-- Select a Resume --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} {r.is_primary && "(Primary)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y text-sm"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
                    {jobDescription.length} chars
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !selectedResumeId || !jobDescription}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                  {generating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Generate with AI{" "}
                      <span className="text-blue-200 text-xs ml-1">
                        (5 Credits)
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCreateBlank}
                  disabled={generating}
                  className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  Start Blank
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
