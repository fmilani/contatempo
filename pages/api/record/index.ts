import type { NextApiRequest, NextApiResponse } from 'next'
import getSession from '../../../utils/getSession'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = await getSession(req, res)

  console.log(user)
  res.send({ content: 'This is protected content. You can access this content because you are signed in.' })
}

