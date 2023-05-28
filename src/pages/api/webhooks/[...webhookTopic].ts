/*
  Webhook handlers are registered at `./utils/shopify`
*/
import shopify from '~/utils/shopify'
import { apiRouteWithErrorHandler, getErrorMsg } from '~/utils/error'

const handler = apiRouteWithErrorHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(400).send('Must be POST request')
  }

  const topic = req.headers['x-shopify-topic'] || ''
  const shop = req.headers['x-shopify-shop-domain'] || ''

  const buff = await buffer(req)
  const rawBody = buff.toString('utf8')

  try {
    await shopify.webhooks.process({
      rawBody: rawBody,
      rawRequest: req,
      rawResponse: res,
    })
    console.log(`--> Processed ${topic} from ${shop}`)
  } catch (e) {
    const msg = getErrorMsg(e, 'Something went wrong')

    console.error(
      `---> Error while processing webhooks for ${shop} at ${topic} | ${msg}`,
    )
    if (!res.headersSent) {
      console.log('No headers sent')
      res.status(500).send(msg)
    }
  }
})
export default handler

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}
