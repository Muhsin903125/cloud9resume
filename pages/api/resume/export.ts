import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { ResumeRenderer } from "../../../components/ResumeRenderer";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PLAN_LIMITS } from "../../../lib/subscription";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TAILWIND_CDN =
  "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resumeId, format = "pdf", template = "ats", resumeData } = req.body;

  // Auth & Plan Check
  let hasWatermark = true;
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.decode(token) as any;
      const userId = decoded?.sub || decoded?.userId;

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("downloads_used, downloads_limit, plan_id, plan")
          .eq("id", userId)
          .single();

        if (profile) {
          // Determine Plan
          let userPlan = "free";
          if (
            profile.plan &&
            ["free", "professional", "premium"].includes(profile.plan)
          ) {
            userPlan = profile.plan;
          } else {
            const pid = profile.plan_id;
            if (pid === 2 || pid === 3) userPlan = "professional";
            else if (pid === 4) userPlan = "premium";
            else if (pid === 5) userPlan = "enterprise";
          }

          const planLimits =
            PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] ||
            PLAN_LIMITS.free;
          hasWatermark = planLimits.hasWatermark;

          // Check download limit (if not unlimited i.e. -1)
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

    // Font mapping for CSS
    const fontFamilyMap: { [key: string]: string } = {
      inter: "'Inter', sans-serif",
      roboto: "'Roboto', sans-serif",
      manrope: "'Manrope', sans-serif",
      poppins: "'Poppins', sans-serif",
      calibri: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
      arial: "Arial, Helvetica, sans-serif",
    };
    const fontFamily = fontFamilyMap[fontToUse] || fontFamilyMap.inter;

    const fontsCss = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuOKfMZg.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Manrope';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/manrope/v14/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_C-bw.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.ttf) format('truetype');
      }
      @font-face {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf) format('truetype');
      }
    `;

    // Watermark using CSS running footer - appears at bottom of content on each page
    const watermarkCss = hasWatermark
      ? `
      @page {
        @bottom-right {
          content: "Created with Cloud9Profile.com";
          font-size: 8px;
          color: #94a3b8;
          font-family: Arial, sans-serif;
        }
      }
      .watermark-footer {
        position: fixed;
        bottom: 5mm;
        right: 10mm;
        font-size: 9px;
        color: #94a3b8;
        font-family: Arial, sans-serif;
        z-index: 1000;
      }
    `
      : "";

    const watermarkHtml = hasWatermark
      ? `<div class="watermark-footer">Created with <b>Cloud9Profile.com</b></div>`
      : "";

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${fontsCss}
            ${watermarkCss}
            * { 
              box-sizing: border-box; 
            }
            html, body { 
              width: 100%;
              margin: 0;
              padding: 0;
              font-family: ${fontFamily};
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white;
            }
            /* Page margin rules for proper watermark spacing */
            @page {
              margin-top: ${hasWatermark ? "5mm" : "0"};
              margin-bottom: ${hasWatermark ? "18mm" : "0"};
              margin-left: 0;
              margin-right: 0;
            }
            /* Remove template fixed heights so content flows naturally across pages */
            #root > div {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: unset !important;
              height: auto !important;
              ${hasWatermark ? "padding-bottom: 10mm !important;" : ""}
            }
            /* Ensure sections don't break awkwardly */
            section, .break-inside-avoid {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div id="root">${htmlContent}</div>
          ${watermarkHtml}
        </body>
      </html>
    `;

    if (format === "pdf") {
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // setContent with waitUntil: networkidle0 ensures fonts are loaded
        await page.setContent(fullHtml, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        // Explicitly wait for fonts to be ready
        await page.evaluate(async () => {
          await document.fonts.ready;
        });

        // Footer template for watermark - appears on every page
        const footerTemplate = hasWatermark
          ? `<div style="width: 100%;text-transform: italic; text-align: right; padding: 5px 20px; font-size: 9px; color: #94a3b8; font-family: Arial, sans-serif;">
               Created with <b>Cloud9Profile.com</b>
             </div>`
          : "";

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: {
            top: "10mm", // Top margin for page breaks
            bottom: "12mm", // Bottom margin for watermark space
            left: "0mm",
            right: "0mm",
          },
        });

        await browser.close();

        // Post-process PDF with pdf-lib to add watermark on each page
        let finalPdfBytes: Uint8Array = pdfBuffer;

        if (hasWatermark) {
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          const pages = pdfDoc.getPages();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontSize = 9;
          const watermarkText = "Created with Cloud9Profile.com";

          for (const page of pages) {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

            // Position at bottom-right with 15mm margin from right and 8mm from bottom
            page.drawText(watermarkText, {
              x: width - textWidth - 15 * 2.83465, // 15mm in points
              y: 8 * 2.83465, // 8mm from bottom in points
              size: fontSize,
              font: font,
              color: rgb(0.58, 0.64, 0.72), // #94a3b8 color
            });
          }

          finalPdfBytes = await pdfDoc.save();
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${
            resume.title || "resume"
          }_${templateToUse}.pdf`
        );
        return res.end(Buffer.from(finalPdfBytes));
      } catch (err: any) {
        if (browser) await browser.close();
        console.error("PDF Generation Error (Puppeteer):", err);
        return res.status(500).json({
          error: "Failed to generate PDF",
          details: err.message,
        });
      }
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
              spacing: { after: 50 },
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
              spacing: { after: 50 },
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
              spacing: { after: 50 },
            })
          );
        }

        // Divider
        docChildren.push(
          new Paragraph({
            border: {
              bottom: { color: "CCCCCC", size: 1, style: BorderStyle.SINGLE },
            },
            spacing: { after: 50 },
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
              spacing: { before: 50, after: 50 },
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
                  spacing: { after: 50 },
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
                  spacing: { before: 50 },
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
