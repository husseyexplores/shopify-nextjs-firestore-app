import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '~/db'
import shopify from '~/utils/shopify'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    })

    const { session } = callbackResponse
    await db.sessions.save(session)

    const host = req.query.host
    const { shop } = session

    await db.active_stores.setActive(shop, true)

    // Redirect to app with shop parameter upon auth
    res.redirect(`/?shop=${shop}&host=${host}`)
  } catch (e) {
    const shop = req.query.shop

    if (typeof shop === 'string') {
      await db.active_stores.setActive(shop, false)
    }

    console.error('---> An error occured at /auth/callback', e)
    res.status(403).send({ message: 'It do not be working' })
  }
}

export default handler
