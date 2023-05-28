import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import {
  equals as isScopeEqual,
  parse as parseScopes,
} from './src/utils/auth-scopes.mjs'

// regex to test this string "2023-07"
const API_REGEX = /^\d{4}-\d{2}$/

export const env = createEnv({
  server: {
    NEXT_PUBLIC_SHOPIFY_APP_CLIENT_ID: z.string(),
    SHOPIFY_APP_CLIENT_SECRET: z.string(),
    SHOPIFY_APP_SCOPES: z.string().transform((x) => {
      const parsedScopes = parseScopes(x)
      return {
        unsafe_string: x,
        string: parsedScopes.compressed.list.join(','),
        list: parsedScopes.compressed.list,
        equals: isScopeEqual.bind(null, parsedScopes.compressed.list),
      }
    }),
    ENCRYPTION_SALT: z.string().min(8),
    FBASE_SERVICE_ACCOUNT: z.string().transform((v) => {
      return JSON.parse(v, (k, v) => {
        if (k === 'private_key') {
          return v.replace(/\\n/gm, '\n')
        }
        return v
      })
    }),
  },
  client: {
    NEXT_PUBLIC_SHOPIFY_APP_CLIENT_ID: z.string(),
    NEXT_PUBLIC_SHOPIFY_APP_URL: z.string(),
    NEXT_PUBLIC_SHOPIFY_API_VERSION: z.string().regex(API_REGEX),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SHOPIFY_APP_CLIENT_ID:
      process.env.NEXT_PUBLIC_SHOPIFY_APP_CLIENT_ID,
    SHOPIFY_APP_CLIENT_SECRET: process.env.SHOPIFY_APP_CLIENT_SECRET,
    SHOPIFY_APP_SCOPES: process.env.SHOPIFY_APP_SCOPES,
    ENCRYPTION_SALT: process.env.ENCRYPTION_SALT,
    FBASE_SERVICE_ACCOUNT: process.env.FBASE_SERVICE_ACCOUNT,
    NEXT_PUBLIC_SHOPIFY_APP_URL: process.env.NEXT_PUBLIC_SHOPIFY_APP_URL,
    NEXT_PUBLIC_SHOPIFY_API_VERSION:
      process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION,
  },
})
