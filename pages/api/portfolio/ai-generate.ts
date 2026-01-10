import { NextApiRequest, NextApiResponse } from "next";
import { geminiFlashModel } from "../../../lib/ai/client";
import jwt from "jsonwebtoken";

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

    const {
      sections,
      profileImageUrl = null,
      customInstructions = "",
    } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: "Resume sections are required" });
    }

    // Filter out empty custom sections to save tokens and avoid empty HTML blocks
    const filteredSections = sections.filter((s: any) => {
      if (s.section_type === "custom") {
        const hasTitle =
          s.section_data?.title && s.section_data.title.trim() !== "";
        const hasContent =
          s.section_data?.content && s.section_data.content.trim() !== "";
        return hasTitle || hasContent;
      }
      return true;
    });

    const htmlPrompt = `You are an elite Digital Experience Designer. Create a premium, modern, and fully responsive single-page portfolio website using the provided resume data. 

RESUME DATA:
${JSON.stringify(filteredSections, null, 2)}

PROFILE IMAGE: ${profileImageUrl || "Use a professional avatar placeholder"}

DESIGN CORE REQUIREMENTS:
1. **Premium Aesthetic**: Generate a "high-end startup" design style. Use modern UI trends: Glassmorphism, subtle gradients, clean typography (Inter/Outfit), and ample white space.
2. **Mobile-First Responsive**: The website MUST be stunning on mobile devices. Use responsive Tailwind utilities (sm/md/lg/xl) for all layouts. Ensure touch-friendly navigation and buttons.
3. **Interactive UI**: 
   - Add smooth hover transitions on all interactive elements.
   - Implement simple CSS-based scroll entrance animations (fade-in, slide-up).
   - Use Lucide-style SVG icons for visual hierarchy.
4. **Layout Architecture**:
   - **Header**: Sticky glassmorphism nav with mobile menu.
   - **Hero**: High-impact intro with the user's name, job title, and a clear Call to Action.
   - **About**: Conversational "About Me" based on the summary.
   - **Experience**: Clean timeline or card-based layout for work history.
   - **Projects**: Visual grid of projects with tag-based skills.
   - **Skills**: Modern skill-cloud or categorized grid.
   - **Contact**: Minimalist contact section with email/social links.
5. **Technical constraints**:
   - Use ONLY Tailwind CSS (via CDN: https://cdn.tailwindcss.com).
   - Use Google Fonts (Inter & Outfit).
   - Return a COMPLETE, self-contained <!DOCTYPE html> document.
   - **DO NOT** use generic "Lorem Ipsum". If data for a section is missing, OMIT that section entirely.
   - Footer: Keep it simple: "Powered by Cloud9Profile".

${customInstructions ? `USER CUSTOM PREFERENCES: ${customInstructions}` : ""}

Return ONLY the raw HTML code. Do not include markdown code blocks or any explanation text.`;

    const result = await geminiFlashModel.generateContent(htmlPrompt);
    let htmlContent = result.response.text();

    // Clean up the response - remove markdown code blocks if present
    htmlContent = htmlContent
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Ensure it starts with DOCTYPE
    if (!htmlContent.startsWith("<!DOCTYPE")) {
      const doctypeIndex = htmlContent.indexOf("<!DOCTYPE");
      if (doctypeIndex > -1) {
        htmlContent = htmlContent.substring(doctypeIndex);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        html: htmlContent,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("AI Portfolio generation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate portfolio",
    });
  }
}
