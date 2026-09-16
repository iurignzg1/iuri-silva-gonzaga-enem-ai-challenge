const mongoose = require("mongoose")
const { Schema } = mongoose;

const userSchema = new Schema(
    {

        nome: {
            type: String,
            required: [true, 'O nome é obrigatório'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'O e-mail é obrigatório'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        senha: {
            type: String,
            required: [true, 'A senha é obrigatória'],
            select: false,
        },

        cursoAlvo: {
            type: String,
            default: 'Não definido',
            trim: true,
        },
        faculdadeAlvo: {
            type: String,
            default: 'Não definida',
            trim: true,
        },
        pesos: {
            matematica: { type: Number, default: 1, min: 1, max: 5 },
            natureza: { type: Number, default: 1, min: 1, max: 5 },
            humanas: { type: Number, default: 1, min: 1, max: 5 },
            linguagens: { type: Number, default: 1, min: 1, max: 5 },
            redacao: { type: Number, default: 1, min: 1, max: 5 },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
