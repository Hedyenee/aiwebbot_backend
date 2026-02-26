const rateLimit = require('@fastify/rate-limit')

// Route-scoped rate limiting plugin (global disabled)
async function rateLimitPlugin(fastify) {
  await fastify.register(rateLimit, {
    global: false, // enable per-route via config.rateLimit
    max: 20,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      error: 'Too many requests. Please try again later.'
    })
  })

  fastify.addHook('onError', async (request, reply, error) => {
    if (error?.statusCode === 429) {
      request.log.warn({ ip: request.ip, url: request.url }, 'Rate limit exceeded')
    }
  })
}

module.exports = rateLimitPlugin
