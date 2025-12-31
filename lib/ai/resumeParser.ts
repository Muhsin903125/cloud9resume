import { geminiFlashModel, geminiClient } from "./client";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export interface ParsedResumeData {
  personal_info: {
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    location: {
      city: string;
      country: string;
      address: string;
    };
    links: {
      linkedin: string;
      github: string;
      portfolio: string;
      website: string;
    };
  };
  summary: string;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    highlights: string[];
    current: boolean;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate: string;
    link: string;
  }>;
}

export class ResumeParserService {
  private supabase: any;
  /**
   * Main entry point to parse a resume file
   */
  async parseResume(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<ParsedResumeData> {
    let text = "";

    // 1. Extract text based on file type
    if (mimeType === "application/pdf") {
      text = await this.extractTextFromPDF(fileBuffer);
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      text = await this.extractTextFromDOCX(fileBuffer);
    } else if (mimeType.startsWith("image/")) {
      // For images, we pass the image data directly to Gemini Vision
      return this.parseResumeFromImage(fileBuffer, mimeType);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (!text || text.trim().length < 50) {
      throw new Error("Could not extract sufficient text from the file.");
    }

    // 2. Parse text with Gemini
    return this.parseTextWithGemini(text);
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error("Error parsing PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  private async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      throw new Error("Failed to extract text from DOCX");
    }
  }

  private async parseResumeFromImage(
    buffer: Buffer,
    mimeType: string
  ): Promise<ParsedResumeData> {
    // Convert buffer to base64
    const base64Data = buffer.toString("base64");

    // Prompt for Vision model
    const prompt = `
      You are an expert resume parser. Extract information from this resume image and return a JSON object.
      
      Strictly follow this JSON schema:
      {
        "personal_info": {
          "name": "", "email": "", "phone": "", "jobTitle": "",
          "location": { "city": "", "country": "", "address": "" },
          "links": { "linkedin": "", "github": "", "portfolio": "", "website": "" }
        },
        "summary": "",
        "education": [{ "school": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "location": "", "description": "" }],
        "experience": [{ "company": "", "position": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "location": "", "description": "", "highlights": [], "current": boolean }],
        "skills": { "technical": [], "soft": [], "languages": [], "tools": [] },
        "projects": [{ "name": "", "description": "", "technologies": [], "link": "", "startDate": "", "endDate": "" }],
        "certifications": [{ "name": "", "issuer": "", "date": "", "expiryDate": "", "link": "" }]
      }

      If a field is missing, leave it as empty string or empty array.
      Improve content where possible (e.g. fix formatting errors), but keep the data authentic.
      Output ONLY valid JSON.
    `;

    try {
      const result = await geminiFlashModel.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);

      const response = result.response.text();
      return this.cleanAndParseJSON(response);
    } catch (error: any) {
      console.error("Error parsing image with Gemini:", error);
      throw new Error(
        `Failed to parse resume image: ${error.message || error.toString()}`
      );
    }
  }

  private async parseTextWithGemini(text: string): Promise<ParsedResumeData> {
    const prompt = `
      You are an expert resume parser. Extract information from the following resume text and return a structured JSON object.
      
      Text to parse:
      """
      ${text.slice(0, 30000)} // Limit context if very long
      """

      Strictly follow this JSON schema:
      {
        "personal_info": {
          "name": "", "email": "", "phone": "", "jobTitle": "",
          "location": { "city": "", "country": "", "address": "" },
          "links": { "linkedin": "", "github": "", "portfolio": "", "website": "" }
        },
        "summary": "",
        "education": [{ "school": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "location": "", "description": "" }],
        "experience": [{ "company": "", "position": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "location": "", "description": "", "highlights": [], "current": boolean }],
        "skills": { "technical": [], "soft": [], "languages": [], "tools": [] },
        "projects": [{ "name": "", "description": "", "technologies": [], "link": "", "startDate": "", "endDate": "" }],
        "certifications": [{ "name": "", "issuer": "", "date": "", "expiryDate": "", "link": "" }]
      }

      Rules:
      1. If a field is missing, leave it as empty string or empty array.
      2. Format dates as YYYY-MM if possible, or keep original if ambiguous.
      3. For skills, if not categorized in text, try to intelligently categorize them.
      4. Output ONLY valid JSON, no markdown.
    `;

    // Models ordered by free tier availability and stability
    const modelsToTry = [
      "gemini-1.5-flash", // Most stable, good free tier
      "gemini-1.5-flash-8b", // Cheapest
      "gemini-1.5-pro", // Higher quality fallback
      "gemini-pro", // Legacy but stable
    ];

    let lastError: any = null;
    const tried: string[] = [];
    const maxRetries = 2;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `[AI Parser] Trying ${modelName} (attempt ${attempt + 1}/${
              maxRetries + 1
            })...`
          );
          const model = geminiClient.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = result.response.text();
          console.log(`[AI Parser] Success with ${modelName}`);
          return this.cleanAndParseJSON(response);
        } catch (error: any) {
          lastError = error;
          const isRateLimit =
            error.message?.includes("429") || error.message?.includes("quota");
          const isNotFound =
            error.message?.includes("404") ||
            error.message?.includes("not found");

          console.error(`[AI Parser] Error with ${modelName}:`, {
            message: error.message?.substring(0, 200),
            isRateLimit,
            isNotFound,
            attempt: attempt + 1,
          });

          // If 404 (model not found), skip to next model immediately
          if (isNotFound) {
            tried.push(modelName);
            break;
          }

          // If rate limited and we have retries left, wait and retry same model
          if (isRateLimit && attempt < maxRetries) {
            const delayMs = (attempt + 1) * 5000; // 5s, 10s
            console.log(
              `[AI Parser] Rate limited. Waiting ${
                delayMs / 1000
              }s before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          // Move to next model
          tried.push(modelName);
          break;
        }
      }
    }

    throw new Error(
      `AI Parsing failed after trying models: ${tried.join(
        ", "
      )}. Final error: ${lastError?.message || "Unknown"}`
    );
  }

  private cleanAndParseJSON(jsonString: string): ParsedResumeData {
    try {
      // Remove markdown code blocks if present
      const cleanString = jsonString
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleanString);
    } catch (error) {
      console.error("JSON Parse Error. Raw string:", jsonString);
      throw new Error("Failed to parse AI response as JSON");
    }
  }
}
