// If you have the recommended extension installed, create a new page and type `createproxy` to generate proxy route boilerplate
import clientProvider from '~/utils/client-provider'
import { apiRouteWithErrorHandler, RouteError } from '~/utils/error'
import withMiddleware from '~/utils/middleware/withMiddleware'

const handler = apiRouteWithErrorHandler(async (req, res) => {
  // `verifyProxy` makes sure we have the `shop` variable
  const shop = req.query.shop as string
  const { client } = await clientProvider.offline.restClient({
    shop,
  })

  const countRes = await client.get<{ count?: number }>({
    path: '/products/count',
  })

  res.status(200).send({
    shop,
    content: 'Proxy Be Working',
    '-----': '',
    '/products/count': countRes.body,
  })
})

export default withMiddleware('verifyProxy')(handler)
