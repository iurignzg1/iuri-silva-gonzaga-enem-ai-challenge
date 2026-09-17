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

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'E-mail já cadastrado, por favor, utilize outro email.' });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);


        const newUser = await User.create({
            nome,
            email,
            senha: hashedPassword,
        });


        return res.status(201).json({
            _id: newUser._id,
            nome: newUser.nome,
            email: newUser.email,
            token: generateToken(newUser._id),
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Erro no servidor: ' + error.message });
    }
};

// login de usuário
const loginUser = async (req,res) => {
    const {email, senha} = req.body
    try {
    const user = await User.findOne({email}).select('+senha')
    if(!user){
        res.status(404).json({errors: ["Usuário não encontrado"]})
        return
    }

    if(!(await bcrypt.compare(senha, user.senha))){
        res.status(422).json({errors:["Senha inválida"]})
        return
    }

    return res.status(200).json({
            _id: user._id,
            nome: user.nome,
            email: user.email,
            token: generateToken(user._id),
        });
}   catch (error) {
        return res.status(500).json({ msg: 'Erro no servidor: ' + error.message });
}
}

module.exports = { registerUser, loginUser }