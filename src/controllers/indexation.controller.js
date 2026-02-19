const Document = require('../models/Document.model')
const indexationSchema = require('../schemas/indexation.schema')

exports.indexContent = async (request, reply) => {
  await indexationSchema.validate(request.body, { abortEarly: false })

  const { wordpressId, type, title, content, url } = request.body

  const document = await Document.findOneAndUpdate(
    { wordpressId },
    { type, title, content, url },
    { upsert: true, new: true }
  )

  request.log.info({ wordpressId: document.wordpressId }, 'Indexation réussie')

  return reply.send({
    success: true,
    message: 'Content indexed successfully',
    data: document
  })
}
