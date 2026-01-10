import React, { useState, useRef } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface SectionImageUploaderProps {
  sectionType: string;
  itemIndex?: number;
  portfolioId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const SECTION_IMAGE_LIMITS: Record<string, number> = {
  projects: 4,
  experience: 2,
  achievements: 1,
  personal_info: 1,
};

export const SectionImageUploader: React.FC<SectionImageUploaderProps> = ({
  sectionType,
  itemIndex = 0,
  portfolioId,
  images,
  onImagesChange,
  maxImages,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = maxImages || SECTION_IMAGE_LIMITS[sectionType] || 2;
  const canUpload = images.length < limit && !disabled;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = limit - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error(`Maximum ${limit} images allowed for this section`);
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("portfolioId", portfolioId);
        formData.append("sectionType", sectionType);
        formData.append("itemIndex", String(itemIndex));

        const response = await fetch("/api/portfolio/upload-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.data?.url) {
          uploadedUrls.push(result.data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={url}
                alt={`${sectionType} image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => window.open(url, "_blank")}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="w-8 h-8 bg-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              </div>
              {/* Index badge */}
              <div className="absolute top-1 left-1 w-5 h-5 bg-black/50 rounded text-white text-xs flex items-center justify-center">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUpload && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          } ${uploading ? "opacity-50 cursor-wait" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={limit - images.length > 1}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {dragOver ? (
                  <ArrowUpTrayIcon className="w-5 h-5 text-blue-500" />
                ) : (
                  <PhotoIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {dragOver ? "Drop images here" : "Add images"}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {images.length}/{limit} • Drag & drop or click
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Limit reached message */}
      {!canUpload && images.length >= limit && (
        <p className="text-xs text-gray-400 text-center">
          Maximum {limit} image{limit > 1 ? "s" : ""} reached
        </p>
      )}
    </div>
  );
};

export default SectionImageUploader;
