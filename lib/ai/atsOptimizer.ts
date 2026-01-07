import { geminiFlashModel, geminiClient } from "./client";

export interface ATSAnalysisResult {
  score: number;
  match_percentage: number;
  missing_keywords: {
    skills: string[];
    experience: string[];
    summary: string[];
  };
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
        "missing_keywords": {
          "skills": ["hard skill 1", "software 1", ...],
          "experience": ["industry term 1", "responsibility keyword 1", ...],
          "summary": ["power word 1", "high-level skill 1", ...]
        },
        "found_keywords": ["keyword3", "keyword4", ...],
        "summary": "Brief analysis summary (max 2 sentences)",
        "formatting_issues": ["Issue 1", ...],
        "role_fit": "High" | "Medium" | "Low"
      }

      CRITICAL INSTRUCTIONS:
      - Be strict but fair.
      - "missing_keywords": Identify important keywords from the JD that are missing. Categorize them into:
        - "skills": Specific hard skills, tools, languages, or software.
        - "experience": Industry-specific terminology, specialized roles, or specific accomplishments/responsibilities.
        - "summary": High-level strategic keywords or overarching expertise.
      - "formatting_issues": Comment on content density, section organization, or missing essential sections.
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

      const parsed = JSON.parse(cleanText);

      // Ensure missing_keywords has the right structure even if AI fails slightly
      if (!parsed.missing_keywords || Array.isArray(parsed.missing_keywords)) {
        parsed.missing_keywords = {
          skills: Array.isArray(parsed.missing_keywords)
            ? parsed.missing_keywords
            : [],
          experience: [],
          summary: [],
        };
      }

      return parsed;
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      // Fallback response
      return {
        score: 0,
        match_percentage: 0,
        missing_keywords: { skills: [], experience: [], summary: [] },
        found_keywords: [],
        summary: "Analysis failed due to AI response error.",
        formatting_issues: [],
        role_fit: "Low",
      };
    }
  }

  /**
   * Applies ATS optimizations to resume data using AI
   * @param resumeJson The structured resume data
   * @param jobDescription The job description text
   * @param analysis The ATS analysis results
   * @returns Optimized resume data
   */
  async applyOptimizations(
    resumeJson: any,
    jobDescription: string,
    analysis: ATSAnalysisResult
  ): Promise<any> {
    const prompt = `
      You are an expert resume writer and ATS optimization specialist.
      
      I will provide you with:
      1. A Resume (in JSON format)
      2. A Job Description
      3. ATS Analysis Results (categorized missing keywords)

      Your task is to REWRITE and OPTIMIZE the resume to better match the job description.

      CRITICAL INSTRUCTIONS:
      - PLACE KEYWORDS SPECIFICALLY:
        - Add "missing_keywords.skills" specifically into the "skills" section.
        - Add "missing_keywords.experience" keywords into relevant "experience" item descriptions/highlights.
        - Add "missing_keywords.summary" keywords into the "summary" section.
      - Enhance the SUMMARY section to highlight relevant skills and align with the job.
      - Improve EXPERIENCE descriptions to emphasize achievements relevant to the job, integrating experience keywords.
      - DO NOT fabricate experience or skills - only enhance and reorganize existing content.
      - Maintain the EXACT JSON structure provided.
      - Keep all existing data, just improve wording and add missing keywords where appropriate.
      - Be professional and ATS-friendly.

      OUTPUT: Return the COMPLETE resume JSON with all sections optimized. Structure must match the input exactly.

      CATEGORIZED KEYWORDS TO ADD:
      ${JSON.stringify(analysis.missing_keywords, null, 2)}

      CURRENT RESUME JSON:
      ${JSON.stringify(resumeJson, null, 2).substring(0, 15000)}

      JOB DESCRIPTION:
      ${jobDescription.substring(0, 5000)}

      Return ONLY the optimized resume JSON, no explanations.
    `;

    const modelsToTry = [
      "gemini-2.0-flash-exp", // Best for creative rewriting
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
    ];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[ATS Optimization] Attempting with ${modelName}...`);
        const model = geminiClient.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Clean and parse the optimized resume JSON
        let cleanText = response
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        const optimizedData = JSON.parse(cleanText);
        console.log("[ATS Optimization] Successfully optimized resume");
        return optimizedData;
      } catch (error: any) {
        lastError = error;
        console.warn(
          `[ATS Optimization] Failed with ${modelName}:`,
          error.message
        );
        continue;
      }
    }

    throw new Error(
      `ATS Optimization failed after trying all models. Final error: ${
        lastError?.message || "Unknown error"
      }`
    );
  }
}

export const atsOptimizerService = new ATSOptimizerService();
