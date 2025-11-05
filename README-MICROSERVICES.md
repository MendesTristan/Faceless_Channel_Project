# Faceless Pipeline - Architecture Microservices

Pipeline automatisée pour créer des vidéos YouTube faceless, basée sur une architecture microservices moderne.

## 🏗️ Architecture

L'application est composée de **11 services** :

### Infrastructure (3 services)
- **Redis** - Queue management (BullMQ) et cache
- **RabbitMQ** - Event bus pour communication asynchrone
- **PostgreSQL** - Base de données relationnelle
- **MinIO** - Stockage S3-compatible pour fichiers media

### Application (10 services)
1. **API Gateway** (Port 3000) - Point d'entrée unique
2. **Orchestrator** (Port 3001) - Orchestration du workflow
3. **Keyword Fetcher** (Port 3002) - Recherche de keywords SEO
4. **Script Generator** (Port 3003) - Génération de scripts vidéo
5. **TTS Renderer** (Port 3004) - Text-to-Speech
6. **Video Assembler** (Port 3005) - Assemblage vidéo avec FFmpeg
7. **Thumbnail Maker** (Port 3006) - Création de thumbnails
8. **Metadata Builder** (Port 3007) - Génération de métadonnées YouTube
9. **Uploader** (Port 3008) - Upload vers YouTube
10. **AB Tester** (Port 3009) - Tests A/B

## 🚀 Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- Node.js 20+ (pour développement local)

### 1. Configuration

Copiez le fichier d'environnement :

```bash
# Sur Windows PowerShell
Copy-Item .env.example .env

# Sur Linux/Mac
cp .env.example .env
```

Éditez `.env` et ajoutez vos clés API.

### 2. Lancer tous les services

```bash
docker-compose -f docker-compose.microservices.yml up -d
```

### 3. Vérifier que tout fonctionne

```bash
# Vérifier l'état des services
docker-compose -f docker-compose.microservices.yml ps

# Vérifier les logs
docker-compose -f docker-compose.microservices.yml logs -f

# Tester l'API Gateway
curl http://localhost:3000/health
```

### 4. Accéder aux interfaces

- **API Gateway** : http://localhost:3000
- **RabbitMQ Management** : http://localhost:15672 (admin/admin123)
- **MinIO Console** : http://localhost:9001 (minioadmin/minioadmin123)

## 📡 Utilisation de l'API

### Créer un pipeline complet

```bash
POST http://localhost:3000/api/pipelines/start
Content-Type: application/json

{
  "topic": "Les meilleurs ETF pour débutants 2025",
  "format": "short"
}
```

Réponse :
```json
{
  "pipelineId": "abc123xyz",
  "status": "queued",
  "message": "Pipeline has been queued for execution"
}
```

### Vérifier le statut d'un pipeline

```bash
GET http://localhost:3000/api/pipelines/status/abc123xyz
```

### Lister tous les pipelines

```bash
GET http://localhost:3000/api/pipelines?limit=50
```

## 🔧 Développement

### Développer un service individuellement

```bash
cd services/keyword-fetcher
npm install
npm run dev
```

Le service sera disponible sur son port dédié (ex: 3002).

### Structure d'un service

```
services/keyword-fetcher/
├── src/
│   ├── index.ts              # Point d'entrée Express
│   ├── service.ts            # Logique métier
│   └── types.ts              # Types TypeScript
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

### Pattern de communication

#### 1. Communication synchrone (HTTP)

```typescript
// L'orchestrator appelle un service
const response = await axios.post('http://keyword-fetcher:3002/keywords/fetch', {
  topic: 'crypto',
  format: 'short'
})
```

#### 2. Communication asynchrone (Events via RabbitMQ)

```typescript
// Publier un événement
await eventBus.publish('pipeline.script.generated', {
  pipelineId: '123',
  data: scriptData
})

// S'abonner à un événement
await eventBus.subscribe('pipeline.script.generated', async (data) => {
  // Traiter l'événement
})
```

## 🐳 Docker Commands Utiles

```bash
# Démarrer tous les services
docker-compose -f docker-compose.microservices.yml up -d

# Démarrer un service spécifique
docker-compose -f docker-compose.microservices.yml up -d keyword-fetcher

# Arrêter tous les services
docker-compose -f docker-compose.microservices.yml down

