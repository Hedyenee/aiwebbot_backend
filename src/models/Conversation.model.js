const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    postId: { type: String, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Conversation', conversationSchema)
