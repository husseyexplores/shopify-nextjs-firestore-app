/*
    Add Content Security Policy headers to all relevant requests.
*/

import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     * Exceptions:
     * /api/auth, /api/webhooks, /api/proxy_route, /api/gdpr, /_next,
     * /_proxy, /_auth, /_static, /_vercel, /public (/favicon.ico, etc)
     */
    '/((?!api/auth|api/webhooks|api/proxy_route|api/gdpr|_next|_proxy|_auth|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}
const SUFFIX = '.myshopify.com'
const isValidShop = (shop: unknown): shop is string => {
  return (
    typeof shop === 'string' &&
    shop.endsWith(SUFFIX) &&
    shop.length > SUFFIX.length
  )
}

export function middleware(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop')
  const _shop = shop || '*.myshopify.com'

  const res = NextResponse.next()

  res.headers.set(
    'Content-Security-Policy',
    `frame-ancestors https://${_shop} https://admin.shopify.com;`,
  )

  // You can also set request headers in NextResponse.rewrite
  return res
}
