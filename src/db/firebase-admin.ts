import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { chunkify } from '~/utils'
import { env } from '~/env'

let app: App | null = null
if (!app) {
  app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert(env.FBASE_SERVICE_ACCOUNT),
        })
}

if (!app) {
  throw new Error('No firebase app initialized')
}

export const firestore = getFirestore(app)
export const COLLECTION = {
  sessions: 'sessions',
  active_stores: 'active_stores',
} as const

/** Firestore batched operation helpers */
const MAX_BATCH_LIMIT = 500
type BatchedOpCallback = (
  writeBatch: FirebaseFirestore.WriteBatch,
  doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  index: number,
) => any

export async function batchedOperation(
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  callback: BatchedOpCallback,
  limit = MAX_BATCH_LIMIT,
): Promise<void | undefined> {
  /** https://cloud.google.com/firestore/quotas#writes_and_transactions */
  const MAX_WRITES_PER_BATCH = Math.max(1, Math.min(limit, MAX_BATCH_LIMIT))

  const batches = chunkify(snapshot.docs, MAX_WRITES_PER_BATCH)
  const commitBatchPromises: Promise<any>[] = []
  batches.forEach((batch) => {
    const writeBatch = firestore.batch()
    batch.forEach((doc, index) => {
      callback(writeBatch, doc, index)
    })
    commitBatchPromises.push(writeBatch.commit())
  })

  await Promise.all(commitBatchPromises)
}

type BatchedOpHelperFn = (
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  limit?: number,
) => Promise<void | undefined>
const batchedDelete: BatchedOpHelperFn = async (
  snapshot,
  limit = MAX_BATCH_LIMIT,
) => {
  await batchedOperation(snapshot, (w, d) => w.delete(d.ref), limit)
}

batchedOperation.delete = batchedDelete

/* ------------------------------------------------------------------------ */

export async function batchWrapper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'update',
  update:
    | Record<string, any>
    | ((
        doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
      ) => Record<string, any>),
): Promise<any>
export async function batchWrapper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'delete',
): Promise<any>

/**
 * @usage batchWrapper(await firestore.collection('users').get(), 'delete')
 * @usage batchWrapper(await firestore.collection('users').get(), 'update', doc => ({ ...doc.data(), age: doc.data().age + 1 }))
 *
 */
export async function batchWrapper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'delete' | 'update' | 'set',
  update?:
    | Record<string, any>
    | ((
        doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
      ) => Record<string, any>),
) {
  const writeBatches: FirebaseFirestore.WriteBatch[] = [
    // initialize with firest batch
    firestore.batch(),
  ]

  let operationCounter = 0
  let batchIndex = 0

  documentsSnapshot.forEach((doc) => {
    if (action === 'delete') {
      writeBatches[batchIndex].delete(doc.ref)
    } else if (action === 'update') {
      const updatedValue = typeof update === 'function' ? update(doc) : update
      writeBatches[batchIndex].update(doc.ref, updatedValue)
    } else if (action === 'set') {
      const updatedValue = typeof update === 'function' ? update(doc) : update
      writeBatches[batchIndex].set(doc.ref, updatedValue)
    }

    operationCounter++

    /** https://cloud.google.com/firestore/quotas#writes_and_transactions */
    // Max batch size is 500
    if (operationCounter === 499) {
      writeBatches.push(firestore.batch())
      batchIndex++
      operationCounter = 0
    }
  })

  // commit all batches
  await Promise.all(writeBatches.map((batch) => batch.commit()))

  return
}
