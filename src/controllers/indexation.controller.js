const indexationSchema = require('../schemas/indexation.schema')
const { indexContentService } = require('../services/indexation.service')

exports.indexContent = async (request, reply) => {
  await indexationSchema.validate(request.body, { abortEarly: false })

  const { inserted, deletedCount } = await indexContentService(request.body, request.log)

  return reply.send({
    success: true,
    message: 'Content indexed successfully',
    deletedCount,
    insertedCount: inserted.length,
    data: inserted
  })
}
