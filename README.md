# Faceless Pipeline

Pipeline modulaire et robuste pour automatiser une chaîne YouTube faceless : `keywords → script → tts → render → thumbnail → metadata → upload → A/B test`.

## 🏗️ Architecture

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

## 📝 TODO

Les modules actuels sont des stubs. À implémenter :
- [ ] Intégration API keywords (Google Keyword Planner, Ahrefs, etc.)
- [ ] Génération de scripts avec GPT/Claude
- [ ] Text-to-Speech (ElevenLabs, Google TTS, etc.)
- [ ] Assembly vidéo (FFmpeg, AviSynth)
- [ ] Génération thumbnails (Canvas, ImageMagick)
- [ ] Upload YouTube (googleapis)
- [ ] A/B testing variants
