import { useAppBridge } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge/utilities'
import { Redirect } from '@shopify/app-bridge/actions'
import { env } from '~/env'

export function useAuthenticatedFetch() {
  const app = useAppBridge()
  const fetchFunction = authenticatedFetch(app)

  return async (uri: RequestInfo, options?: RequestInit) => {
    const response = await fetchFunction(uri, options)

    if (
      response.headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1'
    ) {
      const authUrlHeader = response.headers.get(
        'X-Shopify-API-Request-Failure-Reauthorize-Url',
      )
      const to = authUrlHeader || `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/exitframe`
      console.log('[useAuthenticatedFetch] - Redirecting to -> ', to)

      const redirect = Redirect.create(app)
      redirect.dispatch(Redirect.Action.APP, to)
      return null
    }

    return response
  }
}
