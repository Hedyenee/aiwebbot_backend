const llmService = require('../services/llm.service')
const chatSchema = require('../schemas/chat.schema')
const Conversation = require('../models/Conversation.model')

// Endpoint permettant de recevoir une question utilisateur
exports.chat = async (request, reply) => {
  await chatSchema.validate(request.body, { abortEarly: false })

  const { question } = request.body
  request.log.info({ question }, 'Question reçue')

  const { answer, durationMs } = await llmService.generateResponse(question, request.log)
  request.log.info({ durationMs }, 'Réponse générée avec succès')

  try {
    const conversation = await Conversation.create({
      question,
      answer,
      userId: request.user?.id || null,
      responseTime: durationMs
    })
    request.log.info({ conversationId: conversation.id }, 'Conversation sauvegardée')
  } catch (error) {
    request.log.error({ err: error }, 'Échec de sauvegarde conversation')
    throw error
  }

  return reply.send({
    success: true,
    answer
  })
}
