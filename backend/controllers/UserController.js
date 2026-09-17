const User = require('../models/User');

const bcrypt = require('bcryptjs');

// token do usuário (usuário está conectado)
        const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, { expiresIn: '7d' });
};
// registro de usuário
const registerUser = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, preencha todos os campos' });
    }
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'E-mail já cadastrado' });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);


        const user = await User.create({
            nome,
            email,
            senha: hashedPassword,
        });


        return res.status(201).json({
            _id: user._id,
            nome: user.nome,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Erro no servidor: ' + error.message });
    }
};



module.exports = { registerUser }