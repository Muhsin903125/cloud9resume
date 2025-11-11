import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/backend/middleware/authMiddleware'
import { getUserById, deductUserCredits } from '../../../lib/backend/utils/tokenService'

/**
 * Example Protected Endpoint
 * 
 * This endpoint demonstrates:
 * 1. Using @withAuth middleware to verify Bearer token
 * 2. Accessing user data attached to request
 * 3. Checking user plan before processing
 * 4. Deducting credits for using a feature
 * 5. Error handling for insufficient credits
 */

const RESUME_ANALYSIS_COST = 10 // credits

export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // User is automatically attached by withAuth middleware
    const { user } = req
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { resumeText } = req.body

    if (!resumeText) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Resume text is required'
      })
    }

    // ✅ Check user plan
    // Free users can't use this feature
    if (user.plan === 'free') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This feature requires a Starter plan or higher',
        requiredPlan: 'starter'
      })
    }

    // ✅ Deduct credits
    const newBalance = await deductUserCredits(user.userId, RESUME_ANALYSIS_COST)

    if (newBalance === null) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: RESUME_ANALYSIS_COST,
        message: 'You do not have enough credits for this operation. Please purchase more credits or upgrade your plan.'
      })
    }

    // ✅ Process the resume (YOUR LOGIC HERE)
    // For this example, we'll just return a mock response
    const analysis = {
      score: 78,
      strengths: [
        'Good technical skills section',
        'Clear work experience'
      ],
      improvements: [
        'Add more quantifiable achievements',
        'Improve action verbs'
      ]
    }

    // ✅ Return response with updated credit balance
    return res.status(200).json({
      success: true,
      message: 'Resume analysis completed',
      data: analysis,
      creditsRemaining: newBalance,
      creditsCost: RESUME_ANALYSIS_COST
    })
  } catch (error) {
    console.error('Resume analysis error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to analyze resume'
    })
  }
})
