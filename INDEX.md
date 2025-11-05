# 📑 Index - Documentation Faceless Pipeline Microservices

Bienvenue ! Ce document vous guide vers toute la documentation du projet.

## 🚀 Pour Commencer

**Nouveau sur le projet ? Commencez ici :**

1. 📖 [**GETTING-STARTED.md**](./GETTING-STARTED.md) - Guide de démarrage rapide
2. 📊 [**PROJECT-SUMMARY.md**](./PROJECT-SUMMARY.md) - Résumé du projet

## 📚 Documentation Principale

| Document | Description | Pour qui ? |
|----------|-------------|------------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Guide de démarrage, premiers pas | 🆕 Débutants |
| [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) | Résumé complet du projet | 👥 Tous |
| [README-MICROSERVICES.md](./README-MICROSERVICES.md) | Guide détaillé des microservices | 👨‍💻 Développeurs |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture technique détaillée | 🏗️ Architectes |
| [docs/API.md](./docs/API.md) | Documentation des APIs | 🔌 Intégrateurs |
| [docs/ARCHITECTURE-DIAGRAM.md](./docs/ARCHITECTURE-DIAGRAM.md) | Diagrammes visuels | 📊 Visuels |

## 🎯 Par Cas d'Usage

### Je veux démarrer le projet
→ [GETTING-STARTED.md](./GETTING-STARTED.md)

### Je veux comprendre l'architecture
→ [ARCHITECTURE.md](./ARCHITECTURE.md) + [docs/ARCHITECTURE-DIAGRAM.md](./docs/ARCHITECTURE-DIAGRAM.md)

### Je veux utiliser les APIs
→ [docs/API.md](./docs/API.md)

### Je veux développer un service
→ [README-MICROSERVICES.md](./README-MICROSERVICES.md)

### Je veux voir un exemple complet
→ [services/keyword-fetcher/](./services/keyword-fetcher/)

## 📁 Structure des Services

Tous les services suivent la même structure :

```
services/<service-name>/
├── src/
│   ├── index.ts              # Point d'entrée Express
│   ├── <service>-service.ts  # Logique métier
│   └── types.ts              # Types (optionnel)
├── Dockerfile                # Image Docker
├── package.json              # Dépendances
├── tsconfig.json             # Config TypeScript
├── openapi.yaml              # Spec OpenAPI (optionnel)
└── README.md                 # Documentation du service
```

## 🔗 Liens Rapides

### Services

| Service | Port | Doc | OpenAPI |
|---------|------|-----|---------|
| [API Gateway](./services/api-gateway/) | 3000 | [README](./services/api-gateway/README.md) | - |
| [Orchestrator](./services/orchestrator/) | 3001 | [README](./services/orchestrator/README.md) | - |
| [Keyword Fetcher](./services/keyword-fetcher/) | 3002 | [README](./services/keyword-fetcher/README.md) | [✓](./services/keyword-fetcher/openapi.yaml) |
| [Script Generator](./services/script-generator/) | 3003 | [README](./services/script-generator/README.md) | - |
| [TTS Renderer](./services/tts-renderer/) | 3004 | [README](./services/tts-renderer/README.md) | - |
| [Video Assembler](./services/video-assembler/) | 3005 | [README](./services/video-assembler/README.md) | - |
| [Thumbnail Maker](./services/thumbnail-maker/) | 3006 | [README](./services/thumbnail-maker/README.md) | - |
| [Metadata Builder](./services/metadata-builder/) | 3007 | [README](./services/metadata-builder/README.md) | - |
| [Uploader](./services/uploader/) | 3008 | [README](./services/uploader/README.md) | - |
| [AB Tester](./services/ab-tester/) | 3009 | [README](./services/ab-tester/README.md) | - |

### Scripts

| Script | Description | Plateforme |
|--------|-------------|------------|
| [start-dev.ps1](./scripts/start-dev.ps1) | Démarrer en dev | Windows |
| [create-service.sh](./scripts/create-service.sh) | Créer un service | Linux/Mac |
| [create-all-services.ps1](./scripts/create-all-services.ps1) | Créer tous les services | Windows |

### Configuration

| Fichier | Description |
|---------|-------------|
| [docker-compose.microservices.yml](./docker-compose.microservices.yml) | Configuration Docker Compose |
| [Makefile](./Makefile) | Commandes make |
| `.env` | Variables d'environnement (à créer) |

