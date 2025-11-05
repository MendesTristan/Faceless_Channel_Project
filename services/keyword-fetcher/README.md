# Keyword Fetcher Service

Microservice responsable de la récupération de keywords SEO pour les vidéos YouTube.

## 🎯 Responsabilité

Rechercher et retourner des keywords pertinents basés sur un sujet donné, avec des métriques comme le volume de recherche, la compétition et le CPC.

## 📡 API Endpoints

### POST /keywords/fetch

Récupère des keywords pour un sujet donné.

**Request:**
```json
{
  "topic": "ETF débutants 2025",
  "format": "short",
  "limit": 10
}
```

**Response:**
```json
{
  "keywords": [
    {
      "keyword": "ETF débutants 2025",
      "searchVolume": 10000,
      "competition": "medium",
      "cpc": 1.5
    },
    {
      "keyword": "ETF débutants 2025 tutorial",
      "searchVolume": 5000,
      "competition": "low",
      "cpc": 0.8
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "keyword-fetcher",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

Variables d'environnement :

```env
PORT=3002
LOG_LEVEL=info

# API Keys (à configurer selon le provider choisi)
GOOGLE_ADS_API_KEY=
SERPAPI_KEY=
AHREFS_API_KEY=
```

## 🚀 Développement

```bash
# Installation
npm install

# Dev mode
npm run dev

# Build
npm run build

# Production
npm start
```

## 🔌 Intégrations Possibles

### 1. Google Keyword Planner
- Nécessite un compte Google Ads
- API officielle
- Données très précises
- Coût: Gratuit avec compte Ads actif

### 2. SerpAPI
- API simple à utiliser
- Pas besoin de compte Google Ads
- Coût: ~$50/mois pour 5000 requêtes
- Documentation: https://serpapi.com/

### 3. DataForSEO
- API complète pour SEO
- Données en temps réel
- Coût: ~$100/mois
- Documentation: https://dataforseo.com/

### 4. Ahrefs API
- Données SEO très complètes
- Cher mais de qualité
- Coût: ~$300/mois
- Documentation: https://ahrefs.com/api

## 📝 TODO

- [ ] Implémenter l'intégration avec une vraie API
- [ ] Ajouter le cache Redis pour les résultats
- [ ] Implémenter le retry automatique
- [ ] Ajouter des métriques Prometheus
- [ ] Implémenter le rate limiting

