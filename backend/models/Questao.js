const mongoose = require('mongoose');

const questaoSchema = new mongoose.Schema(
    {
        // Identificador único no nosso banco (ex: "2023-1-ingles" ou "2023-46")
        questaoId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        ano: {
            type: Number,
            required: true,
            index: true,
        },
        dia: {
            type: Number,
            enum: [1, 2],
            required: true,
            index: true,
        },
        index: {
            type: Number,
            required: true,
            index: true,
        },
        disciplina: {
            type: String,
            enum: ['linguagens', 'ciencias-humanas', 'ciencias-natureza', 'matematica'],
            required: true,
            index: true,
        },
        lingua: {
            type: String,
            enum: ['ingles', 'espanhol', null],
            default: null,
        },
        enunciado: {
            type: String,
            default: '',
        },
        comando: {
            type: String,
            default: null,
        },
        imagens: {
            type: [String],
            default: [],
        },
        alternativas: [
            {
                letra: { type: String, required: true },
                texto: { type: String, default: '' },
                imagem: { type: String, default: null },
            }
        ],
        // Gabarito oficial salvo apenas no banco (nunca enviado ao aluno durante o teste)
        correctAlternative: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

// Índice composto para buscar rapidamente as provas filtradas por ano, dia e língua
questaoSchema.index({ ano: 1, dia: 1, lingua: 1, index: 1 });

module.exports = mongoose.model('Questao', questaoSchema);
