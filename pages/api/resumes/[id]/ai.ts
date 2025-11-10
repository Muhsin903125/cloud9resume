import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Mock OpenAI integration (replace with real OpenAI SDK)
const callOpenAI = async (prompt: string) => {
  // TODO: Replace with actual OpenAI API call
  // const response = await openai.createChatCompletion({...})
  return { content: `AI-enhanced result for: ${prompt}` }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { method } = req
  const { id } = req.query

  try {
    if (method === 'POST') {
      const { feature, sectionType, content } = req.body

      if (!feature) return res.status(400).json({ error: 'Feature required' })

      // Verify resume ownership
      const { data: resume } = await supabase
        .from('resumes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!resume || resume.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const creditCosts: { [key: string]: number } = {
        'generate-summary': 2,
        'optimize-keywords': 3,
        'enhance-bullets': 2,
        'cover-letter': 5,
        'grammar-check': 1,
        'section-rewrite': 4
      }

      const creditCost = creditCosts[feature] || 1

      // Check credits
      const { data: creditsData } = await supabase
        .from('credits_usage')
        .select('credits_amount')
        .eq('user_id', userId)

      const totalCredits = creditsData?.reduce((sum, c) => sum + (c.credits_amount || 0), 0) || 0

      if (totalCredits < creditCost) {
        return res.status(403).json({ error: 'Insufficient credits' })
      }

      let prompt = ''

      switch (feature) {
        case 'generate-summary':
          prompt = `Generate a professional summary for a resume based on: ${content}`
          break
        case 'optimize-keywords':
          prompt = `Optimize this resume content for ATS by adding relevant keywords: ${content}`
          break
        case 'enhance-bullets':
          prompt = `Improve these achievement bullets to be more impactful: ${content}`
          break
        case 'cover-letter':
          prompt = `Generate a professional cover letter based on: ${content}`
          break
        case 'grammar-check':
          prompt = `Check and improve the grammar in: ${content}`
          break
        case 'section-rewrite':
          prompt = `Completely rewrite this resume section professionally: ${content}`
          break
      }

      // Call OpenAI API
      const aiResponse = await callOpenAI(prompt)

      // Deduct credits
      await supabase.from('credits_usage').insert({
        user_id: userId,
        action_type: `ai_${feature}`,
        resume_id: id,
        credits_amount: creditCost,
        metadata: { section_type: sectionType }
      })

      return res.status(200).json({
        success: true,
        data: {
          feature,
          result: aiResponse.content,
          creditsCost: creditCost
        }
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('AI error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
