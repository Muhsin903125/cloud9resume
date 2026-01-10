import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/backend/supabaseClient";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;
    return decoded.sub || decoded.userId || null;
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = extractUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);

    const portfolioId = Array.isArray(fields.portfolioId)
      ? fields.portfolioId[0]
      : fields.portfolioId;
    const sectionType = Array.isArray(fields.sectionType)
      ? fields.sectionType[0]
      : fields.sectionType;
    const itemIndex = Array.isArray(fields.itemIndex)
      ? fields.itemIndex[0]
      : fields.itemIndex;

    if (!portfolioId || !sectionType) {
      return res.status(400).json({
        success: false,
        error: "Portfolio ID and section type are required",
      });
    }

    // Verify portfolio ownership (skip if it's a new portfolio being created)
    if (portfolioId !== "new") {
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .select("id, user_id")
        .eq("id", portfolioId)
        .eq("user_id", userId)
        .single();

      if (portfolioError || !portfolio) {
        return res.status(404).json({
          success: false,
          error: "Portfolio not found or access denied",
        });
      }
    }

    // Get the uploaded file
    const uploadedFiles = files.image || files.file;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const file = uploadedFiles[0];
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileExt = path.extname(file.originalFilename || "image.jpg");
    const fileName = `${userId}/${portfolioId}/${sectionType}_${
      itemIndex || "0"
    }_${Date.now()}${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: true,
      });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload image",
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return res.status(200).json({
      success: true,
      data: {
        url: urlData.publicUrl,
        fileName: fileName,
        sectionType: sectionType,
        itemIndex: itemIndex,
      },
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to upload image",
    });
  }
}
