const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
  {
    wordpressId: {
      type: Number,
      required: true,
      unique: true
    },
    type: {
      type: String, // post | page
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Document', documentSchema)
