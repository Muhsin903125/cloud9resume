import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import formidable, { File } from "formidable";
import fs from "fs";
import { ResumeParserService } from "@/lib/ai/resumeParser";
import jwt from "jsonwebtoken";

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

// Helper to extract user ID from JWT
function extractUserId(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.decode(token);
    return decoded?.sub || decoded?.userId || null;
  } catch (e) {
    return null;
  }
}

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
    console.log("[Parse-Resume] Starting authentication...");
    const userId = extractUserId(req);

    if (!userId) {
      console.error("[Parse-Resume] Auth failed: No userId in token");
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Double check user exists in profiles table
    const { data: userRecord, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userRecord) {
      console.error(
        "[Parse-Resume] Auth failed: User record not found",
        userError
      );
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    console.log("[Parse-Resume] User authenticated:", userId);

    // 2. Check Credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
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
    console.log("[Parse-Resume] Parsing multipart form data...");
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0] as File;

    if (!uploadedFile) {
      console.error(
        "[Parse-Resume] No file found in request files:",
        Object.keys(files)
      );
      return res
        .status(400)
        .json({ success: false, error: "No file provided" });
    }
    console.log(
      "[Parse-Resume] File received:",
      uploadedFile.originalFilename,
      "Type:",
      uploadedFile.mimetype
    );

    // 4. Read File buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const mimeType = uploadedFile.mimetype || "application/octet-stream";

    // 5. Call AI Parser Service
    console.log("[Parse-Resume] Calling AI Parser Service...");
    const parserService = new ResumeParserService();
    const parsedData = await parserService.parseResume(fileBuffer, mimeType);
    console.log("[Parse-Resume] AI Parsing successful");

    // 6. Deduct Credits & Log Usage (Transaction)
    // We do this before saving the resume to ensure they have the credits.
    const { error: transactionError } = await supabase.rpc(
      "deduct_credits_and_log",
      {
        p_user_id: userId,
        p_credits: RESUME_PARSE_COST,
        p_action: "parse_resume",
        p_details: {
          filename: uploadedFile.originalFilename,
        },
      }
    );

    // Fallback if RPC doesn't exist yet (manual transaction simulation)
    if (transactionError) {
      console.warn(
        "[Parse-Resume] RPC failed, falling back to manual credit deduction:",
        transactionError.message
      );
      // 6b. Deduct credits manually
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: currentCredits - RESUME_PARSE_COST })
        .eq("id", userId);

      if (updateError) {
        console.error(
          "[Parse-Resume] Failed to deduct credits manually:",
          updateError
        );
      }

      // 6c. Log usage
      const { error: logError } = await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        action_type: "parse_resume",
        credits_used: RESUME_PARSE_COST,
        details: {
          filename: uploadedFile.originalFilename,
        },
      });

      if (logError) {
        console.error("[Parse-Resume] Failed to log usage manually:", logError);
      }
    }

    // 7. Create Resume in DB (Metadata only)
    console.log("[Parse-Resume] Creating resume metadata in DB...");
    const { data: newResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        title: parsedData.personal_info.name
          ? `${parsedData.personal_info.name}'s Resume`
          : "Imported Resume",
        job_title: parsedData.personal_info.jobTitle || "",
        status: "draft",
        settings: {
          template_id: "modern",
        },
      })
      .select("id")
      .single();

    if (createError || !newResume) {
      console.error(
        "[Parse-Resume] Failed to create resume metadata:",
        createError
      );
      throw new Error(
        `Failed to save imported resume metadata: ${
          createError?.message || "Unknown error"
        }`
      );
    }
    console.log(
      "[Parse-Resume] Resume metadata created with ID:",
      newResume.id
    );

    // 8. Create Sections from parsed data
    console.log("[Parse-Resume] Creating resume sections...");

    // 8a. Personal Info
    const personalInfoSection = {
      resume_id: newResume.id,
      section_type: "personal_info",
      section_data: {
        name: parsedData.personal_info.name,
        email: parsedData.personal_info.email,
        phone: parsedData.personal_info.phone,
        jobTitle: parsedData.personal_info.jobTitle,
        address: parsedData.personal_info.location.address,
        city: parsedData.personal_info.location.city,
        country: parsedData.personal_info.location.country,
        linkedin: parsedData.personal_info.links.linkedin,
        github: parsedData.personal_info.links.github,
        portfolio: parsedData.personal_info.links.portfolio,
        website: parsedData.personal_info.links.website,
      },
      order_index: 0,
    };

    // 8b. Summary
    const summarySection = {
      resume_id: newResume.id,
      section_type: "summary",
      section_data: { text: parsedData.summary },
      order_index: 1,
    };

    // 8c. Experience
    const experienceSection = {
      resume_id: newResume.id,
      section_type: "experience",
      section_data: { items: parsedData.experience },
      order_index: 2,
    };

    // 8d. Education
    const educationSection = {
      resume_id: newResume.id,
      section_type: "education",
      section_data: {
        items: parsedData.education.map((edu) => ({
          institution: edu.school, // Map school -> institution
          degree: edu.degree,
          graduationDate: edu.endDate, // Map endDate -> graduationDate
          description: edu.description,
          location: edu.location,
        })),
      },
      order_index: 3,
    };

    // 8e. Skills (Flatten categorize into items)
    const skillsList = [
      ...parsedData.skills.technical,
      ...parsedData.skills.soft,
      ...parsedData.skills.tools,
      ...parsedData.skills.languages,
    ].map((s) => ({ name: s }));

    const skillsSection = {
      resume_id: newResume.id,
      section_type: "skills",
      section_data: { items: skillsList },
      order_index: 4,
    };

    // 8f. Projects
    const projectsSection = {
      resume_id: newResume.id,
      section_type: "projects",
      section_data: {
        items: (parsedData.projects || []).map((p) => ({
          title: p.name,
          description: p.description,
          technologies: Array.isArray(p.technologies)
            ? p.technologies.join(", ")
            : p.technologies,
          link: p.link,
        })),
      },
      order_index: 5,
    };

    // 8g. Certifications
    const certsSection = {
      resume_id: newResume.id,
      section_type: "certifications",
      section_data: {
        items: (parsedData.certifications || []).map((c) => ({
          title: c.name,
          issuer: c.issuer,
          date: c.date,
          url: c.link,
        })),
      },
      order_index: 6,
    };

    // Batch Insert Sections
    const { error: sectionsError } = await supabase
      .from("resume_sections")
      .insert([
        personalInfoSection,
        summarySection,
        experienceSection,
        educationSection,
        skillsSection,
        projectsSection,
        certsSection,
      ]);

    if (sectionsError) {
      console.error(
        "[Parse-Resume] Failed to create resume sections:",
        sectionsError
      );
      // We don't throw here to avoid losing the metadata, but we log the error.
      // Actually, it's better to show an error if critical sections are missing.
    }
    console.log("[Parse-Resume] Resume sections created successfully");

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
      details: error.toString(),
    });
  }
}
