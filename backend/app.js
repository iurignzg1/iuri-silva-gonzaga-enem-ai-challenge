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

//configuração do CORS (suporta 3000 e 5173)
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

//routes
app.use(router);
app.use('/api/simulado', simuladoRoutes);


//conexão com o banco de dados

require('./config/db')


//inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

