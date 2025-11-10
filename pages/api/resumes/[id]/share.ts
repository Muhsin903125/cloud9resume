import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { method } = req
  const { id } = req.query

  try {
    if (method === 'POST') {
      // Create share
      const { email, expiresIn } = req.body

      if (!email) return res.status(400).json({ error: 'Email required' })

      // Verify resume ownership
      const { data: resume } = await supabase
        .from('resumes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!resume || resume.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Generate share token
      const shareToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + (expiresIn || 7 * 24 * 60 * 60 * 1000)).toISOString()

      const { data: share, error } = await supabase
        .from('resume_shares')
        .insert({
          resume_id: id,
          shared_by: userId,
          shared_with_email: email,
          share_token: shareToken,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) throw error

      // TODO: Send email with share link

      return res.status(201).json({ success: true, data: share })
    }

    if (method === 'GET') {
      // Get resume shares
      const { data: resume } = await supabase
        .from('resumes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!resume || resume.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { data: shares, error } = await supabase
        .from('resume_shares')
        .select('*')
        .eq('resume_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json({ success: true, data: shares })
    }

    if (method === 'DELETE') {
      // Revoke share
      const { shareId } = req.body

      if (!shareId) return res.status(400).json({ error: 'Share ID required' })

      const { data: resume } = await supabase
        .from('resumes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!resume || resume.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { error } = await supabase
        .from('resume_shares')
        .delete()
        .eq('id', shareId)
        .eq('resume_id', id)

      if (error) throw error

      return res.status(200).json({ success: true, message: 'Share revoked' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Share error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