## 🎓 Parcours d'Apprentissage

### Niveau 1 : Débutant (1 heure)
1. Lire [GETTING-STARTED.md](./GETTING-STARTED.md)
2. Démarrer les services avec `.\scripts\start-dev.ps1`
3. Tester l'API Gateway : `curl http://localhost:3000/health`
4. Créer un pipeline de test

### Niveau 2 : Intermédiaire (4 heures)
1. Lire [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Explorer le code de `keyword-fetcher`
3. Modifier un service et le tester
4. Comprendre la communication entre services

### Niveau 3 : Avancé (1-2 jours)
1. Implémenter une vraie intégration API dans `keyword-fetcher`
2. Ajouter des tests unitaires
3. Créer un nouveau service from scratch
4. Implémenter le monitoring

### Niveau 4 : Expert (1 semaine)
1. Implémenter tous les services avec vraies APIs
2. Setup CI/CD avec GitHub Actions
3. Déployer sur Kubernetes
4. Implémenter distributed tracing

## 📊 Métriques du Projet

### Code créé
- **10 microservices** avec API REST
- **1 API Gateway** avec rate limiting
- **4 services d'infrastructure** (Redis, RabbitMQ, PostgreSQL, MinIO)
- **7 documents** de documentation
- **3 scripts** d'automatisation

### Lignes de code
- Services : ~2000 lignes TypeScript
- Configuration : ~500 lignes YAML/JSON
- Documentation : ~3500 lignes Markdown

### Technologies
- TypeScript, Node.js 20, Express.js
- Docker, Docker Compose
- Redis, RabbitMQ, PostgreSQL, MinIO
- BullMQ, Pino, Zod

## 🔍 Recherche Rapide

**Je cherche :**
- **Comment démarrer** → [GETTING-STARTED.md](./GETTING-STARTED.md)
- **L'architecture** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Les APIs** → [docs/API.md](./docs/API.md)
- **Un diagramme** → [docs/ARCHITECTURE-DIAGRAM.md](./docs/ARCHITECTURE-DIAGRAM.md)
- **Un exemple de service** → [services/keyword-fetcher/](./services/keyword-fetcher/)
- **Docker Compose** → [docker-compose.microservices.yml](./docker-compose.microservices.yml)
- **Les commandes** → [Makefile](./Makefile) ou [README-MICROSERVICES.md](./README-MICROSERVICES.md)

## 🆘 Besoin d'Aide ?

### Problèmes fréquents

| Problème | Solution |
|----------|----------|
| Services ne démarrent pas | Voir [GETTING-STARTED.md#problèmes-courants](./GETTING-STARTED.md#besoin-daide) |
| Port déjà utilisé | Modifier dans `docker-compose.microservices.yml` |
| Service ne répond pas | Vérifier les logs : `docker-compose logs -f <service>` |
| Erreur de connexion | Vérifier le network : `docker network inspect faceless-network` |

### Ressources

- Documentation Docker : https://docs.docker.com/
- Documentation Express.js : https://expressjs.com/
- Documentation BullMQ : https://docs.bullmq.io/
- Documentation RabbitMQ : https://www.rabbitmq.com/documentation.html

## 🎯 Prochaines Étapes

**Pour mettre en production :**

- [ ] Implémenter les vraies intégrations API
- [ ] Ajouter des tests (unitaires, intégration, E2E)
- [ ] Setup monitoring (Prometheus + Grafana)
- [ ] Implémenter l'authentification JWT
- [ ] Ajouter HTTPS/TLS
- [ ] Setup CI/CD
- [ ] Déployer sur un cloud provider
- [ ] Implémenter le distributed tracing

Voir [PROJECT-SUMMARY.md#ce-quil-reste-à-faire](./PROJECT-SUMMARY.md#-ce-quil-reste-à-faire) pour plus de détails.

## 📝 Changelog

### v1.0.0 - Architecture Microservices
- ✅ Création de 10 microservices
- ✅ Infrastructure complète (Redis, RabbitMQ, PostgreSQL, MinIO)
- ✅ API Gateway avec rate limiting
- ✅ Orchestrator avec BullMQ
- ✅ Communication HTTP + Events
- ✅ Docker Compose complet
- ✅ Documentation exhaustive

## 📄 Licence

Propriétaire - Tous droits réservés

---

**🚀 Prêt à commencer ? → [GETTING-STARTED.md](./GETTING-STARTED.md)**

