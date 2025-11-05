import 'dotenv/config'
import express, { Request, Response } from 'express'
import { Queue, Worker, Job } from 'bullmq'
import { nanoid } from 'nanoid'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { PipelineExecutor } from './pipeline-executor'
import { PipelineContext, CreatePipelineRequest } from './types'
import { EventBus } from './event-bus'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
})

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(pinoHttp({ logger }))

// Redis connection
const redisConfig = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
}

// BullMQ Queue
const pipelineQueue = new Queue<PipelineContext>('pipelines', redisConfig)

// Event bus for inter-service communication
const eventBus = new EventBus(
  process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'
)

// Pipeline executor
const executor = new PipelineExecutor(eventBus, logger)

// BullMQ Worker
new Worker<PipelineContext>(
  'pipelines',
  async (job: Job<PipelineContext>) => {
    logger.info({ pipelineId: job.data.id }, 'Starting pipeline execution')
    
    try {
      await executor.execute(job.data)
      
      // Publish completion event
      await eventBus.publish('pipeline.completed', {
        pipelineId: job.data.id,
        completedAt: new Date().toISOString()
      })
      
      logger.info({ pipelineId: job.data.id }, 'Pipeline completed successfully')
    } catch (error) {
      logger.error({ pipelineId: job.data.id, error }, 'Pipeline failed')
      
      // Publish failure event
      await eventBus.publish('pipeline.failed', {
        pipelineId: job.data.id,
        error: error instanceof Error ? error.message : String(error),
        failedAt: new Date().toISOString()
      })
      
      throw error
    }
  },
  redisConfig
)

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: 'orchestrator',
    timestamp: new Date().toISOString()
  })
})

// Create pipeline
app.post('/orchestrator/start', async (req: Request, res: Response) => {
  try {
    const { topic, format } = req.body as CreatePipelineRequest

    if (!topic || !format) {
      return res.status(400).json({ 
        error: 'Missing required fields: topic, format' 
      })
    }

    if (format !== 'short' && format !== 'long') {
      return res.status(400).json({ 
        error: 'Invalid format. Must be "short" or "long"' 
      })
    }

    const pipelineId = nanoid()
    const context: PipelineContext = {
      id: pipelineId,
      topic,
      format,
      createdAt: new Date().toISOString()
    }

    // Add to queue
    await pipelineQueue.add('execute-pipeline', context, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    })

    // Publish start event
    await eventBus.publish('pipeline.started', {
      pipelineId,
      topic,
      format,
      startedAt: new Date().toISOString()
    })

    logger.info({ pipelineId, topic, format }, 'Pipeline queued')

    res.status(202).json({
      pipelineId,
      status: 'queued',
      message: 'Pipeline has been queued for execution'
    })
  } catch (error) {
    logger.error({ error }, 'Failed to create pipeline')
    res.status(500).json({ 
      error: 'Failed to create pipeline' 
    })
  }
})

// Get pipeline status
app.get('/orchestrator/status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const job = await pipelineQueue.getJob(id)
    
    if (!job) {
      return res.status(404).json({ error: 'Pipeline not found' })
    }

    const state = await job.getState()
    
    res.json({
      pipelineId: id,
      status: state,
      data: job.data,
      progress: job.progress,
      createdAt: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason
    })
  } catch (error) {
    logger.error({ error }, 'Failed to get pipeline status')
    res.status(500).json({ error: 'Failed to get pipeline status' })
  }
})

// Retry a specific step
app.post('/orchestrator/retry/:id/:step', async (req: Request, res: Response) => {
  try {
    const { id, step } = req.params
    
    // TODO: Implement step retry logic
    res.json({ 
      message: 'Step retry not yet implemented',
      pipelineId: id,
      step
    })
  } catch (error) {
    logger.error({ error }, 'Failed to retry step')
    res.status(500).json({ error: 'Failed to retry step' })
  }
})

// List pipelines
app.get('/orchestrator/pipelines', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const jobs = await pipelineQueue.getJobs(['completed', 'failed', 'active', 'waiting'], 0, limit)
    
    const pipelines = await Promise.all(
      jobs.map(async (job) => ({
        pipelineId: job.id,
        status: await job.getState(),
        data: job.data,
        createdAt: job.timestamp,
        finishedOn: job.finishedOn
      }))
    )
    
    res.json({ pipelines })
  } catch (error) {
    logger.error({ error }, 'Failed to list pipelines')
    res.status(500).json({ error: 'Failed to list pipelines' })
  }
})

app.listen(PORT, async () => {
  await eventBus.connect()
  logger.info({ port: PORT }, 'Orchestrator service started')
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await pipelineQueue.close()
  await eventBus.disconnect()
  process.exit(0)
})

