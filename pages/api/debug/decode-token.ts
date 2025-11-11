import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

/**
 * Debug endpoint to decode JWT token and show what's inside
 * GET /api/debug/decode-token
 * Authorization: Bearer <token>
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        error: 'Missing or invalid Authorization header',
        hint: 'Include Authorization: Bearer <token>'
      })
    }

    const token = authHeader.substring(7)
    
    // Decode without verification to see what's inside
    const decoded = jwt.decode(token, { complete: true })
    
    if (!decoded) {
      return res.status(400).json({
        error: 'Invalid token - could not decode'
      })
    }

    return res.status(200).json({
      success: true,
      decoded: {
        header: decoded.header,
        payload: decoded.payload
      },
      raw: token.substring(0, 50) + '...'
    })
  } catch (error) {
    console.error('Token decode error:', error)
    return res.status(500).json({
      error: 'Failed to decode token',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
