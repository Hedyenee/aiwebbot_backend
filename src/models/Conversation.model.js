const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    userId: { type: String, default: null },
    responseTime: { type: Number, required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Conversation', conversationSchema)