# Rebuild un service
docker-compose -f docker-compose.microservices.yml up -d --build keyword-fetcher

# Voir les logs d'un service
docker-compose -f docker-compose.microservices.yml logs -f orchestrator

# Scaler un service
docker-compose -f docker-compose.microservices.yml up -d --scale keyword-fetcher=3

# Supprimer tous les volumes (attention : perte de données)
docker-compose -f docker-compose.microservices.yml down -v
```

## 📊 Monitoring & Debugging

### Health Checks

Chaque service expose un endpoint `/health` :

```bash
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Orchestrator
curl http://localhost:3002/health  # Keyword Fetcher
# etc...
```

### Logs structurés

Tous les services utilisent **Pino** pour le logging structuré en JSON :

```bash
# Voir tous les logs
docker-compose -f docker-compose.microservices.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.microservices.yml logs -f keyword-fetcher

# Filtrer par niveau
docker-compose -f docker-compose.microservices.yml logs -f | grep "ERROR"
```

### RabbitMQ Management

Accédez à http://localhost:15672 pour :
- Voir les queues et exchanges
- Monitorer les messages
- Débugger les événements

### Redis

```bash
# Se connecter à Redis
docker exec -it faceless-redis redis-cli

# Voir les jobs BullMQ
KEYS *
HGETALL bull:pipelines:*
```

## 🔐 Sécurité

### Variables sensibles

**Ne jamais commiter** les fichiers `.env` avec des vraies clés API.

### Communication inter-services

Les services communiquent via un réseau Docker privé (`faceless-network`). Seul l'API Gateway est exposé publiquement.

### Authentication (À implémenter)

L'API Gateway devrait implémenter :
- JWT authentication
- Rate limiting (déjà présent)
- API keys pour services externes

## 📈 Scalabilité

### Scaler horizontalement

```bash
# Scaler le service keyword-fetcher à 3 instances
docker-compose -f docker-compose.microservices.yml up -d --scale keyword-fetcher=3

# Scaler le service video-assembler (CPU intensive)
docker-compose -f docker-compose.microservices.yml up -d --scale video-assembler=2
```

### Load Balancing

Docker Compose gère automatiquement le load balancing entre les instances scalées.

## 🧪 Tests

### Tester un service individuellement

```bash
cd services/keyword-fetcher
npm test
```

### Tests d'intégration

```bash
# TODO: Implémenter des tests E2E
npm run test:e2e
```

## 📝 TODO

### Infrastructure
- [ ] Ajouter Prometheus + Grafana pour monitoring
- [ ] Implémenter distributed tracing (Jaeger/Zipkin)
- [ ] Ajouter un API Gateway plus robuste (Kong/Traefik)
- [ ] Implémenter service mesh (Istio/Linkerd)

### Services
- [ ] Implémenter les logiques métier réelles pour chaque service
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Documenter les APIs avec OpenAPI/Swagger
- [ ] Implémenter le circuit breaker pattern
- [ ] Ajouter un système de retry plus sophistiqué

### Sécurité
- [ ] Implémenter JWT authentication
- [ ] Ajouter HTTPS/TLS
- [ ] Implémenter API keys
- [ ] Ajouter un WAF (Web Application Firewall)

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes deployment files
- [ ] Helm charts
- [ ] Infrastructure as Code (Terraform)

## 🆘 Dépannage

### Service ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.microservices.yml logs keyword-fetcher

# Vérifier les dépendances
docker-compose -f docker-compose.microservices.yml ps

# Rebuild le service
docker-compose -f docker-compose.microservices.yml up -d --build keyword-fetcher
```

### Port déjà utilisé

Si un port est déjà utilisé, modifiez le mapping dans `docker-compose.microservices.yml` :

```yaml
ports:
  - "3002:3002"  # Change à "3012:3002" par exemple
```

### Problèmes de connexion entre services

Vérifiez que tous les services sont sur le même réseau :

```bash
docker network inspect faceless-network
```

## 📚 Ressources

- [Documentation complète de l'architecture](./ARCHITECTURE.md)
- [API Gateway docs](./services/api-gateway/README.md)
- [Orchestrator docs](./services/orchestrator/README.md)

## 📄 Licence

Propriétaire - Tous droits réservés

