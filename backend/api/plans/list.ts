import { ApiRequest, ApiResponse } from '../../middleware/authMiddleware';
import { supabase } from '../../supabaseClient';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 5,
    features: [
      '3 Resume Templates',
      'Basic ATS Check',
      'PDF Export',
      'Email Support'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    credits: 50,
    features: [
      'All Templates',
      'Advanced ATS Check',
      'PDF & Word Export',
      'Portfolio Builder',
      'Priority Support',
      'Custom Branding'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    credits: 150,
    features: [
      'Everything in Starter',
      'Unlimited Resumes',
      'Advanced Analytics',
      'Team Collaboration',
      'API Access',
      'White-label Solution'
    ]
  }
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real implementation, you might fetch plans from database
    // For now, return static plans data
    return res.status(200).json({
      plans: PLANS,
      success: true
    });
  } catch (error) {
    console.error('List plans error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch plans'
    });
  }
}