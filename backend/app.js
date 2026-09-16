require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const port = process.env.PORT;

const app = express();

//configuração do JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
const router = require('./routes/router');
app.use(router);

//configuração do CORS
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

//conexão com o banco de dados

require('./config/db')


//inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});