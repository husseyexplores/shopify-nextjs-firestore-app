'use client'
import { useAppBridge } from '@shopify/app-bridge-react'
import { Redirect } from '@shopify/app-bridge/actions'
import { Spinner } from '@shopify/polaris'
import { useEffect } from 'react'
import { env } from '~/env'

export default function ExitFrame() {
  const app = useAppBridge()
  const redirect = Redirect.create(app)

  useEffect(() => {
    if (typeof window !== 'undefined' && redirect) {
      const url = new URL(window.location.href)
      const qsUri = url.searchParams.get('redirectUri')

      // `pathname` -> /exitframe/your-shop.myshopify.com
      // `splitted pathname` -> ['', 'exitframe', 'your-shop.myshopify.com']
      // `filter out empty paths` -> ['exitframe', 'your-shop.myshopify.com']
      let shop = url.pathname.split('/').filter(Boolean)[1]

      const to =
        qsUri ?? `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/api/auth?shop=${shop}`

      console.log('[ExitFrame]. Redirecting to -> ', to)
      redirect.dispatch(Redirect.Action.REMOTE, to)
    }
  }, [redirect])

  return (
    <>
      <Spinner />
    </>
  )
}
