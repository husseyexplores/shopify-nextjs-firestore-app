import clientProvider from '~/utils/client-provider'
import withMiddleware from '~/utils/middleware/withMiddleware'
import { apiRouteWithErrorHandler } from '~/utils/error'

const handler = apiRouteWithErrorHandler(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { client } = await clientProvider.restClient({
        req,
        res,
        isOnline: true,
      })

      const data = await client.get({
        path: '/products/count',
      })

      return res.status(200).send(data.body)
    } catch (e) {
      console.error(`---> An error occured`, e)
      return res.status(400).send({ text: 'Bad request' })
    }
  } else {
    res
      .status(400)
      .send({ text: `Bad request. Method "${req.method}" not allowed` })
  }
})

export default withMiddleware('verifyRequest')(handler)
