import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, creditsToAdd, planId, paymentIntentId } = req.body

    // Validate input
    if (!token || !creditsToAdd || !planId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Token, creditsToAdd, and planId are required',
      })
    }

    if (typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'creditsToAdd must be a positive number',
      })
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      })
    }

    const userId = user.id

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile does not exist',
      })
    }

    // Add credits to user profile
    const newCredits = profile.credits + creditsToAdd
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('Update credits error:', updateError)
      return res.status(500).json({
        error: 'Failed to update credits',
        message: 'Could not add credits to account',
      })
    }

    // Record credit addition in credit_usage table
    const { error: recordError } = await supabaseAdmin
      .from('credit_usage')
      .insert({
        user_id: userId,
        action: `plan_upgrade_${planId}`,
        credits_used: -creditsToAdd, // Negative to indicate credits added
        created_at: new Date().toISOString(),
      })

    if (recordError) {
      console.error('Record usage error:', recordError)
      // Don't fail if we can't record usage, but log it
    }

    return res.status(200).json({
      success: true,
      message: `${creditsToAdd} credits added successfully`,
      creditsRemaining: newCredits,
      creditsAdded: creditsToAdd,
      planId: planId,
      paymentIntentId: paymentIntentId || null,
    })
  } catch (error) {
    console.error('Add credits error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add credits',
    })
  }
}