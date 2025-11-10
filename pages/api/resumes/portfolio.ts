import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface PortfolioResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PortfolioResponse>) {
  try {
    const userId = req.headers['x-user-id'] as string

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    if (req.method === 'POST') {
      const { resumeId, slug, isPublished, templateId, showProjects, passwordProtected, password } = req.body

      if (!resumeId) {
        return res.status(400).json({ success: false, error: 'Resume ID is required' })
      }

      // Verify resume ownership
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('id')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single()

      if (resumeError || !resume) {
        return res.status(404).json({ success: false, error: 'Resume not found' })
      }

      let passwordHash = null
      if (passwordProtected && password) {
        passwordHash = crypto.createHash('sha256').update(password).digest('hex')
      }

      const { data, error } = await supabase
        .from('portfolio_links')
        .upsert(
          {
            resume_id: resumeId,
            user_id: userId,
            slug: slug || crypto.randomBytes(8).toString('hex').slice(0, 12),
            is_published: isPublished || false,
            template_id: templateId,
            show_projects: showProjects !== undefined ? showProjects : true,
            password_protected: passwordProtected || false,
            password_hash: passwordHash
          },
          { onConflict: 'resume_id' }
        )
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({
        success: true,
        data,
        message: isPublished ? 'Portfolio published successfully' : 'Portfolio draft saved'
      })
    }

    // GET /api/resumes/portfolio - Get portfolio links
    if (req.method === 'GET') {
      const { resumeId } = req.query

      let query = supabase
        .from('portfolio_links')
        .select('*, portfolio_analytics(event_type, count:id)')
        .eq('user_id', userId)

      if (resumeId) {
        query = query.eq('resume_id', resumeId)
      }

      const { data, error } = await query

      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    // PATCH /api/resumes/portfolio - Update portfolio link
    if (req.method === 'PATCH') {
      const { portfolioId, isPublished, isPrimary } = req.body

      if (!portfolioId) {
        return res.status(400).json({ success: false, error: 'Portfolio ID is required' })
      }

      const updateData: any = {}
      if (isPublished !== undefined) updateData.is_published = isPublished
      if (isPrimary !== undefined) {
        // Unset other primary portfolios
        if (isPrimary) {
          await supabase
            .from('portfolio_links')
            .update({ is_primary: false })
            .eq('user_id', userId)
            .neq('id', portfolioId)
        }
        updateData.is_primary = isPrimary
      }

      const { data, error } = await supabase
        .from('portfolio_links')
        .update(updateData)
        .eq('id', portfolioId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Portfolio API error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
