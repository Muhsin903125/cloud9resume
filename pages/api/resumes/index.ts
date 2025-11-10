import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ResumeResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResumeResponse>) {
  try {
    const userId = req.headers['x-user-id'] as string

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // GET /api/resumes - List all resumes
      const { data, error } = await supabase
        .from('resumes')
        .select('*, resume_sections(id, section_type, section_data)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    if (req.method === 'POST') {
      // POST /api/resumes - Create new resume
      const { title, job_title, template_id } = req.body

      if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' })
      }

      // Check resume limit based on plan
      const { data: userPlan, error: planError } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', userId)
        .single()

      if (planError) throw planError

      const limits: Record<string, number> = { free: 1, starter: 3, pro: 10, pro_plus: 100 }
      const limit = limits[userPlan?.plan || 'free'] || 1

      const { count, error: countError } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'draft')

      if (countError) throw countError

      if (count && count >= limit) {
        return res.status(400).json({
          success: false,
          error: `Resume limit reached. Upgrade your plan to create more resumes.`
        })
      }

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          title,
          job_title,
          template_id,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, data, message: 'Resume created successfully' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Resume API error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
