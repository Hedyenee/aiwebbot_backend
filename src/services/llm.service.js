const axios = require('axios')
const { performance } = require('node:perf_hooks')
const { OLLAMA_URL } = require('../config/env')

// Service responsable de la communication avec Ollama
async function generateResponse(prompt, logger) {
  const start = performance.now()

  try {
    logger?.info({ prompt }, 'LLM call started')

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'mistral',
      prompt,
      stream: false
    })

    const durationMs = Math.round(performance.now() - start)
    logger?.info({ durationMs }, 'LLM call completed')

    return { answer: response.data.response, durationMs }
  } catch (error) {
    const durationMs = Math.round(performance.now() - start)
    logger?.error({ err: error, durationMs }, 'LLM call failed')
    throw new Error('Erreur lors de la génération LLM')
  }
}

module.exports = { generateResponse }
