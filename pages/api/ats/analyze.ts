import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import {
  analyzeKeywordMatch,
  detectSections,
  generateInsights,
  calculateATSScore,
  generateHTMLReport,
  type ATSAnalysisResult,
} from "@/lib/backend/atsAnalysis";
import {
  extractKeywords,
  extractPhrases,
  normalizeText,
} from "@/lib/backend/textExtraction";

interface ATSAnalysisResponse {
  success: boolean;
  data?: ATSAnalysisResult;
  error?: string;
}

// Industry-standard keywords for different roles
const INDUSTRY_KEYWORDS = {
  technical: [
    // Programming Languages & Runtimes
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "php",
    "ruby",
    "golang",
    "rust",
    "swift",
    "kotlin",
    "scala",
    "r",
    "matlab",
    "perl",
    "groovy",
    "haskell",
    "clojure",
    "elixir",
    "dart",
    "assembly",
    "fortran",
    "cobol",
    "lisp",
    "prolog",
    "erlang",
    "f#",
    "objective-c",

    // Frontend Ecosystem
    "react",
    "angular",
    "vue",
    "svelte",
    "next.js",
    "nuxt",
    "gatsby",
    "remix",
    "ember",
    "backbone",
    "knockout",
    "alpine",
    "solid.js",
    "qwik",
    "tailwind",
    "bootstrap",
    "sass",
    "less",
    "styled-components",
    "emotion",
    "material ui",
    "shadcn",
    "framer motion",
    "three.js",
    "d3.js",
    "webgl",
    "pwa",
    "ssr",
    "csr",
    "isr",
    "hydration",
    "virtual dom",

    // Backend & APIs
    "node.js",
    "express",
    "django",
    "flask",
    "spring boot",
    "laravel",
    "asp.net core",
    "fastapi",
    "nestjs",
    "rails",
    "graphql",
    "rest",
    "restful",
    "grpc",
    "trpc",
    "soap",
    "websocket",
    "mqtt",
    "amqp",
    "microservices",
    "serverless",
    "monolith",
    "event-driven architecture",
    "pub/sub",

    // Cloud & Infrastructure (Expanded)
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "terraform",
    "ansible",
    "pulumi",
    "docker",
    "kubernetes",
    "k8s",
    "helm",
    "argocd",
    "jenkins",
    "github actions",
    "gitlab ci",
    "circleci",
    "terraform cloud",
    "cloudformation",
    "vpcs",
    "ec2",
    "s3",
    "lambda",
    "fargate",
    "eks",
    "gke",
    "aks",
    "serverless framework",

    // Databases & Storage
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "elasticsearch",
    "cassandra",
    "dynamodb",
    "firebase",
    "supabase",
    "prisma",
    "sequelize",
    "typeorm",
    "mongoose",
    "snowflake",
    "bigquery",
    "redshift",
    "clickhouse",
    "neo4j",
    "milvus",
    "pinecone",

    // AI, ML & Data Science
    "machine learning",
    "deep learning",
    "ai",
    "neural networks",
    "nlp",
    "llm",
    "generative ai",
    "pytorch",
    "tensorflow",
    "scikit-learn",
    "pandas",
    "numpy",
    "opencv",
    "stable diffusion",
    "transformers",
    "langchain",
    "llama-index",
    "vector databases",
    "rpa",
    "data engineering",
    "etl",
    "dbt",
    "airflow",

    // Security & Compliance
    "cybersecurity",
    "penetration testing",
    "soc2",
    "iso 27001",
    "hipaa",
    "gdpr",
    "oauth2",
    "openid connect",
    "jwt",
    "saml",
    "zero trust",
    "iam",
    "waf",
    "encryption",
    "ssl/tls",
    "pci-dss",
    "siem",
    "edr",
    "incident response",

    // Testing & Quality
    "jest",
    "cypress",
    "playwright",
    "selenium",
    "vitest",
    "unit testing",
    "e2e testing",
    "integration testing",
    "tdd",
    "bdd",
    "storybook",
    "qa automation",
  ],

  business: [
    // Execution & Management
    "project management",
    "product management",
    "agile",
    "scrum",
    "kanban",
    "pmp",
    "prince2",
    "okrs",
    "kpis",
    "lean six sigma",
    "change management",
    "stakeholder management",
    "risk assessment",
    "budgeting",
    "forecasting",

    // Sales, Marketing & Growth
    "business development",
    "salesforce",
    "crm",
    "saas",
    "b2b",
    "b2c",
    "lead generation",
    "market research",
    "seo",
    "sem",
    "content strategy",
    "growth hacking",
    "product-led growth",
    "conversion optimization",
    "marketing automation",

    // Strategy & Leadership
    "strategic planning",
    "executive leadership",
    "operational excellence",
    "digital transformation",
    "business analysis",
    "consulting",
    "m&a",
    "process improvement",
    "efficiency optimization",
    "cost reduction",
    "scalability",
    "innovation strategy",
    "product roadmap",
  ],

  soft_skills: [
    "collaboration",
    "communication",
    "problem solving",
    "critical thinking",
    "leadership",
    "mentorship",
    "adaptability",
    "resilience",
    "emotional intelligence",
    "empathy",
    "negotiation",
    "influence",
    "conflict resolution",
    "time management",
    "public speaking",
    "presentation",
    "active listening",
    "accountability",
    "ownership",
    "attention to detail",
    "curiosity",
    "growth mindset",
  ],
};

