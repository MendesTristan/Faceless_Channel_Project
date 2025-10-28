import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  REDIS_URL: z.string().url(),
  DATA_DIR: z.string().min(1)
})

export function loadConfig() {
  const parsed = schema.safeParse({
    REDIS_URL: process.env.REDIS_URL,
    DATA_DIR: process.env.DATA_DIR || './data'
  })
  if (!parsed.success) {
    console.error('Invalid configuration', parsed.error.flatten().fieldErrors)
    process.exit(1)
  }
  return parsed.data
}
