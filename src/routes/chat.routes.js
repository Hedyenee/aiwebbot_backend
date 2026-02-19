const chatController = require('../controllers/chat.controller')

async function routes(fastify, options) {
  fastify.post(
    '/chat',
    { config: { rateLimit: true } },
    chatController.chat
  )
}

module.exports = routes
