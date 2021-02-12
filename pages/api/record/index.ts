import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) {
    res.status(401).send('unauthorized')
    return
  }

  res.send({ content: 'This is protected content. You can access this content because you are signed in.' })
}

