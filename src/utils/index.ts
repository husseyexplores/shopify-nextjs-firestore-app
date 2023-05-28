import { ZodSchema } from 'zod'

// export const schemaMatches = <T extends ZodSchema>(
//   schema: ZodSchema,
//   input: unknown,
// ): input is T["_type"] => {
//   const result = schema.safeParse(input)
//   if (result.success) {
//     return true
//   }
//   return false
// }
export function schemaMatches<T extends ZodSchema<any>>(
  schema: T,
  input: unknown,
): input is T['_type'] {
  const result = schema.safeParse(input)
  if (result.success) return true
  return false
}

export function isPojo(x: unknown): x is Record<string, unknown> {
  return Object.prototype.toString.call(x) === '[object Object]'
}

export function chunkify<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0, len = array.length; i < len; i += chunkSize)
    chunks.push(array.slice(i, i + chunkSize))
  return chunks
}

export async function to<T extends Promise<any>>(promise: T) {
  try {
    let data = await promise
    return [data, null] as const
  } catch (error) {
    return [null, error] as const
  }
}
