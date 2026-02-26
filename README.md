# AIWebBot Backend � Chatbot Intelligent bas� sur RAG

## Description du projet
AIWebBot Backend est une plateforme serveur Node.js/Fastify con�ue pour fournir un chatbot intelligent int�gr� � WordPress. Ce projet s�inscrit dans le cadre d�un Projet de Fin d��tudes (PFE) d�ing�nierie, avec pour objectif d�explorer une cha�ne compl�te de Retrieval-Augmented Generation (RAG) en environnement de production.  
Le backend re�oit des contenus WordPress, les vectorise et alimente un pipeline RAG afin de g�n�rer des r�ponses fiables et contextualis�es. L�inf�rence est r�alis�e via un LLM local (Ollama, mod�le Mistral) pour garantir la souverainet� des donn�es, r�duire les co�ts de latence r�seau et ma�triser la confidentialit�. 

## Architecture globale
L�architecture est modulable et d�coupl�e : chaque couche (ingestion, indexation, recherche vectorielle, g�n�ration) est isol�e derri�re des services explicites. Les �changes suivent le flux WordPress ? Backend ? Base vectorielle (MongoDB) ? LLM ? R�ponse.

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
          |  - Similarit�    |
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
          |   R�ponse JSON   |
          +------------------+
```

### D�tails d�architecture
- **D�couplage** : routes ? contr�leurs ? services ? mod�les. Chaque couche est testable isol�ment.
- **Persistence** : MongoDB stocke � la fois les embeddings (collection `documents`) et les logs de conversations (collection `conversations`).
- **Interop�rabilit�** : l�ingestion depuis WordPress se fait via `/wordpress`, ind�pendante du chatbot `/chat`.
- **S�curit� & Performance** : Fastify pour un routage rapide, pino pour la journalisation structur�e, seuils de similarit� configurables via `src/config/rag.config.js`.

## Pipeline RAG (�tapes)
1. **R�ception du contenu** : le backend re�oit postId, title, content, url, language via `/wordpress` (ou service interne).
2. **D�coupage en chunks** : `textChunker` segmente le texte en blocs adapt�s au contexte LLM.
3. **G�n�ration d�embeddings** : `embedding.service` appelle Ollama (`nomic-embed-text`) pour transformer chaque chunk en vecteur.
4. **Stockage vectoriel** : les embeddings et m�tadonn�es sont ins�r�s dans MongoDB (`Document`).
5. **Recherche par similarit�** : `vectorSearch.service` calcule la similarit� cosinus entre la question et les embeddings stock�s.
6. **Filtrage par seuil** : seuls les documents avec un score = `SIMILARITY_THRESHOLD` sont retenus.
7. **Construction du contexte** : `rag.service` assemble un bloc contextuel limit� � `MAX_CONTEXT_CHARS`.
8. **Injection dans le prompt** : le contexte est inject� dans le prompt RAG pour le LLM Mistral.
9. **Anti-hallucination** : si aucun document pertinent n�est trouv�, la r�ponse standard est : � I don't know based on the available information. �

## Structure du projet
```
src/
  controllers/   # Logique HTTP (chat, wordpress, analytics, etc.)
  services/      # RAG, embeddings, vector search, indexation, LLM
  models/        # Sch�mas Mongoose (Document, Conversation)
  routes/        # D�claration des routes Fastify
  config/        # Configuration (env, RAG)
  utils/         # Utilitaires (chunking, etc.)
  middlewares/   # Gestion des erreurs, auth, etc.
  plugins/       # Connexion Mongo, JWT, rate limiting
