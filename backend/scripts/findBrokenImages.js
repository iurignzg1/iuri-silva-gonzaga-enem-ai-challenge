require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Questao = require('../models/Questao');

async function findBroken() {
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASS;
    await mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.iefcofr.mongodb.net/?appName=Cluster0`);

    const questoes = await Questao.find({});
    const comBrokenImage = [];

    for (const q of questoes) {
        const jsonString = JSON.stringify(q);
        if (jsonString.includes('broken-image')) {
            comBrokenImage.push({
                id: q.questaoId,
                ano: q.ano,
                dia: q.dia,
                index: q.index,
                disciplina: q.disciplina
            });
        }
    }

    console.log(`\nTotal de questões encontradas com broken-image: ${comBrokenImage.length}`);
    comBrokenImage.forEach(item => {
        console.log(`-> Ano: ${item.ano} | Index: ${item.index} (${item.disciplina}) | ID: ${item.id}`);
    });

    process.exit(0);
}

findBroken();
