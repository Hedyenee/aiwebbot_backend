const analyticsController = require('../controllers/analytics.controller')

async function routes(fastify, options) {
  fastify.get('/analytics', analyticsController.getAnalytics)
}

module.exports = routes
