# Architecture Microservices - Faceless Pipeline

## 🏗️ Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│                    (Port 3000 - Public)                          │
│               Auth • Rate Limiting • Routing                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR SERVICE                        │
│                        (Port 3001)                               │
│              Gestion du workflow • BullMQ • State                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   MESSAGE BROKER │
                    │    RabbitMQ      │
                    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   KEYWORD    │      │    SCRIPT    │     │     TTS      │
│   FETCHER    │      │  GENERATOR   │     │   RENDERER   │
│  (Port 3002) │      │ (Port 3003)  │     │ (Port 3004)  │
└──────────────┘      └──────────────┘     └──────────────┘

┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│    VIDEO     │      │  THUMBNAIL   │     │   METADATA   │
│  ASSEMBLER   │      │    MAKER     │     │   BUILDER    │
│  (Port 3005) │      │ (Port 3006)  │     │ (Port 3007)  │
└──────────────┘      └──────────────┘     └──────────────┘

┌──────────────┐      ┌──────────────┐
│   UPLOADER   │      │  AB TESTER   │
│  (Port 3008) │      │ (Port 3009)  │
└──────────────┘      └──────────────┘
```

## 📦 Services

### 1. **API Gateway** (Port 3000)
- **Rôle** : Point d'entrée unique pour les clients externes
- **Responsabilités** :
  - Routage des requêtes vers les services
  - Authentification JWT
  - Rate limiting
  - CORS
  - Load balancing
  - Logging centralisé
- **Tech** : Express.js + express-gateway ou NestJS
- **Endpoints** :
  - `POST /api/pipelines` - Créer un pipeline
  - `GET /api/pipelines/:id` - Status d'un pipeline
  - `GET /api/pipelines/:id/steps/:step` - Status d'une étape
  - `POST /api/videos/upload` - Upload direct

### 2. **Orchestrator Service** (Port 3001)
- **Rôle** : Chef d'orchestre du workflow
- **Responsabilités** :
  - Gestion de l'état du pipeline
  - Coordination des services
  - Retry logic
  - BullMQ pour queues
  - Publication d'événements
- **Tech** : Node.js + BullMQ + Redis
- **API** :
  - `POST /orchestrator/start` - Démarrer un pipeline
  - `GET /orchestrator/status/:id` - État du pipeline
  - `POST /orchestrator/retry/:id/:step` - Retry une étape

### 3. **Keyword Fetcher Service** (Port 3002)
- **Rôle** : Recherche de keywords SEO
- **API** :
  - `POST /keywords/fetch` - Récupérer des keywords
- **Intégrations** : Google Keyword Planner, SerpAPI, Ahrefs

### 4. **Script Generator Service** (Port 3003)
- **Rôle** : Génération de scripts vidéo
- **API** :
  - `POST /scripts/generate` - Générer un script
- **Intégrations** : OpenAI, Claude, Gemini

### 5. **TTS Renderer Service** (Port 3004)
- **Rôle** : Conversion text-to-speech
- **API** :
  - `POST /tts/render` - Générer audio
  - `GET /tts/voices` - Liste des voix disponibles
- **Intégrations** : ElevenLabs, Google TTS, Azure TTS

### 6. **Video Assembler Service** (Port 3005)
- **Rôle** : Assemblage vidéo
- **API** :
  - `POST /videos/assemble` - Créer une vidéo
  - `GET /videos/progress/:id` - Progression du rendu
- **Tech** : FFmpeg, Node.js
- **Storage** : MinIO ou S3 pour vidéos

### 7. **Thumbnail Maker Service** (Port 3006)
- **Rôle** : Génération de thumbnails
- **API** :
  - `POST /thumbnails/generate` - Créer un thumbnail
- **Intégrations** : DALL-E, Canvas, Sharp

### 8. **Metadata Builder Service** (Port 3007)
- **Rôle** : Génération de métadonnées YouTube
- **API** :
  - `POST /metadata/generate` - Générer métadonnées

### 9. **Uploader Service** (Port 3008)
- **Rôle** : Upload vers YouTube
- **API** :
  - `POST /upload/youtube` - Uploader une vidéo
  - `GET /upload/status/:id` - Status de l'upload
- **Intégrations** : YouTube Data API v3

### 10. **AB Tester Service** (Port 3009)
- **Rôle** : Tests A/B sur vidéos
- **API** :
  - `POST /abtests/create` - Créer un test A/B
  - `GET /abtests/:id/results` - Résultats du test

## 🔄 Communication Inter-Services

### Pattern 1 : **Synchrone (HTTP REST)**
Pour les opérations qui nécessitent une réponse immédiate.

```typescript
// Orchestrator appelle Keyword Fetcher
const response = await fetch('http://keyword-fetcher:3002/keywords/fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic, format })
})
```

### Pattern 2 : **Asynchrone (Event-Driven avec RabbitMQ)**
Pour les opérations longues et découplage.

```typescript
// Service publie un événement
await messageQueue.publish('pipeline.script.generated', {
  pipelineId,
  scriptId,
  data: script
})

