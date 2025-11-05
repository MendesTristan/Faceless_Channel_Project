import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createProxyMiddleware } from 'http-proxy-middleware'
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
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
app.use(express.json())
app.use(pinoHttp({ logger }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: new Date().toISOString() 
  })
})

// Service endpoints configuration
const services = {
  orchestrator: process.env.ORCHESTRATOR_URL || 'http://orchestrator:3001',
  keywordFetcher: process.env.KEYWORD_FETCHER_URL || 'http://keyword-fetcher:3002',
  scriptGenerator: process.env.SCRIPT_GENERATOR_URL || 'http://script-generator:3003',
  ttsRenderer: process.env.TTS_RENDERER_URL || 'http://tts-renderer:3004',
  videoAssembler: process.env.VIDEO_ASSEMBLER_URL || 'http://video-assembler:3005',
  thumbnailMaker: process.env.THUMBNAIL_MAKER_URL || 'http://thumbnail-maker:3006',
  metadataBuilder: process.env.METADATA_BUILDER_URL || 'http://metadata-builder:3007',
  uploader: process.env.UPLOADER_URL || 'http://uploader:3008',
  abTester: process.env.AB_TESTER_URL || 'http://ab-tester:3009'
}

// Proxy configuration for each service
app.use('/api/pipelines', createProxyMiddleware({
  target: services.orchestrator,
  changeOrigin: true,
  pathRewrite: { '^/api/pipelines': '/orchestrator' },
  onError: (err, req, res) => {
    logger.error({ err, service: 'orchestrator' }, 'Proxy error')
    res.status(503).json({ error: 'Service temporarily unavailable' })
  }
}))

app.use('/api/keywords', createProxyMiddleware({
  target: services.keywordFetcher,
  changeOrigin: true,
  pathRewrite: { '^/api/keywords': '/keywords' }
}))

app.use('/api/scripts', createProxyMiddleware({
  target: services.scriptGenerator,
  changeOrigin: true,
  pathRewrite: { '^/api/scripts': '/scripts' }
}))

app.use('/api/tts', createProxyMiddleware({
  target: services.ttsRenderer,
  changeOrigin: true,
  pathRewrite: { '^/api/tts': '/tts' }
}))

app.use('/api/videos', createProxyMiddleware({
  target: services.videoAssembler,
  changeOrigin: true,
  pathRewrite: { '^/api/videos': '/videos' }
}))

app.use('/api/thumbnails', createProxyMiddleware({
  target: services.thumbnailMaker,
  changeOrigin: true,
  pathRewrite: { '^/api/thumbnails': '/thumbnails' }
}))

app.use('/api/metadata', createProxyMiddleware({
  target: services.metadataBuilder,
  changeOrigin: true,
  pathRewrite: { '^/api/metadata': '/metadata' }
}))

app.use('/api/upload', createProxyMiddleware({
  target: services.uploader,
  changeOrigin: true,
  pathRewrite: { '^/api/upload': '/upload' }
}))

app.use('/api/abtests', createProxyMiddleware({
  target: services.abTester,
  changeOrigin: true,
  pathRewrite: { '^/api/abtests': '/abtests' }
}))

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err }, 'Unhandled error')
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  logger.info({ port: PORT, services }, 'API Gateway started')
})

