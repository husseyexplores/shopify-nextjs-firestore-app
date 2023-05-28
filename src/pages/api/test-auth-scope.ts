import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '~/db'
import { env } from '~/env'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const sessionId = req.query.sessionId
    if (typeof sessionId === 'string') {
      const session = await db.sessions.load(sessionId)
      if (!session) {
        return res.status(200).json({
          __id: sessionId,
          message: 'Not found',
          SHOPIFY_APP_SCOPES: env.SHOPIFY_APP_SCOPES,
        })
      }

      return res.status(200).json({
        __id: sessionId,
        session: session,
        active_shopify: session.isActive(env.SHOPIFY_APP_SCOPES.list),
        active_custom: db.sessions.isActiveSession(session),
        SHOPIFY_APP_SCOPES: env.SHOPIFY_APP_SCOPES,
      })
    }

    res.status(200).json({
      message: 'ok',
      SHOPIFY_APP_SCOPES: env.SHOPIFY_APP_SCOPES,
    })
  } else {
    res.status(400).send({ text: 'Bad request' })
  }
}
