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
  const { id } = req.query

  try {
    if (method === 'GET') {
      // Fetch resume versions
      const { data: versions, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', id)
        .order('version_number', { ascending: false })

      if (error) throw error

      // Verify ownership
      const { data: resume } = await supabase
        .from('resumes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!resume || resume.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      return res.status(200).json({ success: true, data: versions })
    }

    if (method === 'POST') {
      // Restore version
      const { versionNumber } = req.body

      // Verify ownership
      const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (!resume) return res.status(403).json({ error: 'Forbidden' })

      // Get version to restore
      const { data: version, error: versionError } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', id)
        .eq('version_number', versionNumber)
        .single()

      if (versionError || !version) {
        return res.status(404).json({ error: 'Version not found' })
      }

      // Restore sections from snapshot
      const snapshot = version.snapshot_data
      
      // Delete current sections
      await supabase.from('resume_sections').delete().eq('resume_id', id)

      // Insert snapshot sections
      const sectionsToInsert = (snapshot.sections || []).map((section: any) => ({
        resume_id: id,
        section_type: section.section_type,
        section_data: section.section_data,
        order_index: section.order_index,
        is_visible: section.is_visible
      }))

      if (sectionsToInsert.length > 0) {
        await supabase.from('resume_sections').insert(sectionsToInsert)
      }

      // Update resume metadata
      await supabase
        .from('resumes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id)

      return res.status(200).json({ success: true, message: 'Version restored' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Versions error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
