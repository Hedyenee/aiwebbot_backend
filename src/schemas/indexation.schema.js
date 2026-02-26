const yup = require('yup')

// Schéma de validation pour l'endpoint /index
const indexationSchema = yup.object({
  postId: yup
    .string()
    .trim()
    .required('postId est obligatoire'),

  title: yup
    .string()
    .trim()
    .min(2, 'title doit contenir au moins 2 caractères')
    .required('title est obligatoire'),

  content: yup
    .string()
    .trim()
    .min(10, 'content doit contenir au moins 10 caractères')
    .required('content est obligatoire'),

  url: yup
    .string()
    .trim()
    .url('url doit être valide')
    .required('url est obligatoire'),

  language: yup.string().trim().optional()
})

module.exports = indexationSchema
