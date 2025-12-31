import { geminiFlashModel, geminiClient } from "./client";

export interface ATSAnalysisResult {
  score: number;
  match_percentage: number;
  missing_keywords: string[];
  found_keywords: string[];
  summary: string;
  formatting_issues: string[];
  role_fit: "High" | "Medium" | "Low";
}

export class ATSOptimizerService {
  /**
   * Analyzes a resume against a job description using Gemini AI.
   * @param resumeJson The structured resume data
   * @param jobDescription The job description text
   * @returns ATSAnalysisResult
   */
  async analyzeResume(
    resumeJson: any,
    jobDescription: string
  ): Promise<ATSAnalysisResult> {
    const prompt = `
      You are an expert ATS (Applicant Tracking System) simulator and Resume Coach.
      
      I will provide you with:
      1. A Resume (in JSON format).
      2. A Job Description (text).

      Your task is to analyze the resume's relevance to the job description.
      
      Output MUST be a valid JSON object with this exact structure:
      {
        "score": number (0-100),
        "match_percentage": number (0-100),
        "missing_keywords": ["keyword1", "keyword2", ...],
        "found_keywords": ["keyword3", "keyword4", ...],
        "summary": "Brief analysis summary (max 2 sentences)",
        "formatting_issues": ["Issue 1", ...],
        "role_fit": "High" | "Medium" | "Low"
      }

      CRITICAL INSTRUCTIONS:
      - Be strict but fair.
      - "missing_keywords": Identify important hard skills and soft skills from the JD that are effectively missing or weak in the resume.
      - "formatting_issues": Since I am providing JSON, assume layout is handled by a standard template, but comment on content length or section organization if obvious from the data.
      - "score": A weighted score based on keywords (50%), role fit (30%), and content quality (20%).

      RESUME JSON:
      ${JSON.stringify(resumeJson).substring(0, 15000)}

      JOB DESCRIPTION:
      ${jobDescription.substring(0, 5000)}
    `;

    // Strategy: Try cheaper models first, then fallback
    const modelsToTry = [
      "gemini-1.5-flash-8b", // Cheapest, fastest
      "gemini-1.5-flash", // Fallback
      "gemini-2.0-flash-exp", // Experimental
    ];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[ATS Analysis] Attempting with ${modelName}...`);
        const model = geminiClient.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return this.cleanAndParseJSON(response);
      } catch (error: any) {
        lastError = error;
        console.warn(`[ATS Analysis] Failed with ${modelName}:`, error.message);
        continue;
      }
    }

    throw new Error(
      `ATS Analysis failed after trying all models. Final error: ${
        lastError?.message || "Unknown error"
      }`
    );
  }

  private cleanAndParseJSON(text: string): ATSAnalysisResult {
    try {
      // Remove markdown code blocks if present
      let cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Attempt to extract JSON if embedded
      const firstBrace = cleanText.indexOf("{");
      const lastBrace = cleanText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      // Fallback response
      return {
        score: 0,
        match_percentage: 0,
        missing_keywords: [],
        found_keywords: [],
        summary: "Analysis failed due to AI response error.",
        formatting_issues: [],
        role_fit: "Low",
      };
    }
  }
}

export const atsOptimizerService = new ATSOptimizerService();
