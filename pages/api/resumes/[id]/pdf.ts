import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { pdfGenerator } from "../../../../lib/backend/utils/pdfGenerator";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract user ID from token
 */
function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (req.query.token as string) ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null);

    if (!token) return null;

    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;

    return decoded.sub || decoded.userId || null;
  } catch (error) {
    return null;
  }
}

/**
 * Transform loose sections array into structured ResumeData for PDF Generator
 */
function transformToResumeData(resume: any, sections: any[]): any {
  // Sort sections by order_index
  const sortedSections = [...sections].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  // Helper to find section data by type
  const findSection = (type: string) =>
    sortedSections.find((s) => s.section_type === type)?.section_data || {};

  const personalInfo = findSection("personal_info");
  const summary = findSection("summary");
  // Handle array-based sections
  const experience = findSection("experience");
  const education = findSection("education");
  const skills = findSection("skills");
  const certifications = findSection("certifications");

  return {
    personalInfo: {
      name: personalInfo.fullName || resume.title || "Resume",
      email: personalInfo.email || "",
      phone: personalInfo.phone || "",
      location: personalInfo.address || "",
      linkedin: personalInfo.linkedin || "",
      website: personalInfo.website || "",
    },
    summary: summary.text || summary.content || "",
    experience: Array.isArray(experience) ? experience : experience.items || [],
    education: Array.isArray(education) ? education : education.items || [],
    skills: Array.isArray(skills) ? skills : skills.items || [], // skills might be array of strings or objects
    certifications: Array.isArray(certifications)
      ? certifications
      : certifications.items || [],
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    // Allow token in query param for direct browser download links
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check user credits before download
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ message: "Unable to verify user credits" });
    }

    // Free plan users with no credits cannot download
    if ((profile.credits || 0) < 1) {
      return res.status(402).json({
        message:
          "Insufficient credits. Please purchase more credits to download.",
        creditsRequired: 1,
        creditsAvailable: profile.credits || 0,
      });
    }

    // Fetch Resume
    const { data: resume, error } = await supabase
      .from("resumes")
      .select(
        "*, resume_sections(id, section_type, section_data, is_visible, order_index)"
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Deduct 1 credit for download
    const { error: deductError } = await supabase
      .from("profiles")
      .update({ credits: (profile.credits || 0) - 1 })
      .eq("id", userId);

    if (deductError) {
      console.error("Credit deduction failed:", deductError);
      // Continue anyway - don't block download for credit deduction failure
    } else {
      console.log(
        `[PDF Download] Deducted 1 credit from user ${userId}. Remaining: ${
          (profile.credits || 0) - 1
        }`
      );
    }

    // Transform Data
    const resumeData = transformToResumeData(
      resume,
      resume.resume_sections || []
    );

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateResumePDF(resumeData);

    // Send Response
    const filename = `${(resume.title || "resume").replace(
      /[^a-z0-9]/gi,
      "_"
    )}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Internal server error generating PDF" });
  }
}
