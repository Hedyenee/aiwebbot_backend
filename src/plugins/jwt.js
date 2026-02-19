const jwt = require('@fastify/jwt')
const fp = require('fastify-plugin')

const authenticate = require('../middlewares/auth.middleware')

// Plugin de configuration JWT
async function jwtPlugin(fastify) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET
  })

  fastify.decorate('authenticate', authenticate)
}

module.exports = fp(jwtPlugin)
