//This is the same as `pages/api/index.js`.

import withMiddleware from '~/utils/middleware/withMiddleware'
import { apiRouteWithErrorHandler } from '~/utils/error'

const handler = apiRouteWithErrorHandler(async (req, res) => {
  if (req.method === 'GET') {
    return res
      .status(200)
      .send({ text: 'This text is coming from `/api/apps route`' })
  }

  if (req.method === 'POST') {
    return res.status(200).send(req.body)
  }

  return res.status(400).send({ text: 'Bad request' })
})

export default withMiddleware('verifyRequest')(handler)
