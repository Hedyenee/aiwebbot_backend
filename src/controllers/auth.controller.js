// Contrôleur d'authentification
exports.login = async (request, reply) => {
  const { username, password } = request.body

  if (username === 'admin' && password === 'admin123') {
    const token = request.server.jwt.sign({ username })
    request.log.info({ username }, 'Login success')

    return reply.send({ success: true, token })
  }

  request.log.warn({ username, ip: request.ip }, 'Login failed')

  return reply.status(401).send({
    success: false,
    error: 'Invalid credentials'
  })
}
