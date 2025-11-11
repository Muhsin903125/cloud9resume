import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateToken, verifyToken, revokeToken, deductUserCredits, addUserCredits } from '../../../lib/backend/utils/tokenService'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Comprehensive test endpoint for full authentication flow
 * 
 * Tests:
 * 1. Email signup and login
 * 2. Token generation and verification
 * 3. Protected endpoints with JWT
 * 4. Credit system (add/deduct)
 * 5. Token revocation
 * 6. Plan-based access control
 * 
 * Usage: POST /api/test/full-flow?action=<action>
 * Actions: signup, login, verify, deduct, add, revoke, cleanup
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action } = req.query as { action: string }
  const testEmail = 'test@example.com'
  const testPassword = 'TestPassword123!'

  try {
    // === ACTION: CLEANUP ===
    if (action === 'cleanup') {
      // Delete test user if exists
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', testEmail)
        .single()

      if (user) {
        // Delete related records
        await supabaseAdmin.from('user_tokens').delete().eq('user_id', user.id)
        await supabaseAdmin.from('user_credits_history').delete().eq('user_id', user.id)
        await supabaseAdmin.from('user_plans_history').delete().eq('user_id', user.id)
        await supabaseAdmin.from('users').delete().eq('id', user.id)
      }

      return res.json({
        success: true,
        message: 'Test user cleaned up',
        action: 'cleanup'
      })
    }

    // === ACTION: SIGNUP ===
    if (action === 'signup') {
      // First cleanup if exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', testEmail)
        .single()

      if (existingUser) {
        await supabaseAdmin.from('user_tokens').delete().eq('user_id', existingUser.id)
        await supabaseAdmin.from('user_credits_history').delete().eq('user_id', existingUser.id)
        await supabaseAdmin.from('user_plans_history').delete().eq('user_id', existingUser.id)
        await supabaseAdmin.from('users').delete().eq('id', existingUser.id)
      }

      // Create new user
      const bcrypt = require('bcrypt')
      const passwordHash = await bcrypt.hash(testPassword, 10)

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: testEmail,
          name: 'Test User',
          password_hash: passwordHash,
          login_provider: 'email',
          plan: 'free',
          credits: 0,
        }])
        .select('id, email, plan, credits')
        .single()

      if (createError || !newUser) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create user',
          details: createError,
          action: 'signup'
        })
      }

      // Generate token
      const token = await generateToken(newUser.id, newUser.email, newUser.plan)

      return res.json({
        success: true,
        action: 'signup',
        user: newUser,
        token: token.substring(0, 20) + '...',
        message: 'User created successfully'
      })
    }

    // === ACTION: LOGIN ===
    if (action === 'login') {
      const { data: user, error: searchError } = await supabaseAdmin
        .from('users')
        .select('id, email, password_hash, plan, credits')
        .eq('email', testEmail)
        .single()

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          action: 'login'
        })
      }

      // Verify password
      const bcrypt = require('bcrypt')
      const passwordMatch = await bcrypt.compare(testPassword, user.password_hash)

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password',
          action: 'login'
        })
      }

      // Generate token
      const token = await generateToken(user.id, user.email, user.plan)

      return res.json({
        success: true,
        action: 'login',
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          credits: user.credits
        },
        token: token.substring(0, 20) + '...',
        message: 'Login successful'
      })
    }

    // === ACTION: VERIFY TOKEN ===
    if (action === 'verify') {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token required in body',
          action: 'verify'
        })
      }

      try {
        const payload = await verifyToken(token)
        return res.json({
          success: true,
          action: 'verify',
          payload,
          message: 'Token verified successfully'
        })
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          details: (error as Error).message,
          action: 'verify'
        })
      }
    }

    // === ACTION: DEDUCT CREDITS ===
    if (action === 'deduct') {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, credits, plan')
        .eq('email', testEmail)
        .single()

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          action: 'deduct'
        })
      }

      // Try to deduct 10 credits
      const newBalance = await deductUserCredits(user.id, 10)

      if (newBalance === null) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          currentBalance: user.credits,
          action: 'deduct'
        })
      }

      return res.json({
        success: true,
        action: 'deduct',
        previousBalance: user.credits,
        newBalance,
        message: 'Credits deducted successfully'
      })
    }

    // === ACTION: ADD CREDITS ===
    if (action === 'add') {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, credits')
        .eq('email', testEmail)
        .single()

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          action: 'add'
        })
      }

      // Add 50 credits
      await addUserCredits(user.id, 50)

      // Get updated balance
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      return res.json({
        success: true,
        action: 'add',
        previousBalance: user.credits,
        newBalance: updatedUser?.credits,
        message: 'Credits added successfully'
      })
    }

    // === ACTION: REVOKE TOKEN ===
    if (action === 'revoke') {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token required in body',
          action: 'revoke'
        })
      }

      try {
        await revokeToken(token)
        return res.json({
          success: true,
          action: 'revoke',
          message: 'Token revoked successfully'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to revoke token',
          details: (error as Error).message,
          action: 'revoke'
        })
      }
    }

    // === ACTION: FULL FLOW ===
    if (action === 'full-flow') {
      const results = {
        signup: null as any,
        login: null as any,
        verifyToken: null as any,
        addCredits: null as any,
        deductCredits: null as any,
        revokeToken: null as any,
        errors: [] as any[]
      }

      try {
        // 1. Cleanup
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', testEmail)
          .single()

        if (existingUser) {
          await supabaseAdmin.from('user_tokens').delete().eq('user_id', existingUser.id)
          await supabaseAdmin.from('user_credits_history').delete().eq('user_id', existingUser.id)
          await supabaseAdmin.from('user_plans_history').delete().eq('user_id', existingUser.id)
          await supabaseAdmin.from('users').delete().eq('id', existingUser.id)
        }

        // 2. Signup
        const bcrypt = require('bcrypt')
        const passwordHash = await bcrypt.hash(testPassword, 10)
        const { data: newUser } = await supabaseAdmin
          .from('users')
          .insert([{
            email: testEmail,
            name: 'Test User',
            password_hash: passwordHash,
            login_provider: 'email',
            plan: 'free',
            credits: 0,
          }])
          .select('id, email, plan, credits')
          .single()

        results.signup = { success: !!newUser, user: newUser?.email }

        if (!newUser) throw new Error('Signup failed')

        // 3. Login
        const { data: loginUser } = await supabaseAdmin
          .from('users')
          .select('id, email, password_hash, plan, credits')
          .eq('email', testEmail)
          .single()

        const passwordMatch = await bcrypt.compare(testPassword, loginUser?.password_hash)
        results.login = { success: passwordMatch, user: loginUser?.email }

        if (!passwordMatch) throw new Error('Login failed')

        // 4. Generate token
        const token = await generateToken(newUser.id, newUser.email, newUser.plan)
        results.verifyToken = { success: true, tokenPrefix: token.substring(0, 20) }

        // 5. Verify token
        const payload = await verifyToken(token)
        if (payload) {
          results.verifyToken.verified = { userId: payload.userId, email: payload.email, plan: payload.plan }
        }

        // 6. Add credits
        await addUserCredits(newUser.id, 100)
        const { data: userAfterAdd } = await supabaseAdmin
          .from('users')
          .select('credits')
          .eq('id', newUser.id)
          .single()
        results.addCredits = { success: true, newBalance: userAfterAdd?.credits }

        // 7. Deduct credits
        const newBalance = await deductUserCredits(newUser.id, 30)
        results.deductCredits = { success: newBalance !== null, newBalance }

        // 8. Revoke token
        await revokeToken(token)
        try {
          await verifyToken(token)
          results.revokeToken = { success: false, message: 'Token still valid after revocation' }
        } catch {
          results.revokeToken = { success: true, message: 'Token properly revoked' }
        }

        return res.json({
          success: true,
          action: 'full-flow',
          results,
          message: 'Full flow test completed successfully'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          action: 'full-flow',
          results,
          error: (error as Error).message
        })
      }
    }

    return res.status(400).json({
      error: 'Invalid action',
      message: 'Available actions: signup, login, verify, deduct, add, revoke, full-flow, cleanup'
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message,
      action
    })
  }
}
