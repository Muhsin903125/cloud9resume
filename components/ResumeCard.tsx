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

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onDelete,
  onDuplicate,
  onPreview,
}) => {
  const router = useRouter();

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Visual Preview / Thumbnail Area */}
      <div
        className="h-40 bg-gray-50 border-b border-gray-100 relative group-hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
        onClick={() => router.push(`/dashboard/resume/${resume.id}/edit`)}
      >
        <div className="text-gray-300 group-hover:text-gray-400 transition-colors transform group-hover:scale-110 duration-200">
          <DocumentIcon size={48} />
        </div>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(resume);
            }}
            className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:text-blue-600 hover:scale-110 transition-all transform"
            title="Preview"
          >
            <EyeIcon size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/resume/${resume.id}/edit`);
            }}
            className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:text-blue-600 hover:scale-110 transition-all transform"
            title="Edit"
          >
            <EditIcon size={18} />
          </button>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 cursor-pointer"
            onClick={() => router.push(`/dashboard/resume/${resume.id}/edit`)}
          >
            {resume.title || "Untitled Resume"}
          </h3>
          {resume.is_primary && (
            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full tracking-wide">
              Primary
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
          {resume.job_title || "No job title specified"}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
          <span>Edited {timeAgo(resume.updated_at)}</span>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(resume.id);
              }}
              className="hover:text-gray-700 transition-colors"
              title="Duplicate"
            >
              <CopyIcon size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resume.id);
              }}
              className="hover:text-red-600 transition-colors"
              title="Delete"
            >
              <DeleteIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
