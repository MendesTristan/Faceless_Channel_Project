# 🚀 Getting Started - Faceless Pipeline Microservices

Bienvenue ! Ce guide vous aidera à démarrer avec l'architecture microservices du Faceless Pipeline.

## ✅ Ce qui a été fait

Votre projet a été transformé en une **architecture microservices complète** avec :

### Infrastructure ✓
- ✅ **Redis** - Pour les queues BullMQ et le cache
- ✅ **RabbitMQ** - Message broker pour les événements asynchrones
- ✅ **PostgreSQL** - Base de données relationnelle
- ✅ **MinIO** - Stockage S3-compatible pour les fichiers media

### Services ✓
- ✅ **API Gateway** (Port 3000) - Point d'entrée unique avec rate limiting
- ✅ **Orchestrator** (Port 3001) - Orchestration du workflow avec BullMQ
- ✅ **Keyword Fetcher** (Port 3002) - Service de recherche de keywords
- ✅ **Script Generator** (Port 3003) - Génération de scripts
- ✅ **TTS Renderer** (Port 3004) - Text-to-Speech
- ✅ **Video Assembler** (Port 3005) - Assemblage vidéo
- ✅ **Thumbnail Maker** (Port 3006) - Création de thumbnails
- ✅ **Metadata Builder** (Port 3007) - Génération de métadonnées
- ✅ **Uploader** (Port 3008) - Upload YouTube
- ✅ **AB Tester** (Port 3009) - Tests A/B

### Communication ✓
- ✅ HTTP REST pour communication synchrone
- ✅ RabbitMQ pour événements asynchrones
- ✅ Network Docker isolé pour sécurité

### Documentation ✓
- ✅ Architecture complète ([ARCHITECTURE.md](./ARCHITECTURE.md))
- ✅ Documentation API ([docs/API.md](./docs/API.md))
- ✅ OpenAPI spec pour Keyword Fetcher ([services/keyword-fetcher/openapi.yaml](./services/keyword-fetcher/openapi.yaml))
- ✅ README détaillé ([README-MICROSERVICES.md](./README-MICROSERVICES.md))

## 🎯 Démarrage Rapide

### Étape 1 : Prérequis

Installez les outils nécessaires :
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac/Linux)
- [Node.js 20+](https://nodejs.org/) (pour développement local)

### Étape 2 : Lancer les services

**Sur Windows PowerShell :**
```powershell
# Démarrer tous les services
.\scripts\start-dev.ps1
```

**Sur Linux/Mac :**
```bash
# Démarrer tous les services
docker-compose -f docker-compose.microservices.yml up -d

# Ou avec Make
make start
```

### Étape 3 : Vérifier que tout fonctionne

Attendez environ 30 secondes que tous les services démarrent, puis :

```powershell
# Tester l'API Gateway
curl http://localhost:3000/health

# Tester l'Orchestrator
curl http://localhost:3001/health

# Tester Keyword Fetcher
curl http://localhost:3002/health
```

### Étape 4 : Créer votre premier pipeline

```powershell
# Créer un pipeline
curl -X POST http://localhost:3000/api/pipelines/start `
  -H "Content-Type: application/json" `
  -d '{"topic":"Les meilleurs ETF pour débutants 2025","format":"short"}'

# Réponse attendue :
# {
#   "pipelineId": "V1StGXR8_Z5jdHi6B-myT",
#   "status": "queued"
# }

# Vérifier le statut
curl http://localhost:3000/api/pipelines/status/V1StGXR8_Z5jdHi6B-myT
```

## 🎨 Interfaces Disponibles

Une fois les services démarrés, accédez à :

| Interface | URL | Identifiants |
|-----------|-----|--------------|
| **API Gateway** | http://localhost:3000 | - |
| **RabbitMQ Management** | http://localhost:15672 | admin / admin123 |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |

## 📊 Visualiser l'état

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose -f docker-compose.microservices.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.microservices.yml logs -f orchestrator

# Filtrer les erreurs
docker-compose -f docker-compose.microservices.yml logs -f | findstr "ERROR"
```

### Voir l'état des services

```bash
docker-compose -f docker-compose.microservices.yml ps
```

### Voir les événements dans RabbitMQ

1. Ouvrir http://localhost:15672
2. Login: `admin` / `admin123`
3. Aller dans l'onglet "Queues"
4. Voir les messages en transit

## 🔧 Prochaines Étapes

### 1. Implémenter les logiques métier

Actuellement, tous les services retournent des **données mock**. Il faut implémenter les vraies intégrations :

#### a) Keyword Fetcher
```typescript
// services/keyword-fetcher/src/keyword-service.ts
async fetchKeywords(input: FetchKeywordsInput): Promise<FetchKeywordsOutput> {
  // TODO: Intégrer avec SerpAPI, Google Keyword Planner, etc.
  const response = await serpapi.search({
    q: input.topic,
    engine: 'google',
    api_key: process.env.SERPAPI_KEY
  })
  
  return { keywords: response.keywords }
}
```

**APIs recommandées :**
- [SerpAPI](https://serpapi.com/) - $50/mois pour 5000 requêtes
- [DataForSEO](https://dataforseo.com/) - $100/mois
- [Ahrefs API](https://ahrefs.com/api) - $300/mois

#### b) Script Generator
```typescript
// services/script-generator/src/script-service.ts
async generateScript(input: ScriptGeneratorInput): Promise<ScriptGeneratorOutput> {
  // TODO: Intégrer avec OpenAI, Claude, etc.
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a YouTube script writer...' },
      { role: 'user', content: `Write a ${input.format} video script about ${input.topic}` }
    ]
  })
  
  return { script: parseScript(completion.choices[0].message.content) }
}
```

**APIs recommandées :**
- [OpenAI GPT-4](https://platform.openai.com/) - ~$0.03/1K tokens
- [Claude by Anthropic](https://www.anthropic.com/) - ~$0.02/1K tokens
- [Google Gemini](https://ai.google.dev/) - Gratuit avec quotas

#### c) TTS Renderer
```typescript
// services/tts-renderer/src/tts-service.ts
async renderTTS(input: TTSRendererInput): Promise<TTSRendererOutput> {
  // TODO: Intégrer avec ElevenLabs, Google TTS, etc.
  const audio = await elevenlabs.textToSpeech({
    text: input.script.transcript,
    voice_id: input.voice || 'default',
    model_id: 'eleven_monolingual_v1'
  })
  
  const audioPath = await this.uploadToMinio(audio)
  
  return { audioPath, duration: calculateDuration(audio) }
}
```

**APIs recommandées :**
- [ElevenLabs](https://elevenlabs.io/) - $5-$99/mois selon usage
- [Google Cloud TTS](https://cloud.google.com/text-to-speech) - $4/1M chars
- [Azure TTS](https://azure.microsoft.com/en-us/products/ai-services/text-to-speech) - $4/1M chars

#### d) Video Assembler (Le plus complexe)
```typescript
// services/video-assembler/src/video-service.ts
async assembleVideo(input: VideoAssemblerInput): Promise<VideoAssemblerOutput> {
  // TODO: Implémenter avec FFmpeg
  const videoPath = await this.ffmpeg
    .input(input.audioPath)
    .input(input.backgroundVideo)
    .complexFilter([
      // Ajouter sous-titres
      // Synchroniser audio/vidéo
      // Ajouter effets
    ])
    .output('output.mp4')
    .run()
  
  return { videoPath, duration: getVideoDuration(videoPath) }
}
```

**Technologies nécessaires :**
- [FFmpeg](https://ffmpeg.org/) - Installation dans le Dockerfile
- [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg) - Wrapper Node.js
- Stock videos : [Pexels API](https://www.pexels.com/api/), [Storyblocks](https://www.storyblocks.com/)

#### e) Uploader
```typescript
// services/uploader/src/uploader-service.ts
async uploadToYouTube(input: UploaderInput): Promise<UploaderOutput> {
  // TODO: Intégrer avec YouTube Data API v3
  const youtube = google.youtube('v3')
  
  const response = await youtube.videos.insert({
    auth: oauth2Client,
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: input.metadata.title,
        description: input.metadata.description,
        tags: input.metadata.tags
      },
      status: {
        privacyStatus: input.metadata.privacyStatus
      }
    },
    media: {
      body: fs.createReadStream(input.videoPath)
    }
  })
  
  return {
    videoId: response.data.id,
    url: `https://youtube.com/watch?v=${response.data.id}`,
    uploadDate: new Date().toISOString()
  }
}
```

**Configuration nécessaire :**
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- OAuth2 credentials
- Quotas : 10,000 units/jour (gratuit)

### 2. Ajouter les clés API

Éditez le fichier `.env` à la racine et ajoutez vos clés :

```env
# Keyword Research
SERPAPI_KEY=your_serpapi_key

