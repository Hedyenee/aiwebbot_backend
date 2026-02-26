const wordpressSchema = require('../schemas/wordpress.schema')

exports.receivePayload = async (request, reply) => {
  try {
    const validated = await wordpressSchema.validate(request.body, { abortEarly: false })

    const { postId, title, url, language } = validated

    return reply.status(200).send({
      message: 'WordPress payload received',
      data: { postId, title, url, language }
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const details = Array.isArray(error.errors) && error.errors.length === 1
        ? error.errors[0]
        : error.errors

      return reply.status(400).send({
        error: 'Validation failed',
        details
      })
    }

    throw error
  }
}
