const fastify = require('fastify')
const cors = require('@fastify/cors')

const dbConnector = require('./plugins/db')
const jwtPlugin = require('./plugins/jwt')
const rateLimitPlugin = require('./plugins/rateLimit')

const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')
const indexationRoutes = require('./routes/indexation.routes')
const errorHandler = require('./middlewares/error.middleware')

function buildApp() {
  const app = fastify({
    logger: {
      transport: { target: 'pino-pretty' }
    }
  })

  app.register(cors, { origin: true })
  app.register(rateLimitPlugin)
  app.register(jwtPlugin)
  app.register(dbConnector)

  app.setErrorHandler(errorHandler)

  app.register(authRoutes)
  app.register(indexationRoutes)
  app.register(chatRoutes)

  app.get('/', async (request, reply) => {
    return { message: 'AIWebBot Backend is running' }
  })

  return app
}

module.exports = buildApp
