const yup = require('yup')

// Validation schema for /wordpress endpoint
const wordpressSchema = yup.object({
  postId: yup
    .number()
    .typeError('postId must be a number')
    .required('postId is required'),

  title: yup
    .string()
    .trim()
    .required('title is required'),

  content: yup
    .string()
    .trim()
    .required('content is required'),

  url: yup
    .string()
    .trim()
    .matches(/^https?:\/\//i, 'url must start with http or https')
    .url('url must be a valid URL')
    .required('url is required'),

  language: yup.string().trim().optional()
})

module.exports = wordpressSchema
