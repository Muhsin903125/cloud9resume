import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { method } = req
  const { exportId } = req.query

  try {
    if (method === 'GET') {
      // Get export status and job details
      const { data: exportJob, error } = await supabase
        .from('resume_exports')
        .select('*')
        .eq('id', exportId)
        .single()

      if (error || !exportJob) {
        return res.status(404).json({ error: 'Export not found' })
      }

      // Verify user ownership
      if (exportJob.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      return res.status(200).json({
        success: true,
        data: {
          id: exportJob.id,
          status: exportJob.export_status,
          format: exportJob.format,
          fileUrl: exportJob.file_url,
          createdAt: exportJob.created_at,
          updatedAt: exportJob.updated_at,
          errorMessage: exportJob.error_message
        }
      })
    }

    if (method === 'DELETE') {
      // Cancel pending export job
      const { data: exportJob } = await supabase
        .from('resume_exports')
        .select('user_id, export_status')
        .eq('id', exportId)
        .single()

      if (!exportJob || exportJob.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      if (exportJob.export_status !== 'pending') {
        return res.status(400).json({ error: 'Can only cancel pending exports' })
      }

      const { error } = await supabase
        .from('resume_exports')
        .update({ export_status: 'cancelled' })
        .eq('id', exportId)

      if (error) throw error

      return res.status(200).json({ success: true, message: 'Export cancelled' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Export status error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
