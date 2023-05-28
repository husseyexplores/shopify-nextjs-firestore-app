import type { Middleware } from 'next-api-middleware'
// import { NextResponse } from 'next/server'
import crypto from 'crypto'
import shopify from '~/utils/shopify'
import { env } from '~/env'
import { getErrorMsg } from '~/utils/error'

const verifyHmac: Middleware = async (req, res, next) => {
  try {
    const generateHash = crypto
      .createHmac('SHA256', env.SHOPIFY_APP_CLIENT_SECRET)
      .update(JSON.stringify(req.body), 'utf8')
      .digest('base64')

    const hmac = req.headers['x-shopify-hmac-sha256']

    if (
      typeof hmac === 'string' &&
      shopify.auth.safeCompare(generateHash, hmac)
    ) {
      await next()
    } else {
      return res
        .status(401)
        .send({ success: false, message: 'HMAC verification failed' })
    }
  } catch (e) {
    console.error(
      `--> An error occured while verifying HMAC`,
      getErrorMsg(e, 'Failed to verify HMAC'),
    )

    return res
      .status(401)
      .json({ success: false, message: 'HMAC verification failed' })

    // return new NextResponse(
    //   JSON.stringify({ success: false, message: 'HMAC verification failed' }),
    //   {
    //     status: 401,
    //     headers: {
    //       'content-type': 'application/json',
    //     },
    //   },
    // )
  }
}

export default verifyHmac
