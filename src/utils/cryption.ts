import Cryptr from 'cryptr'
import { env } from '~/env'

const cryption = new Cryptr(env.ENCRYPTION_SALT)
export default cryption
