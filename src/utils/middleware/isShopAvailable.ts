import type { GetServerSideProps } from 'next'
import * as db from '~/db'
import { env } from '~/env'

const isShopAvailable: GetServerSideProps<{
  user_shop: string
}> = async (context) => {
  const shop = context.query.shop

  if (!shop || typeof shop !== 'string') {
    /**
     * * IMPORTANT *
     *
     * We HAVE to return something
     * Otherwise the app will break on subsequent requests.
     *
     * DO NOT Remove this.
     */
    return { props: { user_shop: '' } }
  }

  const store = await db.active_stores.findByShop(shop, true)
  if (!store || !store.isActive) {
    return {
      redirect: {
        destination: `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/api/auth?shop=${shop}`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      user_shop: shop,
    },
  }
}

export default isShopAvailable
