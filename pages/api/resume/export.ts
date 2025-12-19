import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { ResumeRenderer } from "../../../components/ResumeRenderer";

// Simple Tailwind CSS injection for the PDF
// In production, you might want to read this from a file or use a styled-components approach
// For now, we'll use a CDN link or minimal critical CSS for strict ATS
const TAILWIND_CDN =
  "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

// Helper to get resume data (mock or DB)
// For this implementation, we expect the resume object to be passed in the body
// to avoid double DB fetching if the client already has it,
// OR we fetch from DB if only ID is provided.
// Ideally, fetch from DB for security.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resumeId, format = "pdf", template = "ats", resumeData } = req.body;

  try {
    let resume = resumeData;

    // If no data passed, fetch from DB
    if (!resume && resumeId) {
      // Fetch resume WITH sections
      const { data, error } = await supabase
        .from("resumes")
        .select("*, sections:resume_sections(*)")
        .eq("id", resumeId)
        .single();

      if (error || !data) {
        throw new Error("Resume not found");
      }

      resume = data;
    }

    if (!resume) {
      return res.status(400).json({ error: "Resume data required" });
    }

    const {
      themeColor: passedThemeColor,
      font: passedFont,
      sections: passedSections,
      template: passedTemplate,
    } = req.body;

    // Standardize settings extraction
    const settings = resume.settings || {};
    const templateToUse =
      passedTemplate || settings.template_id || resume.template_id || "ats";
    const themeColorToUse = passedThemeColor || resume.theme_color || "#3b82f6";
    const fontToUse = passedFont || settings.font || "inter";

    // Prioritize passed-in sections (ordered/filtered) from frontend
    const sections = Array.isArray(passedSections)
      ? passedSections
      : Array.isArray(resume.sections)
      ? resume.sections
      : Array.isArray(resume.resume_sections)
      ? resume.resume_sections
      : [];

    const element = React.createElement(ResumeRenderer, {
      resume,
      sections,
      template: templateToUse,
      themeColor: themeColorToUse,
      settings: {
        ...settings, // Pass all saved settings (order, visibility, etc.)
        font: fontToUse,
        secondary_color: settings.secondary_color || themeColorToUse,
      },
    });

    const htmlContent = ReactDOMServer.renderToStaticMarkup(element);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            section { page-break-inside: avoid; }
            .avoid-break { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          <div id="root">${htmlContent}</div>
        </body>
      </html>
    `;

    if (format === "pdf") {
      const browser = await puppeteer.launch({
        headless: true, // Use standard headless
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--font-render-hinting=none",
        ],
      });
      const page = await browser.newPage();

      // extensive waiting to ensure Tailwind loads
      // networkidle2 is often safer than networkidle0 for slow CDNs
      await page.setContent(fullHtml, { waitUntil: "networkidle2" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "10mm",
          right: "10mm",
        },
      });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Content-Disposition", `attachment; filename=resume.pdf`);
      res.send(Buffer.from(pdfBuffer));
      return;
    }

    // Stub for DOCX
    if (format === "docx") {
      return res.status(501).json({ error: "DOCX export not implemented yet" });
    }

    return res.status(400).json({ error: "Invalid format" });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate PDF" });
  }
}
