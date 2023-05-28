import type { NextApiRequest } from 'next'
import type { Middleware } from 'next-api-middleware'
import crypto from 'crypto'
import * as db from '~/db'
import { env } from '~/env'

/*
`req.query` will be in this format:

{
  "path_prefix": "/apps/next-starter-app-proxy",
  "logged_in_customer_id": "",
  "timestamp": "1685267071",
  "signature": "582fc6491764e2b65f0b6e6b33dfd7cca23e5325acef6dee2a2b77203134fe7d",
  "shop": "customer-shop.myshopify.com"
}
*/

const verifyProxy: Middleware = async (req, res, next) => {
  const { shop } = req.query
  if (typeof shop !== 'string') {
    return res.status(400).json({
      success: false,
      message:
        'Invalid request. Unable to find `shop` added from the middleware',
      'req.query': req.query._debug ? req.query : undefined,
    })
  }

  if (validateSignatue(req)) {
    const activeStore = await db.active_stores.findByShop(shop, true)
    if (!activeStore) {
      return res.status(401).send({
        success: false,
        message: 'Inactive store',
        'req.query': req.query._debug ? req.query : undefined,
      })
    }

    await next()
    return
  } else {
    return res.status(401).send({
      success: false,
      message: 'Signature verification failed',
      'req.query': req.query._debug ? req.query : undefined,
    })
  }
}

function encodeQueryData(data: Record<string, any>) {
  const queryString = []
  for (let d in data) queryString.push(d + '=' + encodeURIComponent(data[d]))
  return queryString.join('&')
}

function validateSignatue(req: NextApiRequest) {
  const queryURI = encodeQueryData(req.query)
    .replace('/?', '')
    .replace(/&signature=[^&]*/, '')
    .split('&')
    .map((x) => decodeURIComponent(x))
    .sort()
    .join('')

  const calculatedSignature = crypto
    .createHmac('sha256', env.SHOPIFY_APP_CLIENT_SECRET)
    .update(queryURI, 'utf-8')
    .digest('hex')

  return calculatedSignature === req.query.signature
}

export default verifyProxy
