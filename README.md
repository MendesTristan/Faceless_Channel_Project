# 🎬 Faceless Pipeline

Pipeline automatisée pour créer des vidéos YouTube faceless de A à Z : `keywords → script → tts → render → thumbnail → metadata → upload → A/B test`

---

## 🚀 Démarrage Rapide

**Vous voulez démarrer immédiatement ?**

```powershell
# Windows PowerShell
.\scripts\start-dev.ps1

# Linux/Mac  
docker-compose -f docker-compose.microservices.yml up -d
```

Puis accédez à http://localhost:3000

📖 **Guide complet** → [GETTING-STARTED.md](./GETTING-STARTED.md)

---

## 🏗️ Deux Architectures Disponibles

Ce projet propose **deux architectures** :

### 1️⃣ Architecture Monolithique (Original)
L'architecture d'origine avec tous les modules dans un seul processus.

📁 Code : `apps/` et `packages/`  
📖 Documentation : Voir section ci-dessous

### 2️⃣ Architecture Microservices (Nouveau) ⭐ **RECOMMANDÉ**
Architecture distribuée avec 10 services indépendants + infrastructure complète.

📁 Code : `services/`  
📖 Documentation : [README-MICROSERVICES.md](./README-MICROSERVICES.md)  
🏗️ Architecture : [ARCHITECTURE.md](./ARCHITECTURE.md)  
📊 Diagrammes : [docs/ARCHITECTURE-DIAGRAM.md](./docs/ARCHITECTURE-DIAGRAM.md)  
🔌 APIs : [docs/API.md](./docs/API.md)

**Pourquoi choisir les microservices ?**
- ✅ Scalabilité horizontale
- ✅ Résilience (isolation des pannes)
- ✅ Déploiement indépendant
- ✅ Technologies variées par service
- ✅ Production-ready

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| [INDEX.md](./INDEX.md) | 📑 Index de toute la documentation |
| [GETTING-STARTED.md](./GETTING-STARTED.md) | 🚀 Guide de démarrage rapide |
| [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) | 📊 Résumé du projet |
| [README-MICROSERVICES.md](./README-MICROSERVICES.md) | 🏗️ Guide des microservices |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 📐 Architecture technique |
| [docs/API.md](./docs/API.md) | 🔌 Documentation des APIs |

---

## 🏗️ Architecture Monolithique (Original)

### Structure du Projet

```
faceless-pipeline/
├── apps/
│   └── orchestrator/       # Orchestration BullMQ + CLI
├── packages/
│   ├── core/               # Logger, Config, State Manager, Retry, Executor
│   ├── types/              # Interfaces partagées et validations Zod
│   ├── keyword-fetcher/    # Récupération de keywords
│   ├── script-generator/   # Génération de scripts
│   ├── tts-renderer/       # Text-to-Speech
│   ├── video-assembler/    # Assemblage vidéo
│   ├── thumbnail-maker/    # Création de thumbnails
│   ├── metadata-builder/   # Génération de métadonnées
│   ├── uploader/           # Upload YouTube
│   └── ab-tester/          # Tests A/B
```

### Fonctionnalités Clés

✅ **Architecture modulaire** : Chaque module est indépendant avec interfaces typées  
✅ **Gestion d'état robuste** : PipelineStateManager pour tracking complet  
✅ **Retry automatique** : Système de retry avec backoff exponentiel  
✅ **Validation Zod** : Validation stricte des données à chaque étape  
✅ **Gestion d'erreurs** : Retry et logging détaillé  
✅ **Queue-based** : BullMQ pour traitement asynchrone  
✅ **Type-safe** : TypeScript strict avec interfaces partagées  

## 📦 Installation

```bash
git clone <votre-repo-url> faceless-pipeline
cd faceless-pipeline
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine :

```env
REDIS_URL=redis://localhost:6379
DATA_DIR=./data
NODE_ENV=development
LOG_LEVEL=info
```

## 🚀 Démarrage Rapide

```bash
# 1. Lancer Redis en local
docker compose up -d redis

# 2. Lancer le worker (dans un terminal)
npm run build
npx ts-node apps/orchestrator/src/index.ts

# 3. Lancer une pipeline (dans un autre terminal)
npm run run:full -- --topic "ETF débutants 2025" --format short
```

## 📋 Commandes Disponibles

```bash
# Lancer une pipeline complète
npm run run:full -- --topic "votre sujet" --format short

# Générer un script
npm run generate:script

# Builder une vidéo
npm run build:video

# Uploader une vidéo
npm run upload
```

## 📁 Structure des Données

Les artefacts sont écrits dans `data/` :
- `raw/` - Données brutes
- `prompts/` - Prompts utilisés
- `scripts/` - Scripts générés
- `audio/` - Fichiers audio
- `thumbs/` - Thumbnails
- `renders/` - Vidéos assemblées
- `logs/` - Logs
- `state/` - État des pipelines

## 🧩 Modules

Chaque module implémente une interface standard :

```typescript
interface Module<I, O> {
  name: string
  execute(input: I, context: PipelineContext): Promise<O>
  validate?(input: I): boolean
}
```

### Exemple d'implémentation

```typescript
class KeywordFetcherModule implements KeywordFetcher {
  name = 'keyword-fetcher'

  async execute(input: KeywordFetcherInput, context: PipelineContext) {
    // Votre logique ici
    return { keywords: [...] }
  }

