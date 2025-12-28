import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import formidable, { File } from "formidable";
import fs from "fs";
import { ResumeParserService } from "@/lib/ai/resumeParser";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
  api: {
    bodyParser: false,
  },
};

const RESUME_PARSE_COST = 5;

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
    // 1. Authenticate User
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 2. Check Credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch user profile" });
    }

    const currentCredits = profile.credits || 0;
    if (currentCredits < RESUME_PARSE_COST) {
      return res.status(403).json({
        success: false,
        error: "Insufficient credits",
        required: RESUME_PARSE_COST,
        current: currentCredits,
      });
    }

    // 3. Parse File Upload
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0] as File;

    if (!uploadedFile) {
      return res
        .status(400)
        .json({ success: false, error: "No file provided" });
    }

    // 4. Read File buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const mimeType = uploadedFile.mimetype || "application/octet-stream";

    // 5. Call AI Parser Service
    const parserService = new ResumeParserService();
    const parsedData = await parserService.parseResume(fileBuffer, mimeType);

    // 6. Deduct Credits & Log Usage (Transaction)
    // We do this concurrently with Resume Creation ideally, but for now we do it sequentially.

    // 6a. Create Resume in DB
    const { data: newResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: parsedData.personal_info.name
          ? `${parsedData.personal_info.name}'s Resume`
          : "Imported Resume",
        content: parsedData, // Save the entire parsed structure as content
        is_imported: true,
        ats_score: 0,
      })
      .select("id")
      .single();

    if (createError || !newResume) {
      throw new Error("Failed to save imported resume to database.");
    }

    const { error: transactionError } = await supabase.rpc(
      "deduct_credits_and_log",
      {
        p_user_id: user.id,
        p_credits: RESUME_PARSE_COST,
        p_action: "parse_resume",
        p_details: {
          filename: uploadedFile.originalFilename,
          resume_id: newResume.id,
        },
      }
    );

    // Fallback if RPC doesn't exist yet (manual transaction simulation)
    if (transactionError) {
      // 6b. Deduct credits manually
      await supabase
        .from("profiles")
        .update({ credits: currentCredits - RESUME_PARSE_COST })
        .eq("id", user.id);

      // 6c. Log usage
      await supabase.from("ai_usage_logs").insert({
        user_id: user.id,
        action_type: "parse_resume",
        credits_used: RESUME_PARSE_COST,
        details: {
          filename: uploadedFile.originalFilename,
          resume_id: newResume.id,
        },
      });
    }

    // 7. Cleanup temp file
    fs.unlinkSync(uploadedFile.filepath);

    return res.status(200).json({
      success: true,
      data: parsedData,
      resumeId: newResume.id,
      creditsUsed: RESUME_PARSE_COST,
      remainingCredits: currentCredits - RESUME_PARSE_COST,
    });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
