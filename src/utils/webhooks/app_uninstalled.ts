// If you have the recommended extension installed, create a new page and type `createwebhook` to generate webhook boilerplate
import * as db from '~/db'

const appUninstallHandler = async (
  topic: string,
  shop: string,
  webhookRequestBody: string,
) => {
  try {
    await Promise.all([
      // delete all shop sessions
      db.sessions.removeAllByShop(shop),

      // set shop as inactive
      db.active_stores.setActive(shop, false),
    ])

    const webhookBody = JSON.parse(webhookRequestBody)
  } catch (e) {
    console.error('Failed to uninstall the shop', e)
  }
}

export default appUninstallHandler
