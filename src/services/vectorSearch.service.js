const Document = require('../models/Document.model')
const { generateEmbedding } = require('./embedding.service')

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i += 1) {
    const x = a[i]
    const y = b[i]
    dot += x * y
    normA += x * x
    normB += y * y
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

async function searchSimilarDocuments(question, options = {}) {
  const { topK = 3, similarityThreshold = 0.7 } = options

  const queryEmbedding = await generateEmbedding(question)

  const documents = await Document.find(
    { embedding: { $exists: true, $ne: [] } },
    { embedding: 1, title: 1, content: 1, url: 1, postId: 1, language: 1 }
  ).lean()

  const scored = documents
    .map((doc) => {
      const score = cosineSimilarity(queryEmbedding, doc.embedding)
      return { ...doc, score }
    })
    .filter((doc) => doc.score >= similarityThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return scored
}

module.exports = { searchSimilarDocuments }
