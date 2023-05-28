import * as db from '~/db'

const sessionHandler = {
  storeSession: db.sessions.save,
  loadSession: db.sessions.load,
  deleteSession: db.sessions.remove,
}

export default sessionHandler
