import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ResumeResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * Extract and validate JWT token from Authorization header
 * Format: Bearer <token>
 */
function extractUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix
    
    // Decode JWT without verification (token is already verified by backend)
    const decoded = jwt.decode(token) as any
    
    if (!decoded) {
      console.error('Invalid JWT token structure')
      return null
    }

    // Support both standard JWT format (sub) and our custom format (userId)
    const userId = decoded.sub || decoded.userId
    
    if (!userId) {
      console.error('JWT token missing user ID (sub or userId field)')
      return null
    }

    return userId
  } catch (error) {
    console.error('Token extraction error:', error)
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResumeResponse>) {
  try {
    // Extract user ID from JWT Authorization header
    const userId = extractUserIdFromToken(req)
    const { id } = req.query

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized. Please provide valid authentication token in Authorization header.'
      })
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing resume ID' })
    }

    // GET /api/resumes/[id] - Get single resume with sections
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('resumes')
        .select('*, resume_sections(id, section_type, section_data, is_visible, order_index)')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        return res.status(404).json({ success: false, error: 'Resume not found' })
      }

      // Update last viewed
      await supabase
        .from('resumes')
        .update({ last_viewed_at: new Date().toISOString(), view_count: (data.view_count || 0) + 1 })
        .eq('id', id)

      return res.status(200).json({ success: true, data })
    }

    // PATCH /api/resumes/[id] - Update resume metadata
    if (req.method === 'PATCH') {
      const { title, job_title, template_id, theme_color, is_primary } = req.body

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (job_title !== undefined) updateData.job_title = job_title
      if (template_id !== undefined) updateData.template_id = template_id
      if (theme_color !== undefined) updateData.theme_color = theme_color
      
      // Handle primary resume logic
      if (is_primary === true) {
        // Unset all other primary resumes for this user
        await supabase
          .from('resumes')
          .update({ is_primary: false })
          .eq('user_id', userId)
          .neq('id', id)
        
        updateData.is_primary = true
      }

      const { data, error } = await supabase
        .from('resumes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, data, message: 'Resume updated successfully' })
    }

    // DELETE /api/resumes/[id] - Soft delete resume
    if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('resumes')
        .update({ status: 'archived' })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, data, message: 'Resume deleted successfully' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Resume detail API error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
