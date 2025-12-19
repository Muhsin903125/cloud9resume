import React from "react";
import { useRouter } from "next/router";
import { EditIcon, EyeIcon, CopyIcon, DeleteIcon, DocumentIcon } from "./Icons";
// import { formatDistanceToNow } from "date-fns"; // You might need to install date-fns or use native Intl

// Simple date formatter if date-fns is not available
const timeAgo = (dateInfo: string) => {
  if (!dateInfo) return "";
  const date = new Date(dateInfo);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface ResumeCardProps {
  resume: any;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPreview: (resume: any) => void;
}

import { motion } from "framer-motion";

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onDelete,
  onDuplicate,
  onPreview,
}) => {
  const router = useRouter();

  const handleEdit = () => router.push(`/dashboard/resume/${resume.id}/edit`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-64 flex flex-col"
      onClick={handleEdit}
    >
      {/* Minimal Preview Area */}
      <div className="h-full bg-slate-50 relative flex items-center justify-center overflow-hidden">
        {/* Abstract "Doc" Representation */}
        <div className="w-32 h-44 bg-white shadow-lg rounded-md transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500 border border-gray-200 flex flex-col p-2 gap-2 opacity-80 group-hover:opacity-100">
          {/* Skeleton Lines */}
          <div className="w-12 h-2 bg-slate-200 rounded-full mb-2"></div>
          <div className="w-full h-1 bg-slate-100 rounded-full"></div>
          <div className="w-5/6 h-1 bg-slate-100 rounded-full"></div>
          <div className="w-full h-1 bg-slate-100 rounded-full"></div>

          <div className="mt-4 w-8 h-2 bg-slate-200 rounded-full"></div>
          <div className="w-full h-1 bg-slate-100 rounded-full"></div>
          <div className="w-4/6 h-1 bg-slate-100 rounded-full"></div>
        </div>

        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(resume);
            }}
            className="p-3 bg-white text-slate-800 rounded-full shadow-lg hover:text-blue-600 hover:scale-110 transition-all active:scale-95"
            title="Preview"
          >
            <EyeIcon size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resume.id);
            }}
            className="p-3 bg-white text-red-500 rounded-full shadow-lg hover:text-red-600 hover:scale-110 transition-all active:scale-95"
            title="Delete"
          >
            <DeleteIcon size={20} />
          </button>
        </div>
      </div>

      {/* Minimal Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t border-gray-50 flex justify-between items-center z-10">
        <div>
          <h3 className="font-bold text-gray-800 text-sm truncate max-w-[150px]">
            {resume.title || "Untitled"}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            Last edited {timeAgo(resume.updated_at)}
          </p>
        </div>
        {resume.is_primary && (
          <div
            className="h-2 w-2 rounded-full bg-blue-500"
            title="Primary Resume"
          ></div>
        )}
      </div>
    </motion.div>
  );
};
