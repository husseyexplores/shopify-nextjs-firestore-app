import clientProvider from '~/utils/client-provider'
import withMiddleware from '~/utils/middleware/withMiddleware'
import { apiRouteWithErrorHandler } from '~/utils/error'

const handler = apiRouteWithErrorHandler(async (req, res) => {
  //false for offline session, true for online session
  const { client, shop } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  })
  const returnUrl = `${process.env.SHOPIFY_APP_URL}/api/auth?shop=${shop}`

  const planPrice = 10.25 //Always a decimal
  const planName = `$${planPrice} plan`

  const response = (await client.query({
    data: `mutation CreateSubscription{
    appSubscriptionCreate(
      name: "${planName}"
      returnUrl: "${returnUrl}"
      test: true
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: ${planPrice}, currencyCode: USD }
            }
          }
        }
      ]
    ) {
      userErrors {
        field
        message
      }
      confirmationUrl
      appSubscription {
        id
        status
      }
    }
  }
`,
  })) as any

  if (response.body.data.appSubscriptionCreate.userErrors.length > 0) {
    console.log(
      `--> Error subscribing ${shop} to plan:`,
      response.body.data.appSubscriptionCreate.userErrors,
    )
    res.status(400).send({ error: 'An error occured.' })
    return
  }

  res.status(200).send({
    confirmationUrl: `${response.body.data.appSubscriptionCreate.confirmationUrl}`,
  })
  return
})

export default withMiddleware('verifyRequest')(handler)
