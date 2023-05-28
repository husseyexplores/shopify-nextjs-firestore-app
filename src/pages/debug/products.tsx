import { useEffect, useState } from 'react'
import {
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Page,
  LegacyCard,
} from '@shopify/polaris'
import { Toast, type ToastProps } from '@shopify/app-bridge-react'
import { useAuthenticatedFetch } from '~/components/hooks'
import { useRouter } from 'next/router'

export default function ProductsCard() {
  const router = useRouter()

  const [toastProps, setToastProps] = useState<null | ToastProps>(null)
  const [count, setCount] = useState<number | 'loading...'>('loading...')
  const fetch = useAuthenticatedFetch()

  async function fetchCount() {
    setCount('loading...')
    const res = await fetch('/api/apps/debug/products')
    if (!res) return

    const data = await res.json()
    if (data && 'count' in data && typeof data.count === 'number') {
      setCount(data.count)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  const toastMarkup = toastProps && typeof count === 'number' && (
    <Toast {...toastProps} onDismiss={() => setToastProps(null)} />
  )

  return (
    <>
      {toastMarkup}
      <Page
        title="Webhooks"
        backAction={{ content: 'Home', onAction: () => router.push('/debug') }}
      >
        <LegacyCard title="Product Counter" sectioned>
          <TextContainer spacing="loose">
            <p>
              Sample products are created with a default title and price. You
              can remove them at any time.
            </p>
            <Heading element="h4">
              TOTAL PRODUCTS
              <DisplayText size="medium">
                <TextStyle variation="strong">{count}</TextStyle>
              </DisplayText>
            </Heading>
          </TextContainer>
        </LegacyCard>
      </Page>
    </>
  )
}
