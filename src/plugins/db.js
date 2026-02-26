const mongoose = require('mongoose')
const { MONGO_URI } = require('../config/env')

async function dbConnector(fastify) {

  console.log('Loaded MONGO_URI:', process.env.MONGO_URI)

  if (!MONGO_URI) {
    throw new Error('MongoDB URI is missing. Check your .env configuration.')
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    fastify.log.info('MongoDB connected')
  } catch (err) {
    fastify.log.error({ err }, 'MongoDB connection failed')
    process.exit(1)
  }
}

module.exports = dbConnector
