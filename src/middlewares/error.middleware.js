// Middleware global de gestion des erreurs
// Intercepte toutes les erreurs non gérées dans l'application

function errorHandler(error, request, reply) {
  request.log.error({ err: error }, 'Unhandled error')

  if (error.name === 'ValidationError') {
    const details = Array.isArray(error.inner) && error.inner.length
      ? error.inner.map(({ path, message }) => ({ path, message }))
      : [{ path: error.path, message: error.message }]

    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details
    })
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Erreur interne du serveur'

  return reply.status(statusCode).send({
    success: false,
    error: message
  })
}

module.exports = errorHandler
