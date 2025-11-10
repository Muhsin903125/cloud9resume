import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TemplatesResponse {
  success: boolean
  data?: any
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TemplatesResponse>) {
  try {
    if (req.method === 'GET') {
      const { category, plan } = req.query

      let query = supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }

      if (plan) {
        // Filter templates by plan access
        const plans = ['free', 'starter', 'pro', 'pro_plus']
        const planIndex = plans.indexOf(plan as string)
        
        if (planIndex >= 0) {
          query = query.in('requires_plan', plans.slice(0, planIndex + 1))
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Templates API error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
