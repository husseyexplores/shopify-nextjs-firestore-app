import type { NextApiRequest, NextApiResponse } from 'next'
import withMiddleware from '~/utils/middleware/withMiddleware'
import shopify from '~/utils/shopify'
import * as db from '~/db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //Reject anything that's not a POST
  if (req.method !== 'POST') {
    return res.status(400).send({ text: "We don't do that here." })
  }

  try {
    const sessionId = await shopify.session.getCurrentId({
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    })
    if (sessionId) {
      const session = await db.sessions.load(sessionId)
      if (!session) throw new Error('Session not found')

      const response = await shopify.clients.graphqlProxy({
        session,
        rawBody: req.body,
      })
      return res.status(200).send(response.body)
    }
  } catch (e) {
    console.error('An error occured at /api/graphql', e)
    return res.status(403).send(e)
  }
}

withMiddleware('verifyRequest')(handler)
