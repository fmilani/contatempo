import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession as nextAuthSession } from 'next-auth/client'

export default async function getSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await nextAuthSession({ req })
  if (!session) res.status(401).send('unauthorized')
  return session
}