# AI/LLM
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...

# Text-to-Speech
ELEVENLABS_API_KEY=...

# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
```

### 3. Tests et débogage

```bash
# Tester un service individuellement
cd services/keyword-fetcher
npm install
npm run dev

# Le service sera disponible sur localhost:3002
```

### 4. Monitoring (Optionnel mais recommandé)

Ajouter Prometheus + Grafana pour le monitoring :

```yaml
# Ajouter dans docker-compose.microservices.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  
grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

## 📚 Documentation Complète

- **Architecture détaillée** : [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Documentation API** : [docs/API.md](./docs/API.md)
- **Guide microservices** : [README-MICROSERVICES.md](./README-MICROSERVICES.md)
- **OpenAPI Spec** : [services/keyword-fetcher/openapi.yaml](./services/keyword-fetcher/openapi.yaml)

## 🆘 Besoin d'aide ?

### Problèmes courants

**1. Les services ne démarrent pas**
```bash
# Vérifier Docker
docker info

# Vérifier les logs
docker-compose -f docker-compose.microservices.yml logs

# Rebuild tout
docker-compose -f docker-compose.microservices.yml build --no-cache
docker-compose -f docker-compose.microservices.yml up -d
```

**2. Port déjà utilisé**
```yaml
# Modifier dans docker-compose.microservices.yml
ports:
  - "3012:3002"  # Change le port externe
```

**3. Services ne se connectent pas**
```bash
# Vérifier le réseau Docker
docker network inspect faceless-network
```

## 💰 Budget Estimé

Pour une implémentation production-ready avec les vraies APIs :

| Catégorie | Coût mensuel |
|-----------|-------------|
| Keyword Research (SerpAPI) | $50 |
| AI/LLM (OpenAI GPT-4) | $50-200 |
| Text-to-Speech (ElevenLabs) | $99 |
| Stock Videos (Pexels/Storyblocks) | $0-100 |
| Serveur Cloud (AWS/GCP) | $50-200 |
| **Total** | **$250-650/mois** |

## 🎉 Conclusion

Vous avez maintenant une **architecture microservices complète et scalable** ! 

**Avantages :**
✅ Chaque service est indépendant et peut être déployé séparément  
✅ Scalabilité horizontale (scale uniquement les services nécessaires)  
✅ Résilience (un service en panne n'affecte pas les autres)  
✅ Communication asynchrone via événements  
✅ Monitoring et observabilité  

**Prochaine étape : Implémenter les vraies intégrations API !**

Bon développement ! 🚀

