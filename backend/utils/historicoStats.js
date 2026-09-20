const { calcularNotaMateria } = require('./triCalculator');


//Normaliza os simulados para garantir que todos tenham o objeto notasPorMateria preenchido.

function normalizarHistorico(simulados) {
    return simulados.map(s => {
        const item = s.toObject ? s.toObject() : { ...s };
        const notas = item.notasPorMateria || {};

        if (!notas.matematica && !notas.natureza && !notas.humanas && !notas.linguagens) {
            item.notasPorMateria = {};
            if (item.acertos?.matematica) item.notasPorMateria.matematica = calcularNotaMateria(item.acertos.matematica, 45, 'matematica');
            if (item.acertos?.natureza) item.notasPorMateria.natureza = calcularNotaMateria(item.acertos.natureza, 45, 'natureza');
            if (item.acertos?.humanas) item.notasPorMateria.humanas = calcularNotaMateria(item.acertos.humanas, 45, 'humanas');
            if (item.acertos?.linguagens) item.notasPorMateria.linguagens = calcularNotaMateria(item.acertos.linguagens, 45, 'linguagens');
        }
        return item;
    });
}

//Processa estatísticas, recordes de proficiência TRI e agregações do histórico para a IA.

function processarEstatisticasHistorico(simulados, pesos) {
    const totalSimulados = simulados.length;
    const notas = simulados.map(s => s.notaPonderada || 0);
    const melhorTRI = Math.max(...notas).toFixed(1);

    const somasNotas = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
    const somasAcertos = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
    const contagem = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
    const maxNotas = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
    const notasMaisRecentes = { matematica: null, natureza: null, humanas: null, linguagens: null };

    const linhasDetalhe = simulados.map((s, idx) => {
        const dataFormatada = new Date(s.createdAt).toLocaleDateString('pt-BR');
        const notasItem = s.notasPorMateria || {};
        const notasDesc = [];

        // Matemática
        if (notasItem.matematica || s.acertos?.matematica) {
            const notaMat = notasItem.matematica || calcularNotaMateria(s.acertos.matematica, 45, 'matematica');
            somasNotas.matematica += notaMat;
            somasAcertos.matematica += (s.acertos?.matematica || 0);
            contagem.matematica++;
            if (notaMat > maxNotas.matematica) maxNotas.matematica = notaMat;
            notasMaisRecentes.matematica = notaMat;
            notasDesc.push(`Matemática: ${notaMat.toFixed(1)} pts (${s.acertos?.matematica || 0}/45 acertos)`);
        }

        // Natureza
        if (notasItem.natureza || s.acertos?.natureza) {
            const notaNat = notasItem.natureza || calcularNotaMateria(s.acertos.natureza, 45, 'natureza');
            somasNotas.natureza += notaNat;
            somasAcertos.natureza += (s.acertos?.natureza || 0);
            contagem.natureza++;
            if (notaNat > maxNotas.natureza) maxNotas.natureza = notaNat;
            notasMaisRecentes.natureza = notaNat;
            notasDesc.push(`Natureza: ${notaNat.toFixed(1)} pts (${s.acertos?.natureza || 0}/45 acertos)`);
        }

        // Humanas
        if (notasItem.humanas || s.acertos?.humanas) {
            const notaHum = notasItem.humanas || calcularNotaMateria(s.acertos.humanas, 45, 'humanas');
            somasNotas.humanas += notaHum;
            somasAcertos.humanas += (s.acertos?.humanas || 0);
            contagem.humanas++;
            if (notaHum > maxNotas.humanas) maxNotas.humanas = notaHum;
            notasMaisRecentes.humanas = notaHum;
            notasDesc.push(`Humanas: ${notaHum.toFixed(1)} pts (${s.acertos?.humanas || 0}/45 acertos)`);
        }

        // Linguagens
        if (notasItem.linguagens || s.acertos?.linguagens) {
            const notaLing = notasItem.linguagens || calcularNotaMateria(s.acertos.linguagens, 45, 'linguagens');
            somasNotas.linguagens += notaLing;
            somasAcertos.linguagens += (s.acertos?.linguagens || 0);
            contagem.linguagens++;
            if (notaLing > maxNotas.linguagens) maxNotas.linguagens = notaLing;
            notasMaisRecentes.linguagens = notaLing;
            notasDesc.push(`Linguagens: ${notaLing.toFixed(1)} pts (${s.acertos?.linguagens || 0}/45 acertos)`);
        }

        return `- Simulado #${idx + 1} (${s.dia === 2 ? 'Dia 2' : 'Dia 1'} em ${dataFormatada}): ${notasDesc.join(' | ')} => Média Ponderada: ${(s.notaPonderada || 0).toFixed(1)} pts`;
    });

    // Média Ponderada Global considerando exclusivamente a prova mais recente de cada matéria
    const pesosEfetivos = pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1, redacao: 1 };
    let somaPonderada = 0;
    let somaPesos = 0;
    for (const area of ['matematica', 'natureza', 'humanas', 'linguagens']) {
        if (notasMaisRecentes[area] !== null) {
            const p = pesosEfetivos[area] || 1;
            somaPonderada += notasMaisRecentes[area] * p;
            somaPesos += p;
        }
    }

    const mediaTRI = somaPesos > 0
        ? (somaPonderada / somaPesos).toFixed(1)
        : (notas.reduce((a, b) => a + b, 0) / totalSimulados).toFixed(1);

    const melhoresNotasPorArea = {
        matematica: contagem.matematica ? `${maxNotas.matematica.toFixed(1)} pts` : 'Sem registros',
        natureza: contagem.natureza ? `${maxNotas.natureza.toFixed(1)} pts` : 'Sem registros',
        humanas: contagem.humanas ? `${maxNotas.humanas.toFixed(1)} pts` : 'Sem registros',
        linguagens: contagem.linguagens ? `${maxNotas.linguagens.toFixed(1)} pts` : 'Sem registros',
    };

    const mediasNotasPorArea = {
        matematica: contagem.matematica ? `${(somasNotas.matematica / contagem.matematica).toFixed(1)} pts` : 'Sem registros',
        natureza: contagem.natureza ? `${(somasNotas.natureza / contagem.natureza).toFixed(1)} pts` : 'Sem registros',
        humanas: contagem.humanas ? `${(somasNotas.humanas / contagem.humanas).toFixed(1)} pts` : 'Sem registros',
        linguagens: contagem.linguagens ? `${(somasNotas.linguagens / contagem.linguagens).toFixed(1)} pts` : 'Sem registros',
    };

    const mediasAcertos = {
        matematica: contagem.matematica ? `${(somasAcertos.matematica / contagem.matematica).toFixed(1)} / 45` : '—',
        natureza: contagem.natureza ? `${(somasAcertos.natureza / contagem.natureza).toFixed(1)} / 45` : '—',
        humanas: contagem.humanas ? `${(somasAcertos.humanas / contagem.humanas).toFixed(1)} / 45` : '—',
        linguagens: contagem.linguagens ? `${(somasAcertos.linguagens / contagem.linguagens).toFixed(1)} / 45` : '—',
    };

    return {
        totalSimulados,
        mediaTRI,
        melhorTRI,
        melhoresNotasPorArea,
        mediasNotasPorArea,
        mediasAcertos,
        historicoLinhas: linhasDetalhe.join('\n')
    };
}

module.exports = {
    normalizarHistorico,
    processarEstatisticasHistorico
};
