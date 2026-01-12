import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { USER_AUTH_TOKEN_KEY } from "@/lib/token-keys";
import PlanUpgradeModal from "../PlanUpgradeModal";

interface ResumeUploaderProps {
  onUploadSuccess: (data: any, resumeId: string) => void;
  onCancel?: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onUploadSuccess,
  onCancel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "parsing" | "analyzing" | "completed" | "error"
  >("idle");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/png",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Format not supported. Please upload PDF, DOCX, or Image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("File is too large. Max size is 5MB.");
      return;
    }

    setFile(file);
    handleUpload(file);
  };

  const handleUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setStatus("uploading");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + (prev < 30 ? 5 : prev < 60 ? 2 : 1);
        });
      }, 500);

      setTimeout(() => setStatus("parsing"), 2000);
      setTimeout(() => setStatus("analyzing"), 4000);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(USER_AUTH_TOKEN_KEY)
          : null;

      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setProgress(100);
      setStatus("completed");
      toast.success("Resume parsed successfully!");

      setTimeout(() => {
        // We assume the API returns { success: true, data: parsedData, resumeId: "..." }
        // If resumeId is not returned, we pass a placeholder or handle it in parent
        onUploadSuccess(result.data, result.resumeId || "new");
      }, 500);
    } catch (error: any) {
      console.error("Upload failed", error);
      setStatus("error");
      setIsUploading(false);
      setProgress(0);
      setFile(null);
      toast.error(error.message || "Failed to parse resume.");

      if (
        error?.status === 402 ||
        error?.status === 403 ||
        error?.message?.includes("credits")
      ) {
        setShowUpgradeModal(true);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {status === "idle" || status === "error" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              relative border-2 border-dashed rounded-2xl p-4 md:p-8 text-center transition-all cursor-pointer
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.jpg,.png"
              onChange={handleFileSelect}
            />

            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudArrowUpIcon className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Import your Resume
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Drag & drop your PDF, DOCX or Image here to auto-fill your profile
              using AI.
            </p>

            <div className="text-xs text-gray-400 font-medium">
              Cost: 5 Credits • Max 5MB
            </div>

            {onCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-blue-100 rounded-2xl p-8 text-center shadow-sm"
          >
            <div className="mb-6">
              {status === "completed" ? (
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {status === "uploading" && "Uploading resume..."}
              {status === "parsing" && "Extracting text..."}
              {status === "analyzing" && "AI processing..."}
              {status === "completed" && "Import Successful!"}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              {status === "completed"
                ? "Your resume has been converted to our format."
                : "Please wait while we magically extract your data."}
            </p>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <motion.div
                className={`h-full ${
                  status === "completed" ? "bg-green-500" : "bg-blue-600"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
              <span>{Math.round(progress)}%</span>
              <span>{status === "analyzing" ? "Almost there..." : ""}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan="free"
        errorMessage="You've reached your credit limit or plan constraints for AI resume parsing. Upgrade to a pro plan to increase your limits and unlock high-accuracy AI extraction."
      />
    </div>
  );
};
