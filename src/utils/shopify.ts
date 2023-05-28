import '@shopify/shopify-api/adapters/node'
import {
  ApiVersion,
  DeliveryMethod,
  shopifyApi,
  LogSeverity,
} from '@shopify/shopify-api'

// import { restResources } from '@shopify/shopify-api/rest/admin/2023-04';
import appUninstallHandler from './webhooks/app_uninstalled'
import { env } from '~/env'

const isDev = process.env.NODE_ENV === 'development'

// Setup Shopify configuration
const shopify = shopifyApi({
  apiKey: env.NEXT_PUBLIC_SHOPIFY_APP_CLIENT_ID,
  apiSecretKey: env.SHOPIFY_APP_CLIENT_SECRET,
  scopes: env.SHOPIFY_APP_SCOPES.list,
  hostName: env.NEXT_PUBLIC_SHOPIFY_APP_URL.replace('https://', ''),
  hostScheme: 'https',
  apiVersion: env.NEXT_PUBLIC_SHOPIFY_API_VERSION as ApiVersion,
  isEmbeddedApp: true,
  logger: { level: LogSeverity.Error }, //Error = 0,Warning = 1,Info = 2,Debug = 3
  // logger: { level: LogSeverity.Debug, httpRequests: true }, //For insane levels of debugging
})

/*
  Template for adding new topics:
  ```
  TOPIC: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/topic",
      callback: topicHandler,
    },
  ```

    - Webhook topic and callbackUrl topic should be exactly the same because it's using catch-all
    - Don't change the delivery method unless you know what you're doing
      - the method is `DeliveryMethod.Http` and not `DeliveryMethod.http`, mind the caps on `H` in `http`
*/

shopify.webhooks.addHandlers({
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks/app_uninstalled',
    callback: appUninstallHandler,
  },
})

export default shopify
