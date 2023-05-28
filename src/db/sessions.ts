import { z } from 'zod'
import { Session as ShopifySession } from '@shopify/shopify-api'
import cryption from '~/utils/cryption'
import { firestore, COLLECTION, batchedOperation } from './firebase-admin'
import { schemaMatches, to } from '~/utils'
import { env } from '~/env'

export const Model = z
  .object({
    id: z.string(),
    shop: z.string(),
    content: z.string().min(10),
  })
  .passthrough()
export type Model = z.infer<typeof Model>
export const SessionModel = Model

export async function save(session: unknown) {
  if (session instanceof ShopifySession) {
    const storedSession: Model = {
      id: session.id,
      shop: session.shop,
      content: cryption.encrypt(JSON.stringify(session)),
    }

    await firestore
      .collection(COLLECTION.sessions)
      .doc(session.id)
      .set(storedSession, { merge: true })
    return true
  }

  return false
}

export async function load(id: string): Promise<ShopifySession | undefined> {
  const docSnap = await firestore.collection(COLLECTION.sessions).doc(id).get()
  if (!docSnap.exists) return undefined

  const storedSession = docSnap.data()

  if (!schemaMatches(Model, storedSession)) {
    await docSnap.ref.delete()
    return undefined
  }

  try {
    const sessionObj = JSON.parse(cryption.decrypt(storedSession.content))
    const session = new ShopifySession(sessionObj)

    if (isActiveSession(session)) {
      return session
    }

    await docSnap.ref.delete()
  } catch (e) {
    // invalid
    await docSnap.ref.delete()
  }

  return undefined
}

export async function removeAllByShop(shop: string) {
  if (!shop) return
  const snapshot = await firestore
    .collection(COLLECTION.sessions)
    .where('shop', '==', shop)
    .get()

  const [, error] = await to(batchedOperation.delete(snapshot))
  return !error
}

export async function remove(sessionId: string) {
  if (!sessionId) return

  const [, error] = await to(
    firestore.collection(COLLECTION.sessions).doc(sessionId).delete(),
  )
  return !error
}

export function isActiveSession(session: ShopifySession) {
  if (!session.scope) return false

  const scopesUnchanged = env.SHOPIFY_APP_SCOPES.equals(session.scope)
  const expired = session.expires && session.expires >= new Date()
  const isActive = scopesUnchanged && !expired

  return isActive
}
