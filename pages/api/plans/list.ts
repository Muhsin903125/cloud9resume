import { NextApiRequest, NextApiResponse } from 'next'

export interface Plan {
  id: string
  name: string
  displayName: string
  price: number
  billingPeriod: 'monthly' | 'yearly'
  credits: number
  features: string[]
  isPopular?: boolean
  description: string
}

// Define all available plans
const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    displayName: 'Free Plan',
    price: 0,
    billingPeriod: 'monthly',
    credits: 5,
    description: 'Perfect for getting started',
    features: [
      '5 AI Resume Credits',
      '1 Resume Upload',
      'Basic ATS Scoring',
      'Community Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro Plan',
    price: 9.99,
    billingPeriod: 'monthly',
    credits: 100,
    isPopular: true,
    description: 'Best for job seekers',
    features: [
      '100 AI Resume Credits',
      'Unlimited Resumes',
      'Advanced ATS Scoring',
      'AI Resume Suggestions',
      'Portfolio Builder',
      'Email Support',
      'Cancel Anytime',
    ],
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro Plus',
    displayName: 'Pro Plus Plan',
    price: 19.99,
    billingPeriod: 'monthly',
    credits: 300,
    description: 'For career professionals',
    features: [
      '300 AI Resume Credits',
      'Unlimited Resumes',
      'Priority ATS Scoring',
      'AI Resume Suggestions',
      'Portfolio Builder',
      'Interview Prep',
      'Priority Email Support',
      'Phone Support',
      'Cancel Anytime',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise Plan',
    price: 0, // Custom pricing
    billingPeriod: 'yearly',
    credits: 1000,
    description: 'For teams and organizations',
    features: [
      'Unlimited Credits',
      'Unlimited Users',
      'Custom Integrations',
      'Dedicated Account Manager',
      'Advanced Analytics',
      '24/7 Phone Support',
      'Custom SLA',
      'On-Premise Option',
    ],
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get specific plan if ID provided
    const { id } = req.query

    if (id && typeof id === 'string') {
      const plan = PLANS[id]
      if (!plan) {
        return res.status(404).json({
          error: 'Plan not found',
          message: `Plan with ID '${id}' does not exist`,
        })
      }
      return res.status(200).json({ data: plan })
    }

    // Return all plans sorted by price
    const plans = Object.values(PLANS)
      .filter(plan => plan.id !== 'enterprise') // Enterprise shown separately
      .sort((a, b) => a.price - b.price)

    return res.status(200).json({
      data: plans,
      enterprise: PLANS.enterprise,
    })
  } catch (error) {
    console.error('Fetch plans error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch plans',
    })
  }
}