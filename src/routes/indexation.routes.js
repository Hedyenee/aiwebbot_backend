const indexationController = require('../controllers/indexation.controller')

async function routes(fastify, options) {
  fastify.post(
    '/index',
    { preHandler: [fastify.authenticate] },
    indexationController.indexContent
  )
}

module.exports = routes
