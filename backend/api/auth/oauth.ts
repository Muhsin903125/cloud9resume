import { ApiRequest, ApiResponse } from '../../middleware/authMiddleware';
import { supabase } from '../../supabaseClient';
import { validateData, oauthSchema } from '../../utils/validator';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = validateData(oauthSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { provider, code, redirectUri } = validation.data;

    let authResult;

    switch (provider) {
      case 'google':
        authResult = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUri,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        break;

      case 'linkedin':
        // LinkedIn OAuth implementation
        authResult = await supabase.auth.signInWithOAuth({
          provider: 'linkedin',
          options: {
            redirectTo: redirectUri,
          },
        });
        break;

      case 'github':
        authResult = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: redirectUri,
          },
        });
        break;

      default:
        return res.status(400).json({
          error: 'Invalid provider',
          message: 'Supported providers: google, linkedin, github'
        });
    }

    if (authResult.error) {
      return res.status(400).json({
        error: 'OAuth authentication failed',
        message: authResult.error.message
      });
    }

    // For server-side OAuth, we typically redirect to the auth URL
    // For API-based OAuth, we might exchange the code for tokens
    return res.status(200).json({
      url: authResult.data.url,
      provider,
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'OAuth authentication failed'
    });
  }
}