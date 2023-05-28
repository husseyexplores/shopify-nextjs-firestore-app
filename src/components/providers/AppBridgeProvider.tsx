'use client'
import { useEffect, useMemo, useState } from 'react'
import { Provider } from '@shopify/app-bridge-react'
import { Layout, Page, Spinner } from '@shopify/polaris'
import { useRouter } from 'next/router'
import { env } from '~/env'

type AppBridgeConfig = {
  host: string
  apiKey: string
  forceRedirect: boolean
}

function AppBridgeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const location = router.asPath

  const [appBridgeConfig, setConfig] = useState<null | AppBridgeConfig>(null)

  const host = router.query?.host
  useEffect(() => {
    if (host && typeof host === 'string') {
      setConfig({
        host: host,
        apiKey: env.NEXT_PUBLIC_SHOPIFY_APP_CLIENT_ID,
        forceRedirect: true,
      })
    }
  }, [host])

  const history = useMemo(
    () => ({
      replace: (path: string) => {
        router.push(path)
      },
    }),
    [router],
  )

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location],
  )

  if (!appBridgeConfig) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Spinner />
          </Layout.Section>
        </Layout>
      </Page>
    )
  }

  return (
    <Provider config={appBridgeConfig} router={routerConfig}>
      {children}
    </Provider>
  )
}

export default AppBridgeProvider
