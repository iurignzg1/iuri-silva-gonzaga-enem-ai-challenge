require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const port = process.env.PORT;
//importação de rotas
const router = require('./routes/router');
const simuladoRoutes = require('./routes/SimuladoRoutes');
const userRoutes = require('./routes/UserRoutes');

const app = express();

//configuração do JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//configuração do CORS
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

//routes
app.use('/api/simulado', simuladoRoutes);
app.use(router);
app.use('/api/users', userRoutes);

//conexão com o banco de dados

require('./config/db')


//inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

