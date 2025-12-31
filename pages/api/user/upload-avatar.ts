import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    return decoded?.sub || decoded?.userId || null;
  } catch {
    return null;
  }
}

// Parse multipart form data
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        // Only allow images
        return mimetype?.startsWith("image/") || false;
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Parse the uploaded file
    const { files } = await parseForm(req);
    const uploadedFile = files.avatar || files.file;

    if (!uploadedFile) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    // Handle array or single file
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!file.mimetype?.startsWith("image/")) {
      return res
        .status(400)
        .json({ success: false, error: "Only image files are allowed" });
    }

    // Read file content
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileExt =
      path.extname(file.originalFilename || "").toLowerCase() || ".jpg";
    const fileName = `${userId}/avatar${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error("[Avatar Upload] Storage error:", uploadError);

      // If bucket doesn't exist, try to create it
      if (uploadError.message?.includes("not found")) {
        return res.status(500).json({
          success: false,
          error:
            "Storage bucket 'avatars' not found. Please create it in Supabase dashboard.",
        });
      }

      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update user profile with avatar URL
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[Avatar Upload] Profile update error:", updateError);
      throw updateError;
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      data: {
        avatar_url: avatarUrl,
      },
      message: "Avatar uploaded successfully",
    });
  } catch (error: any) {
    console.error("[Avatar Upload] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to upload avatar",
    });
  }
}
