const mongoose = require('mongoose');
const dns = require('dns');

// Define servidores DNS confiáveis para evitar erro ECONNREFUSED no querySrv do Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const conn = async () => {
    try {
        const dbConn = await mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.iefcofr.mongodb.net/?appName=Cluster0`);
        console.log('Conexão com o MongoDB realizada com sucesso');

        return dbConn;
    } catch (error) {
        console.log(error);
    }
}

conn();

module.exports = conn;