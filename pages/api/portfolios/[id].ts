import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    const decoded = jwt.decode(token) as any
    if (!decoded) return null
    return decoded.sub || decoded.userId || null
  } catch (error) {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
     return res.status(400).json({ success: false, error: 'Invalid ID' })
  }

  try {
    const userId = extractUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
    
    if (checkError || !existing) {
        return res.status(404).json({ success: false, error: 'Portfolio not found' })
    }

    if (req.method === 'PATCH') {
      const updates = req.body
      // Prevent updating sensitive fields if necessary, e.g. user_id
      delete updates.id
      delete updates.user_id
      delete updates.created_at

      const { data, error } = await supabase
        .from('portfolios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ success: true, data })
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ success: true, message: 'Deleted successfully' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Portfolio API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
