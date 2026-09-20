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
Analise a relação entre os acertos e o peso no curso dos sonhos. Aponte estrategicamente onde ele deve focar a revisão das matérias deste dia para crescer de forma rápida.
(Observação contextual: Se a instituição escolhida historicamente não oferece o curso selecionado pelo SISU/vestibular, como Medicina ou Direito em institutos puramente tecnológicos, inclua uma observação breve e amigável orientando o estudante).

IMPORTANTE: Escreva em texto corrido e natural. NÃO utilize nenhum tipo de marcação markdown como asteriscos (** ou *), hashtags (#) ou tópicos com traços. Use apenas pontuação e parágrafos normais.`;
};

// Prompt para Análise Geral do Histórico de Simulados com Notas TRI separadas por área
const gerarPromptAnaliseHistorico = (resumoHistorico, pesos, cursoAlvo, faculdadeAlvo) => {
    return `Atue como um estrategista de aprovação e mentor de alta performance do ENEM.
O estudante solicitou uma análise holística do seu histórico de simulados na plataforma HyperTask.
Curso Alvo: ${cursoAlvo || 'Não definido'} na instituição ${faculdadeAlvo || 'Não definida'}.

Pesos SISU do aluno para o curso:
- Matemática: Peso ${pesos?.matematica || 1}
- Ciências da Natureza: Peso ${pesos?.natureza || 1}
- Ciências Humanas: Peso ${pesos?.humanas || 1}
- Linguagens: Peso ${pesos?.linguagens || 1}
- Redação: Peso ${pesos?.redacao || 1}

MELHORES NOTAS TRI POR ÁREA (RECORDES DE PROFICIÊNCIA DO ALUNO):
- Matemática: ${resumoHistorico.melhoresNotasPorArea.matematica} (Peso SISU: ${pesos?.matematica || 1})
- Ciências da Natureza: ${resumoHistorico.melhoresNotasPorArea.natureza} (Peso SISU: ${pesos?.natureza || 1})
- Ciências Humanas: ${resumoHistorico.melhoresNotasPorArea.humanas} (Peso SISU: ${pesos?.humanas || 1})
- Linguagens: ${resumoHistorico.melhoresNotasPorArea.linguagens} (Peso SISU: ${pesos?.linguagens || 1})

HISTÓRICO SIMULADO A SIMULADO (EVOLUÇÃO DAS NOTAS POR ÁREA):
${resumoHistorico.historicoLinhas}

RESUMO GERAL:
- Total de simulados realizados: ${resumoHistorico.totalSimulados}
- Melhor nota TRI ponderada alcançada: ${resumoHistorico.melhorTRI}
- Média TRI ponderada global: ${resumoHistorico.mediaTRI}

Instruções para o parecer:
Elabore uma análise estratégica personalizada, organizada em 3 seções claras:

1. Diagnóstico de Proficiência e Teto Demonstrado: Avalie as maiores notas (recordes) alcançadas pelo aluno em cada disciplina como o patamar real que ele já é capaz de atingir, destacando onde ele já tem domínio e a evolução perceptível entre os primeiros exames e os mais recentes.
2. Estratégia de Alavancagem: Considerando a faculdade (${faculdadeAlvo || 'SISU'}) e o curso (${cursoAlvo || 'almejado'}), determine com precisão onde investir horas de estudo para subir a nota final ponderada com o menor custo de esforço (custo-benefício pelos pesos).
3. Plano de Ação Tático: 2 a 3 diretrizes pragmáticas para orientar os estudos da próxima semana.

(Observação contextual: Se a instituição escolhida pelo aluno não ofertar o curso almejado no SISU, como Medicina em institutos tecnológicos ou faculdades com foco estrito em outras áreas, faça um alerta tático sutil sugerindo verificar universidades com o curso ativo).

DIRETRIZ DE FORMATAÇÃO RIGOROSA: Escreva em texto natural com parágrafos bem espaçados. É ESTRITAMENTE PROIBIDO usar asteriscos (** ou *), hashtags (#), sublinhados (_) ou qualquer caractere markdown. O texto deve ser exibido diretamente como texto puro e legível.

Mantenha o tom profissional, direto e altamente motivador.`;
};

module.exports = { gerarPromptFeedback, gerarPromptAnaliseHistorico };
