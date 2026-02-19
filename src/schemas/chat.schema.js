const yup = require('yup')

// Schéma de validation pour l'endpoint /chat
const chatSchema = yup.object({
  question: yup
    .string()
    .trim()
    .min(3, 'question doit contenir au moins 3 caractères')
    .required('question est obligatoire')
})

module.exports = chatSchema
