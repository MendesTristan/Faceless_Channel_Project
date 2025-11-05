import 'dotenv/config'
import express, { Request, Response } from 'express'
import pino from 'pino'
import pinoHttp from 'pino-http'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
})

const app = express()
const PORT = process.env.PORT || 3008

app.use(express.json())
app.use(pinoHttp({ logger }))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: 'uploader',
    timestamp: new Date().toISOString()
  })
})

// TODO: Implement service endpoints

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Uploader service started')
})
