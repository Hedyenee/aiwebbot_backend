const { performance } = require('node:perf_hooks')
const chatSchema = require('../schemas/chat.schema')
const { answerWithRag } = require('../services/rag.service')
const Conversation = require('../models/Conversation.model')

// Endpoint permettant de recevoir une question utilisateur
exports.chat = async (request, reply) => {
  await chatSchema.validate(request.body, { abortEarly: false })

  const { question } = request.body
  request.log.info({ question }, 'Question reçue')

  const start = performance.now()
  const { answer, sources } = await answerWithRag(question, { logger: request.log })
  const durationMs = Math.round(performance.now() - start)
  request.log.info({ durationMs }, 'Réponse générée avec succès')

  const bestPostId = Array.isArray(sources) && sources.length > 0 ? sources[0].postId || null : null

  try {
    await Conversation.create({
      question,
      answer,
      postId: bestPostId
    })
  } catch (error) {
    request.log.error({ err: error }, 'Échec de sauvegarde conversation')
  }

  return reply.send({
    success: true,
    answer,
    sources
  })
}
