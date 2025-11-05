import 'dotenv/config'
import express, { Request, Response } from 'express'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { z } from 'zod'
import { KeywordService } from './keyword-service'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
})

const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())
app.use(pinoHttp({ logger }))

const keywordService = new KeywordService(logger)

// Validation schema
const FetchKeywordsSchema = z.object({
  topic: z.string().min(1),
  format: z.enum(['short', 'long']),
  limit: z.number().optional().default(10)
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: 'keyword-fetcher',
    timestamp: new Date().toISOString()
  })
})

// Fetch keywords endpoint
app.post('/keywords/fetch', async (req: Request, res: Response) => {
  try {
    const pipelineId = req.headers['x-pipeline-id'] as string
    
    logger.info({ pipelineId, body: req.body }, 'Fetching keywords')

    // Validate input
    const input = FetchKeywordsSchema.parse(req.body)

    // Execute service
    const result = await keywordService.fetchKeywords(input)

    logger.info({ pipelineId, keywordCount: result.keywords.length }, 'Keywords fetched')

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ error: error.errors }, 'Validation error')
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      })
    }

    logger.error({ error }, 'Failed to fetch keywords')
    res.status(500).json({ 
      error: 'Failed to fetch keywords',
      message: error instanceof Error ? error.message : String(error)
    })
  }
})

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Keyword Fetcher service started')
})

