import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error, error_description } = req.query

  if (error) {
    return res.redirect(307, `/auth/github/callback?error=${error}&error_description=${error_description}`)
  }

  return res.redirect(307, `/auth/github/callback?code=${code}`)
}
