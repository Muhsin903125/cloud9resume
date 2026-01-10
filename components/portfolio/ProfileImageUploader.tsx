import { useState, useRef } from "react";
import { toast } from "react-hot-toast";

interface ProfileImageUploaderProps {
  imageUrl: string | null;
  onImageChange: (url: string) => void;
  disabled?: boolean;
  portfolioId: string;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  imageUrl,
  onImageChange,
  disabled = false,
  portfolioId,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("portfolioId", portfolioId);
      formData.append("sectionType", "profile");

      const token = localStorage.getItem("x_user_auth_token");
      const res = await fetch("/api/portfolio/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        onImageChange(data.data.url);
        toast.success("Profile image uploaded!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
      setPreview(imageUrl); // Revert preview
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <button
        onClick={handleClick}
        disabled={disabled || uploading}
        className={`relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed transition-all ${
          uploading
            ? "border-blue-300 cursor-wait"
            : preview
            ? "border-transparent hover:border-blue-400"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
            <svg
              className="w-8 h-8 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-[10px] font-medium">Add Photo</span>
          </div>
        )}

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </button>

      <p className="text-[10px] text-gray-500 mt-2">Profile Photo</p>
    </div>
  );
};
