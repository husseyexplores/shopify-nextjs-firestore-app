import type { NextApiRequest, NextApiResponse } from 'next'
import {
  CookieNotFound,
  InvalidOAuthError,
  InvalidSession,
} from '@shopify/shopify-api'
import * as db from '~/db'

import shopify from '~/utils/shopify'
import { getErrorMsg } from '~/utils/error'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    })

    // this is offline session
    const { session } = callbackResponse

    await db.sessions.save(session)

    const webhookRegisterResponse = await shopify.webhooks.register({
      session,
    })
    console.log('--> webhookRegisterResponse', webhookRegisterResponse)

    res.setHeader('Cache-Control', 'private')
    return shopify.auth.begin({
      shop: session.shop,
      callbackPath: `/api/auth/callback`,
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    })
  } catch (e) {
    console.error(`---> Error at /auth/tokens`, e)

    const shop =
      req.query.shop && typeof req.query.shop === 'string'
        ? req.query.shop
        : null

    if (shop) {
      await db.active_stores.setActive(shop, false)
    }

    switch (true) {
      case e instanceof InvalidOAuthError:
        res.status(400).send(getErrorMsg(e, 'Invalid OAuth error'))
        break
      case e instanceof CookieNotFound:
      case e instanceof InvalidSession:
        if (shop) {
          await db.sessions.removeAllByShop(shop)
        }
        res.redirect(`/api/auth?shop=${shop ?? ''}`)
        break
      default:
        res.status(500).send(getErrorMsg(e, 'Unknown at /auth/tokens'))
        break
    }
  }
}

export default handler
