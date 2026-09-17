const gerarPromptFeedback = (diaNum, acertos, totaisPorDisciplina, pesos, cursoAlvo, faculdadeAlvo) => {
    return `Atue como um tutor de alta performance para o ENEM. O aluno fez o dia ${diaNum} do simulado.
Desempenho por área (Acertos / Total de Questões da Área) e Pesos para o curso alvo (${cursoAlvo || 'Não definido'} na instituição ${faculdadeAlvo || 'Não definida'}):
- Matemática: ${acertos.matematica} de ${totaisPorDisciplina.matematica} (Peso: ${pesos.matematica})
- Ciências da Natureza: ${acertos.natureza} de ${totaisPorDisciplina.natureza} (Peso: ${pesos.natureza})
- Ciências Humanas: ${acertos.humanas} de ${totaisPorDisciplina.humanas} (Peso: ${pesos.humanas})
- Linguagens: ${acertos.linguagens} de ${totaisPorDisciplina.linguagens} (Peso: ${pesos.linguagens})

Faça uma análise rápida e estratégica de "esforço vs. resultado" (custo-benefício de estudo). Identifique onde é matematicamente mais vantajoso o aluno focar seus estudos para alavancar a nota de forma mais rápida. Considere que melhorar matérias com peso alto e taxa de acerto inicial mais baixa exige menos esforço (ex: subir de 15 para 30 acertos) do que espremer pontos em matérias onde ele já gabarita quase tudo (ex: de 35 para 40 acertos). 
Escreva 1 parágrafo curto (5 a 8 frases no máximo), em tom animador, indo direto ao ponto sobre qual(is) matéria(s) ele deve priorizar agora.`;
};

module.exports = { gerarPromptFeedback };
