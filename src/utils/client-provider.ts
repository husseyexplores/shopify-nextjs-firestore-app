import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '~/db'
import shopify from './shopify'
import { env } from '~/env'
import type { ApiVersion } from '@shopify/shopify-api'
import { RouteError } from './error'

const currentApiVersion = env.NEXT_PUBLIC_SHOPIFY_API_VERSION as ApiVersion

type ClientParams = {
  req: NextApiRequest
  res: NextApiResponse
  isOnline: boolean
}

const fetchSession = async ({ req, res, isOnline }: ClientParams) => {
  //false for offline session, true for online session
  const sessionId = await shopify.session.getCurrentId({
    isOnline,
    rawRequest: req,
    rawResponse: res,
  })

  if (!sessionId)
    throw new RouteError(400, '[fetchSession] - `sessionId` not found')
  const session = await db.sessions.load(sessionId)

  if (!session)
    throw new RouteError(400, '[fetchSession] - `session` not found')
  return session
}

const graphqlClient = async ({ req, res, isOnline }: ClientParams) => {
  const session = await fetchSession({ req, res, isOnline })

  const client = new shopify.clients.Graphql({ session })
  const { shop } = session
  return { client, shop, session }
}

const restClient = async ({ req, res, isOnline }: ClientParams) => {
  const session = await fetchSession({ req, res, isOnline })

  const client = new shopify.clients.Rest({
    session,
    apiVersion: currentApiVersion,
  })
  const { shop } = session
  return { client, shop, session }
}

const fetchOfflineSession = async (shop: string) => {
  if (!shop)
    throw new RouteError(400, '[fetchOfflineSession] - `shop` is required')

  const sessionID = shopify.session.getOfflineId(shop)

  if (!sessionID) {
    throw new RouteError(
      400,
      '[fetchOfflineSession] - offline session not found',
    )
  }

  const session = await db.sessions.load(sessionID)
  if (!session) {
    throw new RouteError(
      400,
      '[fetchOfflineSession] - offline session not found',
    )
  }
  return session
}

const offline = {
  graphqlClient: async ({ shop }: { shop: string }) => {
    const session = await fetchOfflineSession(shop)

    const client = new shopify.clients.Graphql({ session })
    return { client, shop, session }
  },
  restClient: async ({ shop }: { shop: string }) => {
    const session = await fetchOfflineSession(shop)
    const client = new shopify.clients.Rest({
      session,
      apiVersion: currentApiVersion,
    })
    return { client, shop, session }
  },
}

const clientProvider = { graphqlClient, restClient, offline }

export default clientProvider
