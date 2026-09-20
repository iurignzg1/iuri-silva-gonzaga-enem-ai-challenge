const Questao = require('../models/Questao');


//Busca questões no MongoDB (rápido e sem limites de taxa).
//Possui fallback transparente para a API externa caso o ano ainda não tenha sido semeado.
 
async function buscarQuestoes(ano, diaNum, lingua) {
    const query = {
        ano,
        dia: diaNum,
        ...(diaNum === 1
            ? { $or: [{ index: { $gt: 5 } }, { lingua: lingua || 'ingles' }] }
            : {})
    };

    const doBanco = await Questao.find(query).sort({ index: 1 });
    if (doBanco && doBanco.length >= 80) {
        return doBanco.map(q => ({
            id: q.questaoId || `${q.ano}-${q.index}`,
            index: q.index,
            discipline: q.disciplina,
            language: q.lingua,
            context: q.enunciado,
            alternativesIntroduction: q.comando,
            files: q.imagens || [],
            alternatives: q.alternativas || [],
            correctAlternative: q.correctAlternative
        }));
    }

    // Fallback: busca na API pública caso o banco não contenha o ano
    const offsets = diaNum === 1 ? [1, 51] : [91, 141];
    const langQuery = diaNum === 1 && lingua ? `&language=${lingua}` : '';

    const requests = offsets.map(offset =>
        fetch(`https://api.enem.dev/v1/exams/${ano}/questions?offset=${offset}&limit=50${langQuery}`)
            .then(res => res.json())
            .then(data => data.questions || [])
    );

    const resultados = await Promise.all(requests);
    const todas = resultados.flat();

    const mapa = new Map();
    for (const q of todas) {
        const pertenceAoDia = diaNum === 1 ? q.index <= 90 : q.index > 90;
        if (pertenceAoDia && !mapa.has(q.index)) {
            if (q.index >= 1 && q.index <= 45) q.discipline = 'linguagens';
            else if (q.index >= 46 && q.index <= 90) q.discipline = 'ciencias-humanas';
            else if (q.index >= 91 && q.index <= 135) q.discipline = 'ciencias-natureza';
            else if (q.index >= 136 && q.index <= 180) q.discipline = 'matematica';

            mapa.set(q.index, q);
        }
    }
    return Array.from(mapa.values()).sort((a, b) => a.index - b.index);
}


 //Remove o gabarito das questões antes de entregar ao aluno no frontend.

function sanitizarParaAluno(questoes, ano) {
    return questoes.map(q => ({
        id: `${ano}-${q.index}`,
        index: q.index,
        disciplina: q.discipline,
        lingua: q.language || null,
        enunciado: q.context,
        comando: q.alternativesIntroduction || null,
        imagens: q.files || [],
        alternativas: (q.alternatives || []).map(alt => ({
            letra: alt.letra || alt.letter,
            texto: alt.texto || alt.text,
            imagem: alt.imagem || alt.file || null
        }))
    }));
}

module.exports = {
    buscarQuestoes,
    sanitizarParaAluno
};
