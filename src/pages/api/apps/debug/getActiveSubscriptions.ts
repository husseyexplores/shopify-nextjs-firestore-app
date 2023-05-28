import clientProvider from '~/utils/client-provider'
import withMiddleware from '~/utils/middleware/withMiddleware'
import { apiRouteWithErrorHandler } from '~/utils/error'

const handler = apiRouteWithErrorHandler(async (req, res) => {
  //false for offline session, true for online session
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  })

  const response = await client.query({
    data: `{
      appInstallation {
        activeSubscriptions {
          name
          status
          lineItems {
            plan {
              pricingDetails {
                ... on AppRecurringPricing {
                  __typename
                  price {
                    amount
                    currencyCode
                  }
                  interval
                }
              }
            }
          }
          test
        }
      }
    }`,
  })

  res.status(200).send(response)
})

export default withMiddleware('verifyRequest')(handler)
