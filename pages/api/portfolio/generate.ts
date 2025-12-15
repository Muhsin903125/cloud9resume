
import { NextApiRequest, NextApiResponse } from 'next';
import { generatePortfolioHTML } from '../../../lib/portfolio-templates';
import { Resume, ResumeSection } from '../../../lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resume, sections, templateId, settings } = req.body as { resume: Resume; sections: ResumeSection[], templateId?: string, settings?: any };
    
    if (!resume) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    const html = generatePortfolioHTML(resume, sections || [], templateId, settings);

    return res.status(200).json({ success: true, data: { html } });
  } catch (error: any) {
    console.error('Portfolio generation error:', error);
    return res.status(500).json({ error: 'Failed to generate portfolio' });
  }
}
