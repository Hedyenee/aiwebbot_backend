// Splits text into overlapping character chunks for embedding
function chunkText(text, chunkSize = 500, overlap = 100) {
  if (typeof text !== 'string') return []
  const cleaned = text.trim()
  if (!cleaned) return []

  const size = Math.max(1, chunkSize)
  const step = Math.max(1, size - Math.max(0, overlap))

  const chunks = []
  for (let start = 0; start < cleaned.length; start += step) {
    const end = start + size
    chunks.push(cleaned.slice(start, end))
  }

  return chunks
}

module.exports = { chunkText }
