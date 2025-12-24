import type { NextApiRequest, NextApiResponse } from "next";
import { emailSender } from "../../../lib/backend/utils/emailSender";

interface EmailReportResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailReportResponse>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { email, name, analysisData } = req.body;

    if (!email || !analysisData) {
      return res.status(400).json({
        success: false,
        error: "Email and analysis data are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Send email using centralized emailSender
    await emailSender.sendATSAnalysisReport(email, name, analysisData);

    console.log(`✓ Email report sent to: ${email}`);

    res.status(200).json({
      success: true,
      message: "ATS analysis report sent to your email",
    });
  } catch (error) {
    console.error("Email report error:", error);

    let errorMessage = "Failed to send email report";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
