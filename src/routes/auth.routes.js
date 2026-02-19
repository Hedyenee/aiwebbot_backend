const authController = require('../controllers/auth.controller')

async function routes(fastify) {
  fastify.post('/login', authController.login)
}

module.exports = routes
