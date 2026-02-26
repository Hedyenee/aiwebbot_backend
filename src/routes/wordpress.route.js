const wordpressController = require('../controllers/wordpress.controller')

async function routes(fastify, options) {
  fastify.post('/wordpress', wordpressController.receivePayload)
}

module.exports = routes
