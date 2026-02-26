require('dotenv').config()

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI,
  MONGODB_URI: MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  OLLAMA_URL: process.env.OLLAMA_URL
}