// Service consomme l'événement
messageQueue.subscribe('pipeline.script.generated', async (msg) => {
  // Démarrer le TTS rendering
})
```

### Events Principaux :
- `pipeline.started`
- `pipeline.keywords.fetched`
- `pipeline.script.generated`
- `pipeline.audio.rendered`
- `pipeline.video.assembled`
- `pipeline.thumbnail.created`
- `pipeline.metadata.built`
- `pipeline.video.uploaded`
- `pipeline.abtest.started`
- `pipeline.completed`
- `pipeline.failed`

## 🗄️ Stockage

### Redis
- Sessions utilisateur
- Cache des résultats
- BullMQ queues
- Rate limiting counters

### PostgreSQL (ou MongoDB)
- État des pipelines
- Historique des jobs
- Résultats des A/B tests
- Métadonnées des vidéos

### MinIO / S3
- Fichiers audio
- Fichiers vidéo
- Thumbnails
- Assets temporaires

## 🐳 Docker Compose

Chaque service aura :
- Son propre Dockerfile
- Son propre container
- Variables d'environnement isolées
- Health checks
- Restart policies

## 🔐 Sécurité

### API Gateway
- JWT Authentication
- Rate limiting (100 req/min par IP)
- CORS configuré

### Inter-Services
- Service mesh (Istio) ou tokens internes
- Network isolation (docker network)
- Secrets management (Docker Secrets / Vault)

## 📊 Monitoring

### Logging
- Centralisé avec Loki ou ELK
- Structured logging (JSON)
- Correlation IDs pour traçabilité

### Metrics
- Prometheus + Grafana
- Métriques par service :
  - Request rate
  - Error rate
  - Response time
  - Queue length

### Health Checks
- `/health` endpoint sur chaque service
- `/ready` pour readiness probe

## 🚀 Scalabilité

Chaque service peut être scalé indépendamment :
```bash
docker compose up -d --scale keyword-fetcher=3
docker compose up -d --scale video-assembler=2
```

## 📝 Avantages de cette Architecture

✅ **Isolation** : Chaque service peut être développé/déployé indépendamment  
✅ **Scalabilité** : Scale uniquement les services gourmands  
✅ **Résilience** : Un service en panne n'affecte pas les autres  
✅ **Technologie** : Chaque service peut utiliser sa propre stack  
✅ **Équipe** : Équipes différentes peuvent travailler sur différents services  
✅ **Monitoring** : Métriques détaillées par service  

## 📝 Inconvénients à Gérer

⚠️ **Complexité** : Plus de composants à gérer  
⚠️ **Latence** : Appels réseau entre services  
⚠️ **Débogage** : Traçabilité distribuée nécessaire  
⚠️ **Transactions** : Pas de transactions ACID entre services (saga pattern)  
⚠️ **Testing** : Tests d'intégration plus complexes  

## 🔧 Technologies Utilisées

- **Runtime** : Node.js 20 + TypeScript
- **Framework** : Express.js ou NestJS
- **Queue** : BullMQ + Redis
- **Events** : RabbitMQ ou Apache Kafka
- **Database** : PostgreSQL
- **Storage** : MinIO (S3-compatible)
- **Container** : Docker + Docker Compose
- **API Docs** : Swagger/OpenAPI
- **Monitoring** : Prometheus + Grafana
- **Logging** : Pino + Loki

