import { customAlphabet } from 'nanoid'

const digits = '1234567890qwertyuiopasdfghjklzxcvbnm'
const customNanoid = customAlphabet(digits)

/**
 * Creates a unique nanoid ID with 20 characters compatible with appwrite ID.unique()
 */
export function createId() {
  return customNanoid(20)
}
