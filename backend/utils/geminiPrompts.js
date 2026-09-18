// Prompt para feedback do simulado individual (apenas disciplinas do dia realizado)
const gerarPromptFeedback = (diaNum, acertos, totaisPorDisciplina, pesos, cursoAlvo, faculdadeAlvo) => {
    let disciplinasTexto = '';
    if (diaNum === 1) {
        disciplinasTexto = `
- Linguagens e Códigos: ${acertos.linguagens} de ${totaisPorDisciplina.linguagens || 45} (Peso SISU: ${pesos?.linguagens || 1})
- Ciências Humanas: ${acertos.humanas} de ${totaisPorDisciplina.humanas || 45} (Peso SISU: ${pesos?.humanas || 1})
(Atenção: O aluno realizou exclusivamente o DIA 1 do ENEM. NÃO comente sobre Matemática ou Ciências da Natureza, pois elas pertencem ao Dia 2).`;
    } else {
        disciplinasTexto = `
- Ciências da Natureza: ${acertos.natureza} de ${totaisPorDisciplina.natureza || 45} (Peso SISU: ${pesos?.natureza || 1})
- Matemática: ${acertos.matematica} de ${totaisPorDisciplina.matematica || 45} (Peso SISU: ${pesos?.matematica || 1})
(Atenção: O aluno realizou exclusivamente o DIA 2 do ENEM. NÃO comente sobre Linguagens ou Ciências Humanas, pois elas pertencem ao Dia 1).`;
    }

    return `Atue como um mentor pedagógico focado em alta performance no ENEM.
O aluno acabou de realizar o DIA ${diaNum} do simulado.
Meta do estudante: ${cursoAlvo || 'Não definido'} na instituição ${faculdadeAlvo || 'Não definida'}.

Desempenho nesta prova:
${disciplinasTexto}

Instruções:
Escreva um parecer curto (4 a 6 frases), objetivo e encorajador.
Analise a relação entre os acertos e o peso no curso dos sonhos. Aponte estrategicamente onde ele deve focar a revisão das matérias deste dia para crescer de forma rápida.`;
};

// Prompt para Análise Geral do Histórico de Simulados
const gerarPromptAnaliseHistorico = (resumoHistorico, pesos, cursoAlvo, faculdadeAlvo) => {
    return `Atue como um estrategista de aprovação e mentor pedagógico do ENEM.
O estudante solicitou uma análise holística do seu histórico de simulados na plataforma HyperTask.
Curso Alvo: ${cursoAlvo || 'Não definido'} na instituição ${faculdadeAlvo || 'Não definida'}.
Pesos SISU do aluno:
- Matemática: Peso ${pesos?.matematica || 1}
- Ciências da Natureza: Peso ${pesos?.natureza || 1}
- Ciências Humanas: Peso ${pesos?.humanas || 1}
- Linguagens: Peso ${pesos?.linguagens || 1}
- Redação: Peso ${pesos?.redacao || 1}

Dados consolidados do histórico:
- Total de simulados concluídos: ${resumoHistorico.totalSimulados}
- Média das notas TRI ponderadas: ${resumoHistorico.mediaTRI}
- Melhor nota TRI obtida: ${resumoHistorico.melhorTRI}
- Média de acertos por matéria:
  * Matemática: ${resumoHistorico.mediasAcertos.matematica}
  * Ciências da Natureza: ${resumoHistorico.mediasAcertos.natureza}
  * Ciências Humanas: ${resumoHistorico.mediasAcertos.humanas}
  * Linguagens: ${resumoHistorico.mediasAcertos.linguagens}

Instruções:
Elabore uma análise estratégica, estruturada em 3 tópicos curtos:
1. **Diagnóstico da Trajetória:** Avalie o patamar geral e a consistência das notas.
2. **Prioridade de Alavancagem (Custo-Benefício):** Considerando os pesos do curso alvo (${cursoAlvo || 'Geral'}), identifique onde o ganho de acertos gerará o maior retorno na nota final.
3. **Direcionamento Prático:** 2 a 3 orientações concretas para os próximos estudos.

Seja direto, empático e focado em estratégia real de prova.`;
};

module.exports = { gerarPromptFeedback, gerarPromptAnaliseHistorico };
