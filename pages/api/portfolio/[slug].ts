import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  const { password } = req.body

  try {
    if (req.method === 'GET') {
      // Fetch portfolio by slug (public endpoint)
      const { data: portfolio, error } = await supabase
        .from('portfolio_links')
        .select('*, resumes(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error || !portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' })
      }

      // Check password if protected
      if (portfolio.password_hash) {
        if (!password) {
          return res.status(401).json({ error: 'Password required' })
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
        if (passwordHash !== portfolio.password_hash) {
          return res.status(401).json({ error: 'Invalid password' })
        }
      }

      // Track view
      await supabase
        .from('portfolio_analytics')
        .insert({
          portfolio_link_id: portfolio.id,
          user_id: portfolio.user_id,
          event_type: 'view',
          referrer: req.headers.referer || null,
          user_agent: req.headers['user-agent'],
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        })

      return res.status(200).json({
        success: true,
        data: {
          ...portfolio,
          resume: portfolio.resumes,
          password_hash: undefined // Never expose hash
        }
      })
    }

    if (req.method === 'POST') {
      // Track download (called from public portfolio view)
      const { data: portfolio } = await supabase
        .from('portfolio_links')
        .select('id, user_id')
        .eq('slug', slug)
        .single()

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' })
      }

      await supabase
        .from('portfolio_analytics')
        .insert({
          portfolio_link_id: portfolio.id,
          user_id: portfolio.user_id,
          event_type: 'download',
          referrer: req.headers.referer || null,
          user_agent: req.headers['user-agent'],
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Public portfolio error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
