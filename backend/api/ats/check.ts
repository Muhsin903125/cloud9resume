import { ApiResponse, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { withAuth } from '../../middleware/authMiddleware';
import { supabase } from '../../supabaseClient';
import { validateData, atsCheckSchema } from '../../utils/validator';
import { emailSender } from '../../utils/emailSender';

async function handler(req: AuthenticatedRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = validateData(atsCheckSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { resumeId, jobDescription } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('data, title')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Perform ATS analysis (simplified version)
    const analysis = performATSAnalysis(resume.data, jobDescription);

    // Store analysis result
    const { data: atsResult, error: atsError } = await supabase
      .from('ats_results')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        job_description: jobDescription,
        score: analysis.score,
        analysis: analysis,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (atsError) {
      return res.status(500).json({
        error: 'Failed to save ATS analysis',
        message: atsError.message
      });
    }

    return res.status(200).json({
      success: true,
      analysis: atsResult,
    });
  } catch (error) {
    console.error('ATS check error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'ATS analysis failed'
    });
  }
}

function performATSAnalysis(resumeData: any, jobDescription: string): any {
  // Simplified ATS analysis logic
  const resumeText = extractResumeText(resumeData);
  const jobKeywords = extractKeywords(jobDescription);

  const presentKeywords = jobKeywords.filter(keyword =>
    resumeText.toLowerCase().includes(keyword.toLowerCase())
  );

  const missingKeywords = jobKeywords.filter(keyword =>
    !resumeText.toLowerCase().includes(keyword.toLowerCase())
  );

  // Calculate score based on keyword match
  const score = Math.round((presentKeywords.length / jobKeywords.length) * 100);

  // Identify common issues
  const issues = [];
  if (!resumeData.personalInfo.email) issues.push('Missing email contact information');
  if (!resumeData.personalInfo.phone) issues.push('Missing phone contact information');
  if (resumeData.experience.length === 0) issues.push('No work experience listed');
  if (resumeData.skills.length === 0) issues.push('No skills listed');

  // Generate recommendations
  const recommendations = [];
  if (missingKeywords.length > 0) {
    recommendations.push(`Add these missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  if (score < 70) {
    recommendations.push('Consider tailoring your resume more closely to the job description');
  }
  if (issues.length > 0) {
    recommendations.push('Complete all required sections of your resume');
  }

  return {
    score,
    keywords: {
      present: presentKeywords,
      missing: missingKeywords,
    },
    issues,
    recommendations,
  };
}

function extractResumeText(resumeData: any): string {
  let text = '';

  // Personal info
  text += `${resumeData.personalInfo.name} ${resumeData.personalInfo.email} `;

  // Summary
  text += `${resumeData.summary} `;

  // Experience
  resumeData.experience.forEach((exp: any) => {
    text += `${exp.title} ${exp.company} ${exp.description} `;
  });

  // Education
  resumeData.education.forEach((edu: any) => {
    text += `${edu.degree} ${edu.school} `;
  });

  // Skills
  text += resumeData.skills.join(' ');

  return text;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in reality, you'd use NLP
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
}

export default withAuth(handler);