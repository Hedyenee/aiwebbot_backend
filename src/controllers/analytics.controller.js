const Conversation = require('../models/Conversation.model')

exports.getAnalytics = async (request, reply) => {
  try {
    const totalQuestions = await Conversation.countDocuments()

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const questionsToday = await Conversation.countDocuments({ createdAt: { $gte: startOfToday } })

    const questionsByPost = await Conversation.aggregate([
      { $match: { postId: { $exists: true, $ne: null } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
      { $project: { _id: 0, postId: '$_id', count: 1 } }
    ])

    return reply.send({
      totalQuestions,
      questionsToday,
      questionsByPost
    })
  } catch (error) {
    request.log.error({ err: error }, 'Analytics retrieval failed')
    return reply.status(500).send({ error: 'Failed to retrieve analytics' })
  }
}
