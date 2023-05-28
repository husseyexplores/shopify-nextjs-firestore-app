import { NavigationMenu } from '@shopify/app-bridge-react'
import { AppProvider as PolarisProvider } from '@shopify/polaris'
import '@shopify/polaris/build/esm/styles.css'
import translations from '@shopify/polaris/locales/en.json'
import AppBridgeProvider from '../components/providers/AppBridgeProvider'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface LinkLikeComponentProps extends React.HTMLProps<HTMLAnchorElement> {
  /** The url to link to */
  url: string
  /**	The content to display inside the link */
  children?: React.ReactNode
  /** Makes the link open in a new tab */
  external?: boolean
  /** Makes the browser download the url instead of opening it. Provides a hint for the downloaded filename if it is a string value. */
  download?: string | boolean
  [key: string]: any
}

function NextPolarisLink({
  url,
  external,
  children,
  ref,
  ...props
}: LinkLikeComponentProps) {
  const target = external ? '_blank' : undefined
  const rel = external ? 'noopener noreferrer' : undefined
  return (
    <Link href={url} target={target} rel={rel} {...props}>
      {children}
    </Link>
  )
}

export default function App({
  Component,
  pageProps,
}: {
  Component: any
  pageProps: any
}) {
  const router = useRouter()
  return (
    <PolarisProvider i18n={translations} linkComponent={NextPolarisLink}>
      <AppBridgeProvider>
        <NavigationMenu
          navigationLinks={[
            {
              label: 'Fetch Data',
              destination: '/debug/getData',
            },
            {
              label: 'Billing API',
              destination: '/debug/billing',
            },
          ]}
          matcher={(link) => router.pathname === link.destination}
        />
        <Component {...pageProps} />
      </AppBridgeProvider>
    </PolarisProvider>
  )
}
