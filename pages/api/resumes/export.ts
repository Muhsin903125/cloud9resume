import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExportResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExportResponse>
) {
  try {
    // Verify authentication
    let userId = "";
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        userId = user.id;
      }
    }

    // Fallback or explicit check
    if (!userId) {
      // Double check header mainly for service-to-service if used inside same network,
      // but generally we want token auth.
      userId = req.headers["x-user-id"] as string;
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (req.method === "POST") {
      const { resumeId, format, templateId } = req.body;

      if (!resumeId || !format) {
        return res
          .status(400)
          .json({ success: false, error: "Resume ID and format are required" });
      }

      if (!["pdf", "docx", "json"].includes(format)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid format" });
      }

      // Verify resume ownership
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("user_id", userId)
        .single();

      if (resumeError || !resume) {
        return res
          .status(404)
          .json({ success: false, error: "Resume not found" });
      }

      // Check user plan & credits
      const { data: userPlan, error: planError } = await supabase
        .from("profiles") // Correct table name
        .select("plan, credits")
        .eq("id", userId)
        .single();

      if (planError) throw planError;

      // Calculate cost
      let creditsNeeded = 5; // Default fallback
      if (format === "pdf") creditsNeeded = 1;
      else if (format === "docx") creditsNeeded = 2;
      else if (format === "json") creditsNeeded = 0;

      if ((userPlan?.credits || 0) < creditsNeeded) {
        return res.status(400).json({
          success: false,
          error: `Insufficient credits. Download costs ${creditsNeeded} credits. You have ${
            userPlan?.credits || 0
          }.`,
        });
      }

      // Create export record
      console.log("[Export API] Attempting to insert into resume_exports:", {
        resume_id: resumeId,
        user_id: userId,
        format,
        template_id: templateId,
        credits_deducted: creditsNeeded,
      });

      const { data: exportRecord, error: exportError } = await supabase
        .from("resume_exports")
        .insert({
          resume_id: resumeId,
          user_id: userId,
          format,
          template_id: templateId,
          export_status: "pending",
          credits_deducted: creditsNeeded,
        })
        .select()
        .single();

      if (exportError) {
        console.error("[Export API] Export record insert failed:", exportError);
        throw exportError;
      }

      console.log("[Export API] Export record created:", exportRecord?.id);

      // Deduct credits
      if (creditsNeeded > 0) {
        console.log(
          `[Export API] Deducting ${creditsNeeded} credits from user ${userId}`
        );

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ credits: (userPlan?.credits || 0) - creditsNeeded })
          .eq("id", userId);

        if (updateError) {
          console.error(
            "[Export API] Profile credit deduction failed:",
            updateError
          );
        }

        const { error: usageError } = await supabase
          .from("credit_usage")
          .insert({
            user_id: userId,
            action: "export_resume",
            credits_used: creditsNeeded,
            description: `Export resume as ${format.toUpperCase()}`,
          });

        if (usageError) {
          console.error("[Export API] Credit usage log failed:", usageError);
        }
      }

      return res.status(201).json({
        success: true,
        data: exportRecord,
        message:
          "Export queued successfully. You will receive it via email shortly.",
      });
    }

    // GET /api/resumes/exports - Get export history
    if (req.method === "GET") {
      const { resumeId } = req.query;

      let query = supabase
        .from("resume_exports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (resumeId) {
        query = query.eq("resume_id", resumeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Export API error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