// Result-oriented action verbs (high impact)
const ACTION_VERBS = [
  "orchestrated",
  "spearheaded",
  "pioneered",
  "engineered",
  "architected",
  "transformed",
  "optimized",
  "scaled",
  "accelerated",
  "surpassed",
  "automated",
  "deciphered",
  "centralized",
  "revitalized",
  "modernized",
  "leveraged",
  "facilitated",
  "maximized",
  "mitigated",
  "streamlined",
  "pioneered",
  "yielded",
  "navigated",
  "integrated",
  "conceptualized",
  "delivered",
  "executed",
  "resolved",
  "mentored",
  "innovated",
  "achieved",
  "attained",
  "cultivated",
  "influenced",
  "negotiated",
  "captured",
  "outpaced",
  "expanded",
  "fortified",
  "standardized",
];

// Initialize Supabase only if env vars are present
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      "Missing Supabase environment variables. DB saving will be skipped.",
    );
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ATSAnalysisResponse>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Resume text and job description are required",
      });
    }

    // Extract keywords from job description and resume
    const resumeKeywords = extractKeywords(resumeText);
    const resumePhrases = extractPhrases(resumeText);
    const allResumeKeywords = [...resumeKeywords, ...resumePhrases];

    const jdKeywords = extractKeywords(jobDescription);
    const jdPhrases = extractPhrases(jobDescription);
    const allJDKeywords = [...jdKeywords, ...jdPhrases];

    // Analyze keyword matching with weighted intelligence
    const matchAnalysis = analyzeKeywordMatch(
      allResumeKeywords,
      allJDKeywords,
      INDUSTRY_KEYWORDS.technical,
    );

    // Create analysis result
    const analysis: ATSAnalysisResult = {
      score: matchAnalysis.score,
      matchPercentage: matchAnalysis.matchPercentage,
      matchedKeywords: matchAnalysis.matched,
      missingKeywords: matchAnalysis.missing,
      keywordStats: {
        totalJDKeywords: allJDKeywords.length,
        matchedCount: matchAnalysis.matched.length,
        matchPercentage: matchAnalysis.matchPercentage,
      },
      sections: detectSections(resumeText),
      insights: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
    };

    // Generate insights
    const insightsResult = generateInsights(
      analysis,
      resumeText,
      jobDescription,
    );
    analysis.insights = insightsResult.insights;
    analysis.strengths = insightsResult.strengths;
    analysis.weaknesses = insightsResult.weaknesses;
    analysis.recommendations = insightsResult.recommendations;

    // Calculate final score
    analysis.score = calculateATSScore(analysis);

    // Save to Database
    try {
      const supabaseAdmin = getSupabaseAdmin();
      if (supabaseAdmin) {
        const { error: dbError } = await supabaseAdmin
          .from("ats_analyses")
          .insert({
            resume_text: resumeText,
            job_description: jobDescription,
            score: analysis.score,
            match_percentage: analysis.matchPercentage,
            keywords_found: analysis.matchedKeywords,
            keywords_missing: analysis.missingKeywords,
          });

        if (dbError) {
          console.error("Failed to save analysis to DB:", dbError);
        }
      }
    } catch (saveError) {
      console.error("Error saving to DB:", saveError);
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("ATS Analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze resume",
    });
  }
}
