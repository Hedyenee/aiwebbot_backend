const { searchSimilarDocuments } = require('./vectorSearch.service')
const { generateResponse } = require('./llm.service')
const { RAG_CONFIG } = require('../config/rag.config')

function ensureQuestion(question) {
  if (typeof question !== 'string' || !question.trim()) {
    throw new TypeError('Question must be a non-empty string')
  }
  return question.trim()
}

function buildContextBlock(docs, maxContextChars) {
  let remaining = maxContextChars
  const parts = []

  for (const doc of docs) {
    if (remaining <= 0) break

    const title = doc.title ? `Title: ${doc.title}\n` : ''
    const url = doc.url ? `URL: ${doc.url}\n` : ''
    const content = (doc.content || '').trim()

    if (!content) continue

    const slice = content.slice(0, Math.max(0, remaining - title.length - url.length - 10))
    const snippet = `${title}${url}Content: ${slice}`.slice(0, remaining)

    if (snippet.length === 0) continue

    parts.push(snippet)
    remaining -= snippet.length + 2 // account for separator
  }

  return parts.join('\n\n')
}

async function answerWithRag(question, options = {}) {
  const {
    topK = RAG_CONFIG.TOP_K,
    similarityThreshold = RAG_CONFIG.SIMILARITY_THRESHOLD,
    maxContextChars = RAG_CONFIG.MAX_CONTEXT_CHARS,
    language,
    logger
  } = options

  const userQuestion = ensureQuestion(question)

  try {
    const candidates =
      (await searchSimilarDocuments(userQuestion, { topK, similarityThreshold })) || []
    logger?.info({ question: userQuestion, candidates: candidates.length, similarityThreshold }, '[RAG] Retrieved candidates')

    const filteredByThreshold = candidates.filter((doc) => doc.score >= similarityThreshold)
    logger?.info({ afterThreshold: filteredByThreshold.length }, '[RAG] After threshold filter')

    const filteredByLanguage = language
      ? filteredByThreshold.filter((doc) => doc.language && doc.language === language)
      : filteredByThreshold
    logger?.info({ afterLanguage: filteredByLanguage.length }, '[RAG] After language filter')

    const docs = filteredByLanguage.slice(0, topK)
    logger?.info({ selected: docs.length }, '[RAG] Documents selected')

    if (!docs.length) {
      return {
        answer: "I don't know based on the available information.",
        sources: [],
        usedContext: ''
      }
    }

    const contextBlock = buildContextBlock(docs, maxContextChars)
    logger?.info({ contextSize: contextBlock.length }, '[RAG] Context prepared')

    const prompt = `
You are an assistant that must answer ONLY using the provided context.
Do NOT use external knowledge.
If the answer is not clearly present in the context, respond exactly:
"I don't know based on the provided context."

Context:
${contextBlock}-

Question:
${userQuestion}
`.trim()

    const llmResult = await generateResponse(prompt)
    const answer = llmResult?.answer || ''

    const sources = docs.map(({ title, url, postId, score }) => ({ title, url, postId, score }))

    return { answer, sources, usedContext: contextBlock }
  } catch (error) {
    logger?.error({ err: error }, '[RAG] Pipeline failed')
    throw new Error(`RAG pipeline failed: ${error.message || error}`)
  }
}

module.exports = { answerWithRag }
