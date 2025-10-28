import 'dotenv/config'
import { Queue, Worker, Job } from 'bullmq'
import { logger } from '../../../packages/core/src/logger'
import { loadConfig } from '../../../packages/core/src/config'
import { PipelineExecutor } from '../../../packages/core/src/pipeline-executor'
import { PipelineContext } from '../../../packages/types/src/index'

const cfg = loadConfig()
const connection = { connection: { url: cfg.REDIS_URL } }
const q = new Queue<PipelineContext>('video', connection)
const executor = new PipelineExecutor(cfg.DATA_DIR)

new Worker<PipelineContext>('video', async (job: Job<PipelineContext>) => {
  logger.info({ id: job.data.id }, 'Pipeline worker started')
  
  try {
    await executor.executeFullPipeline(job)
    logger.info({ id: job.data.id }, 'Pipeline completed successfully')
  } catch (error) {
    logger.error({ id: job.data.id, error: error instanceof Error ? error.message : String(error) }, 'Pipeline failed')
    throw error
  }
}, connection)

logger.info('Orchestrator worker started')
