const chatController = require('../controllers/chat.controller')

async function routes(fastify, options) {
  fastify.post(
    '/chat',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute'
        }
      }
    },
    chatController.chat
  )
}

module.exports = routes
