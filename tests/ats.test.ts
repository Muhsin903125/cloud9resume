import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import pdfParse from "pdf-parse";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { ResumeRenderer } from "../components/ResumeRenderer";

// Mock Data
const mockResume = {
  id: "test-resume",
  title: "Test Resume",
  personalInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
    address: "New York, NY",
  },
};

const mockSections = [
  {
    id: "s1",
    section_type: "summary",
    title: "Professional Summary",
    section_data: {
      text: "Experienced software engineer with a focus on ATS optimization.",
    },
  },
  {
    id: "s2",
    section_type: "experience",
    title: "Work Experience",
    section_data: [
      {
        title: "Senior Developer",
        company: "Tech Corp",
        startDate: "2020",
        endDate: "Present",
        location: "Remote",
        description: "Led development of resume builder.",
      },
    ],
  },
  {
    id: "s3",
    section_type: "education",
    title: "Education",
    section_data: [
      {
        degree: "BS Computer Science",
        school: "University of Tech",
        startDate: "2016",
        endDate: "2020",
      },
    ],
  },
];

describe("ATS Validation", () => {
  let browser: any;
  let page: any;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("generates a PDF with selectable text", async () => {
    // 1. Render HTML
    const element = React.createElement(ResumeRenderer, {
      resume: mockResume,
      sections: mockSections,
      template: "ats",
      themeColor: "#000000",
      settings: { font: "Arial, sans-serif" },
    });
    const htmlContent = ReactDOMServer.renderToStaticMarkup(element);

    // 2. Wrap in full page
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
           <style>
             body { font-family: Arial, sans-serif; }
             /* Basic resets to ensure it renders somewhat correctly without full tailwind */
             .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
             .font-bold { font-weight: 700; }
             .uppercase { text-transform: uppercase; }
             .text-center { text-align: center; }
             .border-b-2 { border-bottom-width: 2px; }
             .mb-6 { margin-bottom: 1.5rem; }
           </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    // 3. Generate PDF buffer
    await page.setContent(fullHtml);
    const pdfBuffer = await page.pdf({ format: "A4" });

    // 4. Parse PDF
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Checks
    expect(text.length).toBeGreaterThan(100);
    expect(text).toContain("John Doe");
    expect(text).toContain("john@example.com");
    expect(text).toContain("Senior Developer");

    // Check specific ordering (Experience before Education)
    // Note: PDF text extraction can sometimes be messy order-wise depending on layout,
    // but a standard single-column flow should preserve order.
    const experienceIndex = text.indexOf("Work Experience");
    const educationIndex = text.indexOf("Education");

    expect(experienceIndex).toBeGreaterThan(-1);
    expect(educationIndex).toBeGreaterThan(-1);
    expect(experienceIndex).toBeLessThan(educationIndex);
  }, 30000); // Increase timeout for Puppeteer
});
