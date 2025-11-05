# PowerShell script to create all remaining microservices

$services = @(
    @{Name="script-generator"; Port=3003},
    @{Name="tts-renderer"; Port=3004},
    @{Name="video-assembler"; Port=3005},
    @{Name="thumbnail-maker"; Port=3006},
    @{Name="metadata-builder"; Port=3007},
    @{Name="uploader"; Port=3008},
    @{Name="ab-tester"; Port=3009}
)

foreach ($service in $services) {
    $serviceName = $service.Name
    $port = $service.Port
    $serviceDir = "services/$serviceName"
    $serviceTitle = (Get-Culture).TextInfo.ToTitleCase($serviceName.Replace('-', ' '))
    
    Write-Host "Creating service: $serviceName on port $port" -ForegroundColor Green
    
    # Create directories
    New-Item -ItemType Directory -Force -Path "$serviceDir/src" | Out-Null
    
    # Create package.json
    @"
{
  "name": "@faceless/$serviceName",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.4.1",
    "pino": "^8.17.2",
    "pino-http": "^9.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.1",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
"@ | Out-File -FilePath "$serviceDir/package.json" -Encoding UTF8
    
    # Create tsconfig.json
    @"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
"@ | Out-File -FilePath "$serviceDir/tsconfig.json" -Encoding UTF8
    
    # Create Dockerfile
    @"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:$port/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
"@ | Out-File -FilePath "$serviceDir/Dockerfile" -Encoding UTF8
    
    # Create index.ts
    @"
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
const PORT = process.env.PORT || $port

app.use(express.json())
app.use(pinoHttp({ logger }))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: '$serviceName',
    timestamp: new Date().toISOString()
  })
})

// TODO: Implement service endpoints

app.listen(PORT, () => {
  logger.info({ port: PORT }, '$serviceTitle service started')
})
"@ | Out-File -FilePath "$serviceDir/src/index.ts" -Encoding UTF8
    
    # Create README.md
    @"
# $serviceTitle Service

Microservice for $serviceName functionality.

## 🎯 Responsibility

TODO: Add description

## 📡 API Endpoints

### GET /health

Health check endpoint.

## 🔧 Configuration

Environment variables:

\`\`\`env
PORT=$port
LOG_LEVEL=info
\`\`\`

## 🚀 Development

\`\`\`bash
# Installation
npm install

# Dev mode
npm run dev

# Build
npm run build

# Production
npm start
\`\`\`
"@ | Out-File -FilePath "$serviceDir/README.md" -Encoding UTF8
    
    Write-Host "✅ Created $serviceName" -ForegroundColor Green
}

Write-Host "`n🎉 All services created successfully!" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Implement business logic for each service"
Write-Host "2. Run 'docker-compose -f docker-compose.microservices.yml up -d' to start all services"
Write-Host "3. Access API Gateway at http://localhost:3000"

