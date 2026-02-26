const Document = require('../models/Document.model')
const { generateEmbedding } = require('./embedding.service')
const { chunkText } = require('../utils/textChunker')

async function indexContentService(payload, logger) {
  const { postId, title, content, url, language } = payload
  const numericPostId = Number(postId)
  const hasValidPostId = Number.isFinite(numericPostId)
  const postIdValue = hasValidPostId ? String(postId) : postId

  try {
    const chunks = chunkText(content)
    if (!chunks.length) {
      throw new Error('No content to index')
    }

    let deletedCount = 0
    if (hasValidPostId) {
      try {
        logger?.info(`[INDEX] Deleting old documents for postId=${postId}`)
        const result = await Document.deleteMany({ postId: postIdValue })
        deletedCount = result.deletedCount || 0
        logger?.info({ postId: postIdValue, deletedCount }, 'Old documents deleted')
      } catch (cleanupError) {
        logger?.error({ err: cleanupError, postId }, 'Reindex cleanup failed')
        throw new Error(`Reindex cleanup failed: ${cleanupError.message}`)
      }
    }

    const documents = []

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i]
      const embedding = await generateEmbedding(chunk)
      documents.push({
        postId: postIdValue,
        title,
        content: chunk,
        url,
        language,
        embedding,
        chunkIndex: i
      })
    }

    const inserted = await Document.insertMany(documents)
    logger?.info({ postId, chunks: inserted.length, deletedCount }, 'Indexation succeeded')
    return { inserted, deletedCount }
  } catch (error) {
    logger?.error({ err: error, postId }, 'Indexation failed')
    throw error
  }
}

module.exports = { indexContentService }
