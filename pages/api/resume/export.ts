import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { ResumeRenderer } from "../../../components/ResumeRenderer";
import jwt from "jsonwebtoken";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TableRow,
  Table,
  TableCell,
  WidthType,
} from "docx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resumeId, format = "pdf", template = "ats", resumeData } = req.body;

  // 1. Enforce Download Limits
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.decode(token) as any;
      const userId = decoded?.sub || decoded?.userId;

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("downloads_used, downloads_limit")
          .eq("id", userId)
          .single();

        if (profile) {
          // Check limit (if not unlimited i.e. -1)
          if (
            profile.downloads_limit !== -1 &&
            profile.downloads_used >= profile.downloads_limit
          ) {
            return res.status(403).json({
              error:
                "Monthly download limit reached. Upgrade to Pro for unlimited downloads.",
            });
          }

          // Increment usage
          await supabase
            .from("profiles")
            .update({ downloads_used: (profile.downloads_used || 0) + 1 })
            .eq("id", userId);
        }
      }
    } catch (e) {
      console.error("Auth check failed in export", e);
    }
  }

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
            * { 
              box-sizing: border-box; 
            }
            html, body { 
              width: 100%;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Remove template fixed heights so content flows naturally across pages */
            #root > div {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: unset !important;
              height: auto !important;
            }
            /* Ensure sections don't break awkwardly */
            section, .break-inside-avoid {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div id="root">${htmlContent}</div>
        </body>
      </html>
    `;

    if (format === "pdf") {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--font-render-hinting=none",
        ],
      });
      const page = await browser.newPage();

      await page.setContent(fullHtml, { waitUntil: "networkidle2" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm",
        },
      });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Content-Disposition", `attachment; filename=resume.pdf`);
      res.send(Buffer.from(pdfBuffer));
      return;
    }

    // DOCX Export Implementation
    if (format === "docx") {
      try {
        const docChildren: any[] = [];

        // Get personal info section
        const personalInfo =
          sections.find((s: any) => s.section_type === "personal_info")
            ?.section_data ||
          resume.personal_info ||
          {};

        // Header with name
        if (personalInfo.name || personalInfo.first_name) {
          const fullName =
            personalInfo.name ||
            `${personalInfo.first_name || ""} ${
              personalInfo.last_name || ""
            }`.trim();
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: fullName,
                  bold: true,
                  size: 48, // 24pt
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            })
          );
        }

        // Job title
        if (personalInfo.job_title || personalInfo.title) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: personalInfo.job_title || personalInfo.title,
                  size: 24, // 12pt
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            })
          );
        }

        // Contact info
        const contactParts = [];
        if (personalInfo.email) contactParts.push(personalInfo.email);
        if (personalInfo.phone) contactParts.push(personalInfo.phone);
        if (personalInfo.location) contactParts.push(personalInfo.location);
        if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);

        if (contactParts.length > 0) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: contactParts.join(" | "),
                  size: 20, // 10pt
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }

        // Divider
        docChildren.push(
          new Paragraph({
            border: {
              bottom: { color: "CCCCCC", size: 1, style: BorderStyle.SINGLE },
            },
            spacing: { after: 200 },
          })
        );

        // Process each section
        for (const section of sections) {
          if (section.section_type === "personal_info") continue; // Already handled

          const sectionData = section.section_data || {};
          const sectionTitle =
            section.title ||
            section.section_type.replace(/_/g, " ").toUpperCase();

          // Section header
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sectionTitle,
                  bold: true,
                  size: 26, // 13pt
                  color: themeColorToUse.replace("#", ""),
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 },
              border: {
                bottom: {
                  color: themeColorToUse.replace("#", ""),
                  size: 1,
                  style: BorderStyle.SINGLE,
                },
              },
            })
          );

          // Handle different section types
          if (
            section.section_type === "summary" ||
            section.section_type === "objective"
          ) {
            const summaryText =
              sectionData.text ||
              sectionData.summary ||
              sectionData.content ||
              "";
            if (summaryText) {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun({ text: summaryText, size: 22 })],
                  spacing: { after: 150 },
                })
              );
            }
          } else if (
            section.section_type === "experience" ||
            section.section_type === "work_experience"
          ) {
            const experiences =
              sectionData.items || sectionData.experiences || sectionData || [];
            for (const exp of Array.isArray(experiences) ? experiences : []) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.title || exp.position || "",
                      bold: true,
                      size: 24,
                    }),
                    new TextRun({
                      text: exp.company ? ` at ${exp.company}` : "",
                      size: 24,
                    }),
                  ],
                  spacing: { before: 150 },
                })
              );
              if (exp.date || exp.start_date || exp.duration) {
                const dateStr =
                  exp.date ||
                  `${exp.start_date || ""} - ${exp.end_date || "Present"}`;
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: dateStr,
                        size: 20,
                        italics: true,
                        color: "666666",
                      }),
                    ],
                  })
                );
              }
              if (exp.description) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: exp.description, size: 22 }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
              // Handle bullet points
              const bullets =
                exp.bullets || exp.responsibilities || exp.achievements || [];
              for (const bullet of Array.isArray(bullets) ? bullets : []) {
                docChildren.push(
                  new Paragraph({
                    children: [new TextRun({ text: `• ${bullet}`, size: 22 })],
                    indent: { left: 360 },
                  })
                );
              }
            }
          } else if (section.section_type === "education") {
            const educations =
              sectionData.items || sectionData.education || sectionData || [];
            for (const edu of Array.isArray(educations) ? educations : []) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree || "",
                      bold: true,
                      size: 24,
                    }),
                    new TextRun({
                      text: edu.field ? ` in ${edu.field}` : "",
                      size: 24,
                    }),
                  ],
                  spacing: { before: 150 },
                })
              );
              if (edu.institution || edu.school) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: edu.institution || edu.school,
                        size: 22,
                      }),
                    ],
                  })
                );
              }
              if (edu.date || edu.graduation_date || edu.year) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: edu.date || edu.graduation_date || edu.year,
                        size: 20,
                        italics: true,
                        color: "666666",
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
            }
          } else if (section.section_type === "skills") {
            const skills =
              sectionData.items || sectionData.skills || sectionData || [];
            const skillNames = (Array.isArray(skills) ? skills : [])
              .map((s: any) => (typeof s === "string" ? s : s.name || s.skill))
              .filter(Boolean);
            if (skillNames.length > 0) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: skillNames.join(" • "), size: 22 }),
                  ],
                  spacing: { after: 150 },
                })
              );
            }
          } else if (section.section_type === "projects") {
            const projects =
              sectionData.items || sectionData.projects || sectionData || [];
            for (const proj of Array.isArray(projects) ? projects : []) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: proj.name || proj.title || "",
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { before: 150 },
                })
              );
              if (proj.description) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: proj.description, size: 22 }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
              if (proj.technologies || proj.tech_stack) {
                const techs = Array.isArray(proj.technologies)
                  ? proj.technologies.join(", ")
                  : proj.technologies || proj.tech_stack;
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Technologies: ",
                        bold: true,
                        size: 20,
                      }),
                      new TextRun({ text: techs, size: 20, italics: true }),
                    ],
                  })
                );
              }
            }
          } else if (section.section_type === "languages") {
            const languages =
              sectionData.items || sectionData.languages || sectionData || [];
            const langStrs = (Array.isArray(languages) ? languages : [])
              .map((l: any) => {
                if (typeof l === "string") return l;
                return l.proficiency
                  ? `${l.name || l.language} (${l.proficiency})`
                  : l.name || l.language;
              })
              .filter(Boolean);
            if (langStrs.length > 0) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: langStrs.join(" • "), size: 22 }),
                  ],
                  spacing: { after: 150 },
                })
              );
            }
          } else {
            // Generic handler for other sections
            const text =
              sectionData.text ||
              sectionData.content ||
              sectionData.description ||
              "";
            if (text) {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun({ text, size: 22 })],
                  spacing: { after: 150 },
                })
              );
            }
          }
        }

        // Create the document
        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: { top: 720, bottom: 720, left: 720, right: 720 }, // 0.5 inch margins
                },
              },
              children: docChildren,
            },
          ],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader("Content-Length", buffer.length);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${(resume.title || "resume").replace(
            /[^a-z0-9]/gi,
            "_"
          )}.docx`
        );
        res.send(Buffer.from(buffer));
        return;
      } catch (docxError: any) {
        console.error("DOCX generation error:", docxError);
        return res
          .status(500)
          .json({ error: "Failed to generate DOCX: " + docxError.message });
      }
    }

    return res.status(400).json({ error: "Invalid format" });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate PDF" });
  }
}
