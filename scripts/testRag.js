require('dotenv').config()
const mongoose = require('mongoose')
const { MONGO_URI } = require('../src/config/env')
const { indexContentService } = require('../src/services/indexation.service')
const { answerWithRag } = require('../src/services/rag.service')

async function seedArticles() {
  const articles = [
    {
      postId: 101,
      title: 'Professional Web Development Services',
      content:
        'We build responsive websites, SPAs, and APIs using modern stacks like React, Next.js, and Node.js. Our team focuses on performance, accessibility, and SEO-friendly architecture.',
      url: 'https://example.com/web-dev-services',
      language: 'en'
    },
    {
      postId: 202,
      title: 'AI Consulting for Enterprises',
      content:
        'Our AI consultants help companies deploy LLMs, vector databases, and MLOps pipelines. Services include model selection, fine-tuning, and governance for compliant AI adoption.',
      url: 'https://example.com/ai-consulting',
      language: 'en'
    },
    {
      postId: 303,
      title: 'Digital Marketing Strategies',
      content:
        'We craft omnichannel digital marketing strategies including SEO, SEM, email automation, and social media campaigns to grow brand awareness and conversions.',
      url: 'https://example.com/digital-marketing',
      language: 'en'
    }
  ]

  for (const article of articles) {
    console.log(`\n[Index] Seeding postId=${article.postId}...`)
    const { inserted, deletedCount } = await indexContentService(article, console)
    console.log(`[Index] Deleted: ${deletedCount}, Inserted: ${inserted.length}`)
  }
}

async function runQueries() {
  const scenarios = [
    {
      question: 'Do you build responsive websites and APIs?',
      note: 'Clearly related to web development'
    },
    {
      question: 'Can you help set up an LLM with governance?',
      note: 'Related to AI consulting'
    },
    {
      question: "What is the best temperature to bake sourdough bread?",
      note: 'Unrelated; expect fallback answer'
    }
  ]

  for (const { question, note } of scenarios) {
    console.log('\n---------------------------------------------')
    console.log('SCENARIO:', note)
    console.log('QUESTION:', question)

    const { answer, sources } = await answerWithRag(question, { topK: 1, similarityThreshold: 0.7 })

    console.log('SOURCES:', sources)
    console.log('ANSWER:', answer)
  }
}

async function main() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI missing. Please set it in your .env file.')
    }

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('Connected to MongoDB')

    await seedArticles()
    await runQueries()
  } catch (err) {
    console.error('Test script failed:', err)
  } finally {
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
  }
}

main()