  validate(input: KeywordFetcherInput): boolean {
    return !!input.topic && input.format === 'short' || input.format === 'long'
  }
}
```

## 🔄 Pipeline Flow

```
1. keyword-fetcher   → Extrait keywords pertinents
2. script-generator  → Génère script avec structure
3. tts-renderer      → Convertit en audio
4. video-assembler   → Assemble vidéo finale
5. thumbnail-maker   → Crée thumbnail
6. metadata-builder  → Génère métadonnées YouTube
7. uploader          → Upload sur YouTube
8. ab-tester         → Lance tests A/B
```

## 🐳 Déploiement

```bash
# Build et run avec Docker
docker compose up -d

# Vérifier les logs
docker compose logs -f runner
```

## 🛠️ Développement

```bash
# Build tous les packages
npm run build

# Linter
npm run lint

# Dev avec hot reload
npm run dev
```

---

## 🎯 Quelle Architecture Choisir ?

| Critère | Monolithe | Microservices |
|---------|-----------|---------------|
| **Complexité** | Simple | Avancée |
| **Déploiement** | 1 processus | 10+ containers |
| **Scalabilité** | Verticale seulement | Horizontale |
| **Développement** | Rapide (prototypage) | Structuré (production) |
| **Maintenance** | Simple pour petit projet | Meilleure pour équipe |
| **Production** | ⚠️ Limité | ✅ Recommandé |

**Recommandation :**
- 🧪 **Prototypage/MVP** → Monolithe
- 🚀 **Production/Scale** → Microservices

---

## 🆕 Nouveautés (Architecture Microservices)

### ✨ Infrastructure
- ✅ **Redis** - Queues & cache
- ✅ **RabbitMQ** - Message broker pour événements
- ✅ **PostgreSQL** - Base de données
- ✅ **MinIO** - Stockage S3-compatible

### 🎯 Services
- ✅ **API Gateway** (3000) - Point d'entrée unique
- ✅ **Orchestrator** (3001) - Orchestration BullMQ
- ✅ **8 Microservices** (3002-3009) - Services métier
  - Keyword Fetcher, Script Generator, TTS Renderer
  - Video Assembler, Thumbnail Maker, Metadata Builder
  - Uploader, AB Tester

### 🔧 Outils
- ✅ Docker Compose complet
- ✅ Scripts PowerShell (Windows)
- ✅ Makefile (Linux/Mac)
- ✅ Health checks
- ✅ Logging structuré (Pino)
- ✅ Rate limiting

### 📖 Documentation
- ✅ 7+ documents détaillés
- ✅ Diagrammes Mermaid
- ✅ OpenAPI specs
- ✅ Guides pas-à-pas

---

## 📊 Métriques

**Architecture Microservices créée :**
- 🏗️ **10 microservices** avec APIs REST
- 🐳 **14 containers** Docker (services + infra)
- 📝 **~2000 lignes** de TypeScript
- 📚 **~3500 lignes** de documentation
- ⚙️ **3 scripts** d'automatisation

---

## 🚀 Exemples d'Utilisation

### Créer un pipeline complet

```bash
# Via API Gateway (architecture microservices)
curl -X POST http://localhost:3000/api/pipelines/start \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Les meilleurs ETF pour débutants 2025",
    "format": "short"
  }'

# Réponse
{
  "pipelineId": "V1StGXR8_Z5jdHi6B-myT",
  "status": "queued"
}

# Vérifier le statut
curl http://localhost:3000/api/pipelines/status/V1StGXR8_Z5jdHi6B-myT
```

### Accès aux interfaces

Une fois les services démarrés :
- **API Gateway** : http://localhost:3000
- **RabbitMQ UI** : http://localhost:15672 (admin/admin123)
- **MinIO Console** : http://localhost:9001 (minioadmin/minioadmin123)

---

## 📝 TODO (Implémentation Réelle)

Les modules actuels retournent des **données mock**. À implémenter :

### APIs Tierces
- [ ] **Keywords** : SerpAPI, Google Keyword Planner, Ahrefs (~$50-300/mois)
- [ ] **Scripts** : OpenAI GPT-4, Claude (~$20-100/mois)
- [ ] **TTS** : ElevenLabs, Google TTS (~$50-300/mois)
- [ ] **Video** : FFmpeg + Stock footage API
- [ ] **Thumbnails** : DALL-E, Midjourney API
- [ ] **Upload** : YouTube Data API v3 (gratuit)

### Fonctionnalités
- [ ] Tests unitaires et E2E
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Authentication JWT
- [ ] CI/CD pipeline
- [ ] Déploiement Kubernetes

---

## 💰 Budget Estimé

Pour une implémentation production avec vraies APIs :

| Catégorie | Coût mensuel |
|-----------|--------------|
| APIs (Keywords, AI, TTS) | $150-400 |
| Stock videos/images | $50-100 |
| Serveur Cloud | $50-200 |
| **Total** | **$250-700/mois** |

---

## 🆘 Support & Ressources

### Documentation
- 📖 [INDEX.md](./INDEX.md) - Index complet
- 🚀 [GETTING-STARTED.md](./GETTING-STARTED.md) - Démarrage rapide
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée

### Liens Utiles
- [Docker Documentation](https://docs.docker.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Express.js Documentation](https://expressjs.com/)

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 🎉 Prêt à Commencer ?

**👉 [GETTING-STARTED.md](./GETTING-STARTED.md) - Démarrez maintenant !**
