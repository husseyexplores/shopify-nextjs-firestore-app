import { z } from 'zod'
import { firestore, COLLECTION } from './firebase-admin'
import { to, schemaMatches } from '~/utils'

const Model = z
  .object({
    shop: z.string(),
    isActive: z.boolean(),
  })
  .passthrough()
type Model = z.infer<typeof Model>
type ActiveModel = Model & { isActive: true }
export const ActiveStoreModel = Model

export async function findByShop<T extends boolean>(
  shop: string,
  ensureActive?: T,
): Promise<(T extends true ? ActiveModel : Model) | null>
export async function findByShop(shop: string, ensureActive = false) {
  if (typeof shop !== 'string') return null

  const [doc, error] = await to(
    firestore.collection(COLLECTION.active_stores).doc(shop).get(),
  )
  if (!doc) return null

  const stored = doc.data()
  if (schemaMatches(Model, stored)) {
    if (!ensureActive) {
      return stored
    }

    return stored.isActive ? stored : null
  } else {
    await to(deleteShop(shop))
    return null
  }
}

export async function deleteShop(shop: string) {
  if (!shop) return

  const [, error] = await to(
    firestore.collection(COLLECTION.active_stores).doc(shop).delete(),
  )

  return !error
}

export async function setActive(shop: string, isActive: boolean) {
  if (!shop) return false

  const input: Model = {
    shop,
    isActive,
  }

  const [, error] = await to(
    firestore
      .collection(COLLECTION.active_stores)
      .doc(shop)
      .set(input, { merge: true }),
  )

  return !error
}
