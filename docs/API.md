# API Documentation

Documentation complète des APIs des microservices du Faceless Pipeline.

## 📍 Points d'accès

Tous les services sont accessibles via l'**API Gateway** sur `http://localhost:3000`

### Services disponibles

| Service | Port Direct | Via API Gateway | Documentation |
|---------|------------|-----------------|---------------|
| API Gateway | 3000 | - | - |
| Orchestrator | 3001 | `/api/pipelines` | [Docs](#orchestrator-api) |
| Keyword Fetcher | 3002 | `/api/keywords` | [OpenAPI](../services/keyword-fetcher/openapi.yaml) |
| Script Generator | 3003 | `/api/scripts` | [Docs](#script-generator-api) |
| TTS Renderer | 3004 | `/api/tts` | [Docs](#tts-renderer-api) |
| Video Assembler | 3005 | `/api/videos` | [Docs](#video-assembler-api) |
| Thumbnail Maker | 3006 | `/api/thumbnails` | [Docs](#thumbnail-maker-api) |
| Metadata Builder | 3007 | `/api/metadata` | [Docs](#metadata-builder-api) |
| Uploader | 3008 | `/api/upload` | [Docs](#uploader-api) |
| AB Tester | 3009 | `/api/abtests` | [Docs](#ab-tester-api) |

## 🚀 Workflow Complet

### Créer un pipeline complet (E2E)

```http
POST http://localhost:3000/api/pipelines/start
Content-Type: application/json

{
  "topic": "Les meilleurs ETF pour débutants 2025",
  "format": "short"
}
```

**Réponse:**
```json
{
  "pipelineId": "V1StGXR8_Z5jdHi6B-myT",
  "status": "queued",
  "message": "Pipeline has been queued for execution"
}
```

### Suivre le statut

```http
GET http://localhost:3000/api/pipelines/status/V1StGXR8_Z5jdHi6B-myT
```

**Réponse:**
```json
{
  "pipelineId": "V1StGXR8_Z5jdHi6B-myT",
  "status": "active",
  "data": {
    "id": "V1StGXR8_Z5jdHi6B-myT",
    "topic": "Les meilleurs ETF pour débutants 2025",
    "format": "short",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "progress": 45,
  "createdAt": 1704067200000,
  "processedOn": 1704067205000
}
```

## 📋 APIs par Service

---

## Orchestrator API

### POST `/api/pipelines/start`

Lance un nouveau pipeline complet.

**Request:**
```json
{
  "topic": "string (required)",
  "format": "short" | "long"
}
```

**Response: 202 Accepted**
```json
{
  "pipelineId": "string",
  "status": "queued",
  "message": "string"
}
```

### GET `/api/pipelines/status/:id`

Récupère le statut d'un pipeline.

**Response: 200 OK**
```json
{
  "pipelineId": "string",
  "status": "waiting" | "active" | "completed" | "failed",
  "data": {...},
  "progress": 0-100,
  "createdAt": "timestamp",
  "processedOn": "timestamp",
  "finishedOn": "timestamp",
  "failedReason": "string?"
}
```

### GET `/api/pipelines`

Liste tous les pipelines.

**Query params:**
- `limit` (optional): Nombre max de résultats (default: 50)

**Response: 200 OK**
```json
{
  "pipelines": [...]
}
```

---

## Keyword Fetcher API

Voir la documentation OpenAPI complète : [openapi.yaml](../services/keyword-fetcher/openapi.yaml)

### POST `/api/keywords/fetch`

Récupère des keywords SEO.

**Request:**
```json
{
  "topic": "ETF débutants 2025",
  "format": "short",
  "limit": 10
}
```

**Response: 200 OK**
```json
{
  "keywords": [
    {
      "keyword": "ETF débutants 2025",
      "searchVolume": 10000,
      "competition": "medium",
      "cpc": 1.5
    }
  ]
}
```

---

## Script Generator API

### POST `/api/scripts/generate`

Génère un script vidéo.

**Request:**
```json
{
  "topic": "ETF débutants 2025",
  "keywords": [...],
  "format": "short"
}
```

**Response: 200 OK**
```json
{
  "script": {
    "title": "string",
    "description": "string",
    "transcript": "string",
    "segments": [
      {
        "text": "string",
        "timestamp": 0
      }
    ],
    "tags": ["string"]
  }
}
```

---

## TTS Renderer API

### POST `/api/tts/render`

Convertit un script en audio (Text-to-Speech).

**Request:**
```json
{
  "script": {...},
  "voice": "en-US-Neural2-A",
  "speed": 1.0
}
```

**Response: 200 OK**
```json
{
  "audioPath": "s3://bucket/audio/abc123.mp3",
  "duration": 60
}
```

### GET `/api/tts/voices`

Liste les voix disponibles.

**Response: 200 OK**
```json
{
  "voices": [
    {
      "id": "en-US-Neural2-A",
      "name": "English (US) - Neural",
      "language": "en-US",
      "gender": "male"
    }
  ]
}
```

---

## Video Assembler API

### POST `/api/videos/assemble`

Assemble une vidéo complète.

**Request:**
```json
{
  "script": {...},
  "audioPath": "s3://bucket/audio/abc123.mp3",
  "backgroundVideo": "s3://bucket/backgrounds/stock1.mp4"
}
```

**Response: 200 OK**
```json
{
  "videoPath": "s3://bucket/videos/abc123.mp4",
  "duration": 60
}
```

### GET `/api/videos/progress/:id`

Récupère la progression du rendu vidéo.

**Response: 200 OK**
```json
{
  "videoId": "string",
  "status": "processing",
  "progress": 45,
  "estimatedTimeRemaining": 120
}
```

---

## Thumbnail Maker API

### POST `/api/thumbnails/generate`

Génère un thumbnail.

**Request:**
```json
{
  "script": {...},
  "videoPath": "s3://bucket/videos/abc123.mp4",
  "style": "modern" | "minimal" | "bold"
}
```

**Response: 200 OK**
```json
{
  "thumbnailPath": "s3://bucket/thumbnails/abc123.jpg"
}
```

---

## Metadata Builder API

### POST `/api/metadata/generate`

Génère des métadonnées YouTube.

**Request:**
```json
{
  "script": {...},
  "videoPath": "string",
  "thumbnailPath": "string"
}
```

**Response: 200 OK**
```json
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "categoryId": "22",
  "privacyStatus": "private"
}
```

---

## Uploader API

### POST `/api/upload/youtube`

Upload une vidéo sur YouTube.

**Request:**
```json
{
  "videoPath": "string",
  "thumbnailPath": "string",
  "metadata": {...}
}
```

**Response: 200 OK**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "uploadDate": "2025-01-01T00:00:00.000Z"
}
```

### GET `/api/upload/status/:id`

Récupère le statut d'un upload.

**Response: 200 OK**
```json
{
  "uploadId": "string",
  "status": "uploading" | "processing" | "completed" | "failed",
  "progress": 75,
  "videoId": "string?"
}
```

---

## AB Tester API

### POST `/api/abtests/create`

Crée un test A/B.

**Request:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "variants": [
    {
      "title": "Version A du titre",
      "description": "Version A de la description"
    },
    {
      "title": "Version B du titre",
      "description": "Version B de la description"
    }
  ]
}
```

**Response: 200 OK**
```json
{
  "testId": "string",
  "variantIds": ["string"]
}
```

### GET `/api/abtests/:id/results`

Récupère les résultats d'un test A/B.

**Response: 200 OK**
```json
{
  "testId": "string",
  "status": "running" | "completed",
  "variants": [
    {
      "variantId": "string",
      "views": 1000,
      "clickThroughRate": 0.12,
      "watchTime": 45
    }
  ],
  "winner": "string?"
}
```

---

## 🔐 Authentication

**TODO:** Implémenter l'authentification JWT

Headers requis (futur):
```
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
```

## ⚠️ Rate Limiting

L'API Gateway implémente un rate limiting:
- **100 requêtes par minute** par IP
- Header de réponse : `X-RateLimit-Remaining`

## 📊 Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Success |
| 202 | Accepted (async operation) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## 📝 Headers communs

### Request
- `Content-Type: application/json`
- `X-Pipeline-ID: <pipeline-id>` (pour traçabilité)

### Response
- `Content-Type: application/json`
- `X-Request-ID: <request-id>`
- `X-RateLimit-Remaining: <count>`

## 🧪 Exemples avec cURL

### Créer un pipeline
```bash
curl -X POST http://localhost:3000/api/pipelines/start \
  -H "Content-Type: application/json" \
  -d '{"topic":"ETF débutants 2025","format":"short"}'
```

### Vérifier le statut
```bash
curl http://localhost:3000/api/pipelines/status/abc123
```

### Récupérer des keywords
```bash
curl -X POST http://localhost:3000/api/keywords/fetch \
  -H "Content-Type: application/json" \
  -d '{"topic":"crypto","format":"short","limit":5}'
```

