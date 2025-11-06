import { ApiResponse, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { withAuth } from '../../middleware/authMiddleware';
import { supabase } from '../../supabaseClient';
import { validateData, resumeCreateSchema } from '../../utils/validator';

async function handler(req: AuthenticatedRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = validateData(resumeCreateSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { title, template, data } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title,
        template,
        data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Failed to create resume',
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Create resume error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create resume'
    });
  }
}

export default withAuth(handler);