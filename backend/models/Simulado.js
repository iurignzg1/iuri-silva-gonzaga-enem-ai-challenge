const mongoose = require('mongoose');

const simuladoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tipo: {
            type: String,
            enum: ['express', 'completo'],
            default: 'express',
        },
        dia: {
            type: Number,
            enum: [1, 2],
            default: 1,
        },
        acertos: {
            matematica: { type: Number, default: 0 },
            natureza: { type: Number, default: 0 },
            humanas: { type: Number, default: 0 },
            linguagens: { type: Number, default: 0 },
        },
        notasPorMateria: {
            matematica: { type: Number, default: 0 },
            natureza: { type: Number, default: 0 },
            humanas: { type: Number, default: 0 },
            linguagens: { type: Number, default: 0 },
        },
        totalQuestoes: {
            type: Number,
            required: true,
        },
        notaPonderada: {
            type: Number,
            default: 0,
        },
        feedbackIA: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Simulado', simuladoSchema);