import { ApiRequest, ApiResponse, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { withAuth } from '../../middleware/authMiddleware';
import { supabase } from '../../supabaseClient';
import { validateData, creditUsageSchema } from '../../utils/validator';

const CREDIT_COSTS = {
  resume_create: 2,
  resume_export: 1,
  ats_check: 3,
  portfolio_create: 5,
};

async function handler(req: AuthenticatedRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = validateData(creditUsageSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { action, resumeId, portfolioId } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cost = CREDIT_COSTS[action];

    // Check current credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (profile.credits < cost) {
      return res.status(402).json({
        error: 'Insufficient credits',
        message: `This action requires ${cost} credits. You have ${profile.credits} credits.`,
        required: cost,
        available: profile.credits
      });
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - cost })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to deduct credits' });
    }

    // Log credit usage
    const { error: logError } = await supabase
      .from('credit_usage')
      .insert({
        user_id: userId,
        action,
        credits_used: cost,
        resume_id: resumeId,
        portfolio_id: portfolioId,
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Credit usage logging error:', logError);
    }

    return res.status(200).json({
      success: true,
      credits_used: cost,
      remaining_credits: profile.credits - cost,
    });
  } catch (error) {
    console.error('Use credit error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to use credits'
    });
  }
}

export default withAuth(handler);