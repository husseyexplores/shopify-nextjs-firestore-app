import type { NextApiRequest, NextApiResponse } from 'next'
import {
  CookieNotFound,
  InvalidOAuthError,
  InvalidSession,
} from '@shopify/shopify-api'
import shopify from '~/utils/shopify'
import * as db from '~/db'
import { getErrorMsg } from '~/utils/error'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let shop = typeof req.query.shop === 'string' ? req.query.shop : null

  try {
    if (!shop) {
      res.status(500)
      return res.send('No shop provided')
    }

    if (req.query.embedded === '1') {
      shop = shopify.utils.sanitizeShop(shop)
      if (!shop) throw new Error('Invalid `shop` query param')

      // return res.redirect(`/exitframe/${shop}`)
      const queryParams = new URLSearchParams({
        ...req.query,
        shop,
        redirectUri: `/api/auth?shop=${shop}&host=${req.query.host}`,
      }).toString()

      return res.redirect(`/exitframe/${shop}?${queryParams}`)
    }

    res.setHeader('Cache-Control', 'private')
    return shopify.auth.begin({
      shop,
      callbackPath: `/api/auth/tokens`,
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    })
  } catch (e) {
    console.error(`---> Error at /auth`, e)

    switch (true) {
      case e instanceof InvalidOAuthError:
        res.status(400).send(getErrorMsg(e, 'Invalid OAuth error'))
        break
      case e instanceof CookieNotFound:
      case e instanceof InvalidSession:
        if (shop) {
          await Promise.all([
            db.active_stores.setActive(shop, false),
            db.sessions.removeAllByShop(shop),
          ])
        }
        res.redirect(`/api/auth?shop=${shop}`)
        break
      default:
        res.status(500).send(getErrorMsg(e, 'Unknown at /auth'))
        break
    }
  }
}

export default handler
