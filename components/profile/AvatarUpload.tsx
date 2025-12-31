import { useState, useRef } from "react";
import { toast } from "react-hot-toast";

interface AvatarUploadProps {
  currentAvatarUrl: string;
  name: string;
  onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  name,
  onUploadSuccess,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("x_user_auth_token");
      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Avatar updated successfully");
        onUploadSuccess(data.data.avatar_url);
        // Refresh page to ensure global state updates if needed, though callback is usually enough
        // local storage update will be handled by parent or here
        localStorage.setItem("user_picture", data.data.avatar_url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative group">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (
                  e.target as HTMLImageElement
                ).src = `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          {/* Overlay loading/hover */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${
              uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-white"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            )}
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="text-center sm:text-left pt-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {uploading ? "Uploading..." : "Change profile photo"}
        </button>
        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
          JPG, GIF or PNG. Max size of 5MB.
        </p>
      </div>
    </div>
  );
}