scripts/         # Outils (tests RAG, etc.)
```
- **controllers** : coordonnent validation, appels services et r�ponses HTTP.
- **services** : contiennent le c�ur m�tier (RAG, embeddings, indexation).
- **models** : d�finissent les sch�mas et index Mongo.
- **routes** : exposent les endpoints Fastify en important les contr�leurs.
- **config** : centralise la configuration (env, RAG).
- **utils** : fonctions de support (chunking, helpers).

## Fonctionnalit�s principales
- **POST /wordpress** : ingestion de contenu WordPress (validation Yup).
- **R�indexation propre** : suppression des anciens chunks pour un m�me postId avant r�insertion.
- **Embeddings via Ollama** : g�n�ration locale avec `nomic-embed-text`.
- **Recherche vectorielle** : similarit� cosinus sur embeddings stock�s.
- **Seuil de similarit� configurable** : centralis� dans `rag.config.js`.
- **Anti-hallucination** : r�ponse neutre si contexte insuffisant.
- **Journalisation des conversations** : question, r�ponse, postId associ�.
- **GET /analytics** : statistiques d�usage en temps r�el.
- **Configuration RAG centralis�e** : TOP_K, SIMILARITY_THRESHOLD, MAX_CONTEXT_CHARS.

## Mod�les de base de donn�es
### Document (stockage vectoriel)
- `postId`: String (identifiant logique du contenu WordPress)
- `wordpressId`: String (index, non unique)
- `title`: String
- `content`: String (chunk)
- `url`: String
- `language`: String
- `embedding`: [Number] (vecteur)
- `chunkIndex`: Number (ordre des chunks)
- Timestamps activ�s

### Conversation (analytics & logging)
- `question`: String (requise)
- `answer`: String (requise)
- `postId`: String (meilleure correspondance, optionnel)
- `createdAt`, `updatedAt`: automatiques via timestamps

## Configuration RAG
`src/config/rag.config.js` :
```js
const RAG_CONFIG = {
  TOP_K: 3,
  SIMILARITY_THRESHOLD: 0.6,
  MAX_CONTEXT_CHARS: 2000
}
module.exports = { RAG_CONFIG }
```
- **TOP_K** : nombre maximum de documents inject�s dans le contexte.
- **SIMILARITY_THRESHOLD** : filtre les documents trop faibles pour r�duire le bruit.
- **MAX_CONTEXT_CHARS** : taille maximale du contexte envoy� au LLM.
Centraliser ces param�tres simplifie le tuning (pr�cision vs rappel) et �vite les valeurs en dur.

## Syst�me d�analytics
- **totalQuestions** : nombre total de conversations.
- **questionsToday** : volume depuis le d�but de la journ�e (UTC).
- **questionsByPost** : r�partition par `postId` (agr�gation Mongo).
Ces m�triques aident � suivre l�engagement, l�efficacit� du contenu et � prioriser les am�liorations.

## Installation & mise en route
```bash
# 1) Cloner le d�p�t
git clone https://github.com/Hedyenee/aiwebbot_backend.git
cd aiwebbot-backend

# 2) Installer les d�pendances
npm install

# 3) Configurer l�environnement
cp .env.example .env   # si disponible
# Dans .env, d�finir au minimum :
# PORT=3000
# MONGO_URI=mongodb://...
# OLLAMA_URL=http://localhost:11434
# JWT_SECRET=...

# 4) Lancer Ollama (avec le mod�le Mistral + nomic-embed-text)
ollama run mistral
ollama run nomic-embed-text

# 5) D�marrer le serveur
npm run dev
# ou en production
npm start
```

## Exemples d�API
### POST /chat
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{ "question": "Quels services web proposez-vous ?" }'
```
R�ponse :
```json
{
  "success": true,
  "answer": "...",
  "sources": [
    { "title": "...", "url": "...", "postId": "101", "score": 0.83 }
  ]
}
```

### GET /analytics
```bash
curl http://localhost:3000/analytics
```
R�ponse :
```json
{
  "totalQuestions": 128,
  "questionsToday": 12,
  "questionsByPost": [
    { "postId": "101", "count": 5 },
    { "postId": "202", "count": 3 }
  ]
}
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
R�ponse :
```json
{
  "message": "WordPress payload received",
  "data": {
    "postId": 101,
    "title": "Services Web",
    "url": "https://example.com/web",
    "language": "fr"
  }
}
```

## D�cisions techniques
- **Fastify** : serveur HTTP performant, faible overhead, �cosyst�me de plugins (rate-limit, CORS).
- **MongoDB + Mongoose** : flexibilit� du sch�ma pour stocker embeddings et m�tadonn�es, agr�gations pour analytics.
- **Similarit� cosinus** : mesure standard pour embeddings textuels, simple et efficace pour la recherche vectorielle.
- **LLM local (Ollama)** : confidentialit�, latence r�duite, co�ts pr�visibles, possibilit� d�ex�cuter hors-ligne.
- **Compromis pr�cision vs rappel** : seuil de similarit� configurable (0.6 par d�faut) pour limiter le bruit tout en conservant la couverture ; TOP_K=3 assure un contexte concis.

## Am�liorations futures
- **Automatisation WordPress compl�te** : plugin d�di� pour synchronisation bidirectionnelle.
- **Dockerisation** : images pr�tes pour CI/CD et d�ploiement reproductible.
- **Acc�l�ration GPU** : pour r�duire les temps d�inf�rence et de g�n�ration d�embeddings.
- **Optimisation des performances** : cache des embeddings, compression des vecteurs, pagination des analytics.
- **Seuil adaptatif** : ajustement dynamique du SIMILARITY_THRESHOLD selon la confiance et le domaine de la question.

## Conclusion
AIWebBot Backend propose une impl�mentation RAG structur�e, pr�te pour la production et adapt�e aux environnements o� la souverainet� des donn�es est critique. L�int�gration WordPress, la configuration centralis�e du RAG, la journalisation analytique et l�usage d�un LLM local en font une base solide pour d�velopper un chatbot fiable, maintenable et �volutif.
