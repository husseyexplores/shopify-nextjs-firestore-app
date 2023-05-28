import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

export function getErrorMsg(input: unknown, fallback: string) {
  if (input instanceof Error) {
    return input.message
  }

  return fallback
}

export class RouteError extends Error {
  statusCode: number
  metadata: any
  redirectPath: string | undefined
  constructor(statusCode: number, message: string, metadata?: any) {
    super(message)
    this.name = 'RouteError'
    this.statusCode = statusCode
    this.metadata = metadata
    this.redirectPath = '/'
  }
  goto(path: string | undefined | null, statusCode = 307) {
    this.redirectPath = path ?? undefined
    if (typeof statusCode === 'number') {
      this.statusCode = statusCode
    }
    return this
  }
}

type CatcherFn = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: unknown,
) => any

type ApiRouteWithErrorHandlerFn = (
  handler: NextApiHandler,
  catcher?: CatcherFn,
) => NextApiHandler

export const apiRouteWithErrorHandler: ApiRouteWithErrorHandlerFn =
  (handler, catcher) => async (req, res) => {
    try {
      const result = await handler(req, res)
      return result
    } catch (error) {
      console.error(`---> An error occured at /${req.url}`, error)

      if (error instanceof RouteError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            metadata: error.metadata,
          },
        })
      } else {
        if (catcher) {
          catcher(req, res, error)
        } else {
          res.status(500).json({
            error: {
              message: getErrorMsg(error, 'Internal Server Error'),
              metadata: 'Unhandled Error',
            },
          })
        }
      }
    }
  }
