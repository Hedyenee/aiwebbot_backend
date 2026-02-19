# AIWebBot Backend

## Overview
Production-ready Fastify backend providing JWT-secured APIs, local LLM integration (Ollama Mistral 7B), and MongoDB persistence for conversations and indexed content. Built with modular, testable components (routes/controllers/services/models) and strict validation/logging.

## Architecture
```
Client
  │
  ▼
Fastify (routes / preHandlers)
  ├─ JWT plugin (authenticate)
  ├─ Rate limit plugin
  ├─ Error handler + Pino logger
  ▼
Controllers
  ├─ auth.controller
  ├─ indexation.controller
  └─ chat.controller
  ▼
Services
  ├─ llm.service (Ollama)
  └─ domain services
  ▼
Models (Mongoose)
  ├─ Document
  └─ Conversation
  ▼
MongoDB          Ollama (Mistral 7B)
```

## Tech Stack
- Node.js, Fastify
- MongoDB + Mongoose
- JWT (`@fastify/jwt`)
- Yup for request validation
- Pino (Fastify logger)
- Ollama (local LLM, Mistral 7B)
- Modular architecture (routes/controllers/services/models)

## Project Structure
```
.
├─ server.js
└─ src
   ├─ app.js
   ├─ config/
   ├─ controllers/
   │  ├─ auth.controller.js
   │  ├─ chat.controller.js
   │  └─ indexation.controller.js
   ├─ middlewares/
   │  ├─ auth.middleware.js
   │  └─ error.middleware.js
   ├─ models/
   │  ├─ Conversation.model.js
   │  └─ Document.model.js
   ├─ plugins/
   │  ├─ db.js
   │  ├─ jwt.js
   │  └─ rateLimit.js
   ├─ routes/
   │  ├─ auth.routes.js
   │  ├─ chat.routes.js
   │  └─ indexation.routes.js
   ├─ schemas/
   │  ├─ chat.schema.js
   │  └─ indexation.schema.js
   ├─ services/
   │  └─ llm.service.js
   └─ utils/ …
```

## Features
- JWT authentication for protected endpoints
- Yup validation with structured 400 responses
- Centralized error handling with Pino request-scoped logging
- Conversation persistence (question/answer/response time)
- Local LLM generation via Ollama (Mistral 7B)
- Rate limiting protection
- Clean, modular Fastify setup



## Environment Variables
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/aiwebbot
JWT_SECRET=your_jwt_secret
OLLAMA_URL=http://localhost:11434
RATE_LIMIT_MAX=10          # if configurable in plugin
RATE_LIMIT_WINDOW=1 minute # if configurable in plugin
```

## API Endpoints

### POST /login
- Body:
```json
{ "username": "admin", "password": "admin123" }
```
- Success 200:
```json
{ "success": true, "token": "<jwt>" }
```
- Failure 401:
```json
{ "success": false, "error": "Invalid credentials" }
```

### POST /index  (Protected, JWT)
- Headers: `Authorization: Bearer <jwt>`
- Body:
```json
{
  "wordpressId": 123,
  "type": "post",
  "title": "My Post",
  "content": "Lorem ipsum dolor sit amet...",
  "url": "https://example.com/post/123"
}
```
- Success 200/201:
```json
{
  "success": true,
  "message": "Content indexed successfully",
  "data": { "...Document fields..." }
}
```
- Validation error 400:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "path": "url", "message": "url doit être valide" }
  ]
}
```
- Auth error 401:
```json
{ "success": false, "error": "Unauthorized" }
```

### POST /chat  (Public)
- Body:
```json
{ "question": "Explain Moore's law." }
```
- Success 200:
```json
{
  "success": true,
  "answer": "…LLM response…"
}
```
- Validation error 400:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "path": "question", "message": "question doit contenir au moins 3 caractères" }
  ]
}
```
- Rate limit 429 (if exceeded):
```json
{ "statusCode": 429, "error": "Too Many Requests", "message": "Rate limit exceeded" }
```

## Security Features
- JWT auth via `@fastify/jwt` on protected routes (/index)
- Rate limiting via `@fastify/rate-limit`
- Input validation with Yup (fail-fast 400 responses)
- Centralized error handler
- Request-scoped Pino logging (auth, validation, LLM timings)

## Database Models
- **Document**: `wordpressId`, `type`, `title`, `content`, `url`, timestamps
- **Conversation**: `question`, `answer`, `userId`, `responseTime`, timestamps



