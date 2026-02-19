// Middleware d'authentification JWT
async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (error) {
    request.log.warn({ ip: request.ip, url: request.url, err: error }, 'JWT rejected')
    return reply.code(401).send({
      success: false,
      error: 'Unauthorized'
    })
  }
}

module.exports = authenticate
