const rateLimit = require('@fastify/rate-limit')

// Plugin de limitation des requêtes avec log en cas de dépassement
async function rateLimitPlugin(fastify) {
  await fastify.register(rateLimit, {
    max: 10,
    timeWindow: '1 minute'
  })

  fastify.addHook('onError', async (request, reply, error) => {
    if (error?.statusCode === 429) {
      request.log.warn({ ip: request.ip, url: request.url }, 'Rate limit exceeded')
    }
  })
}

module.exports = rateLimitPlugin
