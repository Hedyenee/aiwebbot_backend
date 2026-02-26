# AIWebBot Backend – Chatbot Intelligent basé sur RAG

## 1. Présentation générale
AIWebBot Backend est une API Node.js/Fastify qui implémente l’infrastructure nécessaire à l’intégration d’un chatbot intelligent avec WordPress. 
Conçu dans le cadre d’un Projet de Fin d’Études (PFE), le projet met en œuvre un pipeline complet de Retrieval-Augmented Generation (RAG) prêt pour un déploiement en environnement de production.

Le backend est capable de recevoir des contenus WordPress, de les vectoriser et de les interroger via un LLM local (Ollama, modèle Mistral). 
Cette approche garantit la souveraineté des données, une latence réduite, des coûts maîtrisés et un meilleur contrôle de la confidentialité.

## 2. Architecture globale
Flux fonctionnel : WordPress → Backend → Base vectorielle (MongoDB) → LLM → Réponse.

```
          +------------------+
          |   WordPress      |
          | (Webhook / API)  |
          +--------+---------+
                   |
                   v
          +--------+---------+
          |   Fastify API    |
          |  - /wordpress    |
          |  - /chat         |
          |  - /analytics    |
          +--------+---------+
                   |
          +--------+---------+
          |  Services RAG    |
          |  - Chunking      |
          |  - Embeddings    |
          |  - Similarité    |
          +--------+---------+
                   |
                   v
          +------------------+
          | MongoDB (vectors)|
          +--------+---------+
                   |
                   v
          +------------------+
          |    Ollama LLM    |
          |   (Mistral)      |
          +------------------+
                   |
                   v
          +------------------+
          |   Réponse JSON   |
          +------------------+
```

Découplage :
- Routes : exposition HTTP (/wordpress, /chat, /analytics).
- Contrôleurs : validation, orchestration, réponses.
- Services : chunking, embeddings, vector search, indexation, LLM.
- Modèles : schémas Mongoose.
- Config : paramètres env + RAG.
- Stockage : MongoDB pour embeddings et analytics.
- LLM : Ollama (Mistral) en local.

## 3. Pipeline RAG
1. Réception du contenu (postId, title, content, url, language).
2. Découpage en chunks (`textChunker`).
3. Génération d’embeddings (`nomic-embed-text` via Ollama).
4. Stockage vectoriel (collection `documents`).
5. Similarité cosinus (`vectorSearch.service`).
6. Filtrage par seuil (`SIMILARITY_THRESHOLD`).
7. Construction du contexte limité par `MAX_CONTEXT_CHARS`.
8. Injection du contexte dans le prompt LLM.
9. Anti-hallucination : réponse par défaut « I don't know based on the available information. » si aucun doc pertinent.

## 4. Structure du projet
```
src/
  controllers/   # HTTP, validation, réponses
  services/      # RAG, embeddings, vector search, indexation, LLM
  models/        # Mongoose (Document, Conversation)
  routes/        # Déclarations Fastify
  config/        # env, rag.config.js
  utils/         # chunking, helpers
  middlewares/   # erreurs, auth, etc.
  plugins/       # Mongo, JWT, rate-limit
scripts/         # outils (tests RAG, etc.)
```

## 5. Fonctionnalités principales
- POST /wordpress : ingestion validée.
- Réindexation propre : suppression des anciens chunks par postId.
- Embeddings locaux via Ollama.
- Recherche vectorielle (cosinus).
- Seuil de similarité configurable.
- Anti-hallucination.
- Journalisation des conversations.
- GET /analytics : statistiques en temps réel.
- Configuration RAG centralisée.

## 6. Modèles de données
**Document**
- postId (String), wordpressId (index), title, content, url, language
- embedding : [Number]
- chunkIndex : Number
- timestamps

**Conversation**
- question (String, req)
- answer (String, req)
- postId (String, optionnel)
- timestamps

## 7. Configuration RAG
`src/config/rag.config.js`
```js
const RAG_CONFIG = {
  TOP_K: 3,
  SIMILARITY_THRESHOLD: 0.6,
  MAX_CONTEXT_CHARS: 2000
}
module.exports = { RAG_CONFIG }
```
- TOP_K : documents injectés dans le prompt.
- SIMILARITY_THRESHOLD : score minimal retenu.
- MAX_CONTEXT_CHARS : taille max du contexte.  
Centralisation = tuning facilité (précision/rappel) et évite les valeurs en dur.

## 8. Analytics
- totalQuestions : nombre total de conversations.
- questionsToday : volume du jour.
- questionsByPost : agrégation par postId (hors null).  
Apporte visibilité sur l’engagement et l’efficacité des contenus.

## 9. Installation & mise en route
```bash
git clone https://github.com/Hedyenee/aiwebbot_backend.git
cd aiwebbot-backend
npm install

# .env à créer :
# PORT=3000
# MONGO_URI=mongodb://...
# OLLAMA_URL=http://localhost:11434
# JWT_SECRET=...

ollama run mistral
ollama run nomic-embed-text

npm run dev   # dev
npm start     # prod
```

## 10. Exemples d’API
### POST /chat
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{ "question": "Quels services web proposez-vous ?" }'
```

### GET /analytics
```bash
curl http://localhost:3000/analytics
```

### POST /wordpress
```bash
curl -X POST http://localhost:3000/wordpress \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 101,
    "title": "Services Web",
    "content": "Nous concevons des sites rapides et SEO-friendly...",
    "url": "https://example.com/web",
    "language": "fr"
  }'
```

## 11. Décisions techniques
- Fastify : performance, faible overhead, plugins.
- MongoDB/Mongoose : schémas flexibles, agrégations pour analytics.
- Similarité cosinus : standard embeddings texte.
- LLM local (Ollama) : confidentialité, latence, coûts prévisibles, offline possible.
- Précision vs rappel : seuil 0.6, TOP_K=3 pour contexte concis.

## 12. Améliorations futures
- Plugin WordPress dédié (sync bidirectionnelle).
- Dockerisation complète.
- Accélération GPU.
- Optimisations (cache embeddings, compression, pagination analytics).
- Seuil adaptatif selon confiance et domaine.

## 13. Conclusion
AIWebBot Backend offre une implémentation RAG robuste et prête pour la production, conciliant intégration WordPress, configuration centralisée, analytics et LLM local pour un chatbot performant, souverain et maintenable.
