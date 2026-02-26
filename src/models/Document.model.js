const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true
    },
    wordpressId: {
      type: String,
      index: true
    },
    title: String,
    content: {
      type: String,
      required: true
    },
    url: String,
    language: String,
    embedding: {
      type: [Number],
      index: true 
    },
    chunkIndex: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Document', documentSchema)
