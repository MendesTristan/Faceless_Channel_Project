import { logger } from './logger'

export interface RetryOptions {
  maxRetries?: number
  delay?: number
  exponentialBackoff?: boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    exponentialBackoff = true
  } = options

  let lastError: Error | null = null
  let currentDelay = delay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        logger.warn({ 
          attempt: attempt + 1, 
          maxRetries, 
          delay: currentDelay,
          error: lastError.message 
        }, 'Retry attempt')
        
        await sleep(currentDelay)
        
        if (exponentialBackoff) {
          currentDelay *= 2
        }
      } else {
        logger.error({ 
          attempt: attempt + 1, 
          maxRetries,
          error: lastError.message 
        }, 'Max retries exceeded')
      }
    }
  }

  throw lastError || new Error('Unknown error in retry')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

