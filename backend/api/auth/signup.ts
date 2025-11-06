import { ApiRequest, ApiResponse } from '../../middleware/authMiddleware';
import { supabase } from '../../supabaseClient';
import { validateData, signupSchema } from '../../utils/validator';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = validateData(signupSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { email, password, firstName, lastName } = validation.data;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        }
      }
    });

    if (error) {
      return res.status(400).json({
        error: 'Registration failed',
        message: error.message
      });
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          credits: 5, // Free credits for new users
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return res.status(201).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Registration failed'
    });
  }
}