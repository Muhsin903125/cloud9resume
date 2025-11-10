import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SectionResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SectionResponse>) {
  try {
    const userId = req.headers['x-user-id'] as string
    const { id } = req.query

    if (!userId || !id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Verify resume ownership
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (resumeError || !resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' })
    }

    // POST /api/resumes/[id]/sections - Create or update section
    if (req.method === 'POST') {
      const { section_type, section_data, is_visible } = req.body

      if (!section_type) {
        return res.status(400).json({ success: false, error: 'Section type is required' })
      }

      // Upsert section
      const { data, error } = await supabase
        .from('resume_sections')
        .upsert(
          {
            resume_id: id,
            section_type,
            section_data: section_data || {},
            is_visible: is_visible !== undefined ? is_visible : true
          },
          { onConflict: 'resume_id,section_type' }
        )
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, data, message: 'Section updated successfully' })
    }

    // GET /api/resumes/[id]/sections - Get all sections
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_id', id)
        .order('order_index', { ascending: true })

      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    // DELETE /api/resumes/[id]/sections - Delete specific section
    if (req.method === 'DELETE') {
      const { section_type } = req.body

      if (!section_type) {
        return res.status(400).json({ success: false, error: 'Section type is required' })
      }

      const { error } = await supabase
        .from('resume_sections')
        .delete()
        .eq('resume_id', id)
        .eq('section_type', section_type)

      if (error) throw error

      return res.status(200).json({ success: true, message: 'Section deleted successfully' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Resume sections API error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
