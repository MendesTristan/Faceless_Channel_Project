#!/bin/bash

# Script to create a new microservice from template
# Usage: ./scripts/create-service.sh <service-name> <port>

SERVICE_NAME=$1
PORT=$2

if [ -z "$SERVICE_NAME" ] || [ -z "$PORT" ]; then
  echo "Usage: ./create-service.sh <service-name> <port>"
  echo "Example: ./create-service.sh script-generator 3003"
  exit 1
fi

SERVICE_DIR="services/${SERVICE_NAME}"
SERVICE_TITLE=$(echo "$SERVICE_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')

mkdir -p "$SERVICE_DIR/src"

# Create package.json
cat > "$SERVICE_DIR/package.json" <<EOF
{
  "name": "@faceless/${SERVICE_NAME}",
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
EOF

# Create tsconfig.json
cat > "$SERVICE_DIR/tsconfig.json" <<EOF
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
EOF

# Create Dockerfile
cat > "$SERVICE_DIR/Dockerfile" <<EOF
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
EOF

# Create index.ts
cat > "$SERVICE_DIR/src/index.ts" <<EOF
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
const PORT = process.env.PORT || ${PORT}

app.use(express.json())
app.use(pinoHttp({ logger }))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: '${SERVICE_NAME}',
    timestamp: new Date().toISOString()
  })
})

// TODO: Add your service endpoints here

app.listen(PORT, () => {
  logger.info({ port: PORT }, '${SERVICE_TITLE} service started')
})
EOF

# Create README.md
cat > "$SERVICE_DIR/README.md" <<EOF
# ${SERVICE_TITLE} Service

Microservice responsable de [DESCRIPTION].

## 🎯 Responsabilité

[À COMPLÉTER]

## 📡 API Endpoints

### GET /health

Health check endpoint.

## 🔧 Configuration

Variables d'environnement :

\`\`\`env
PORT=${PORT}
LOG_LEVEL=info
\`\`\`

## 🚀 Développement

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

## 📝 TODO

- [ ] Implémenter la logique métier
- [ ] Ajouter les endpoints REST
- [ ] Ajouter des tests unitaires
- [ ] Documenter l'API avec OpenAPI
EOF

echo "✅ Service ${SERVICE_NAME} created successfully in ${SERVICE_DIR}"
echo "Next steps:"
echo "  1. cd ${SERVICE_DIR}"
echo "  2. Implement your business logic in src/"
echo "  3. npm install"
echo "  4. npm run dev"

