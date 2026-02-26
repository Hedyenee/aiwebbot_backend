const axios = require('axios')
const { OLLAMA_URL } = require('../config/env')

async function generateEmbedding(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new TypeError('Text must be a non-empty string')
  }

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/embeddings`,
      {
        model: 'nomic-embed-text',
        prompt: text
      }
    )

    const embedding = response?.data?.embedding

    if (!Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from Ollama')
    }

    return embedding
  } catch (error) {
    const details = error.response?.data || error.message
    throw new Error(`Failed to generate embedding: ${details}`)
  }
}

module.exports = { generateEmbedding }
