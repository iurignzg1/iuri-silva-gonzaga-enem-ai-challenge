const PARAMETROS_TRI = {
    matematica: { min: 320, max: 985, expoente: 1.35 },
    linguagens: { min: 330, max: 825, expoente: 1.15 },
    humanas:    { min: 325, max: 860, expoente: 1.20 },
    natureza:   { min: 320, max: 875, expoente: 1.25 }
};

/**
 * Calcula a nota estimada pelo TRI para uma disciplina específica.
 * @param {number} acertos - Quantidade de questões acertadas
 * @param {number} total - Total de questões da disciplina (geralmente 45)
 * @param {string} disciplina - 'matematica' | 'linguagens' | 'humanas' | 'natureza'
 * @returns {number} Nota na escala ENEM (arredondada em 1 casa decimal)
 */
function calcularNotaMateria(acertos, total = 45, disciplina) {
    if (!total || total <= 0) return 0;
    if (acertos <= 0) return PARAMETROS_TRI[disciplina]?.min || 320;

    const taxaAcertos = Math.min(Math.max(acertos / total, 0), 1);
    const config = PARAMETROS_TRI[disciplina] || { min: 320, max: 850, expoente: 1.2 };

    // Curva progressiva (S-curve simplificada baseada no padrão TRI)
    const progressao = Math.pow(taxaAcertos, config.expoente);
    const nota = config.min + (config.max - config.min) * progressao;

    return Number(nota.toFixed(1));
}

/**
 * Calcula as notas TRI individuais e a nota final ponderada do simulado.
 * @param {object} params
 * @param {object} params.acertos - { matematica, natureza, humanas, linguagens }
 * @param {object} params.totaisPorDisciplina - Total de questões por matéria
 * @param {object} params.pesos - Pesos do usuário ({ linguagens: 1, humanas: 2, ... })
 * @param {number} params.diaNum - 1 ou 2
 * @returns {object} { notasPorMateria, notaPonderada }
 */
function calcularNotaSimulado({ acertos, totaisPorDisciplina = {}, pesos = {}, diaNum }) {
    const pesosValidos = pesos || {};
    const notasPorMateria = {};

    if (diaNum === 1) {
        const totalLing = totaisPorDisciplina.linguagens || 45;
        const totalHum = totaisPorDisciplina.humanas || 45;

        notasPorMateria.linguagens = calcularNotaMateria(acertos.linguagens || 0, totalLing, 'linguagens');
        notasPorMateria.humanas = calcularNotaMateria(acertos.humanas || 0, totalHum, 'humanas');

        const pesoLing = pesosValidos.linguagens || 1;
        const pesoHum = pesosValidos.humanas || 1;
        const somaPesos = pesoLing + pesoHum;

        const ponderada = ((notasPorMateria.linguagens * pesoLing) + (notasPorMateria.humanas * pesoHum)) / somaPesos;
        return {
            notasPorMateria,
            notaPonderada: Number(ponderada.toFixed(1))
        };
    } else {
        const totalNat = totaisPorDisciplina.natureza || 45;
        const totalMat = totaisPorDisciplina.matematica || 45;

        notasPorMateria.natureza = calcularNotaMateria(acertos.natureza || 0, totalNat, 'natureza');
        notasPorMateria.matematica = calcularNotaMateria(acertos.matematica || 0, totalMat, 'matematica');

        const pesoNat = pesosValidos.natureza || 1;
        const pesoMat = pesosValidos.matematica || 1;
        const somaPesos = pesoNat + pesoMat;

        const ponderada = ((notasPorMateria.natureza * pesoNat) + (notasPorMateria.matematica * pesoMat)) / somaPesos;
        return {
            notasPorMateria,
            notaPonderada: Number(ponderada.toFixed(1))
        };
    }
}

module.exports = {
    calcularNotaMateria,
    calcularNotaSimulado
};
