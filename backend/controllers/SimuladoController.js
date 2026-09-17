class SimuladoController {
    async gerarSimulado(req, res) {
        try {
            const { dia } = req.params;
            const diaNum = parseInt(dia, 10);

            if (diaNum !== 1 && diaNum !== 2) {
                return res.status(400).json({ erro: 'Dia inválido. Utilize 1 ou 2.' });
            }

            // Anos disponíveis salvos em memória para acelerar a resposta
            const anosDisponiveis = [2018, 2019, 2020, 2021, 2022, 2023];
            const anoSorteado = anosDisponiveis[Math.floor(Math.random() * anosDisponiveis.length)];

            console.log(`[Simulado] Solicitando questões do ENEM ${anoSorteado} - Dia ${diaNum}...`);

            // Busca as questões do ano sorteado
            const response = await fetch(`https://api.enem.dev/v1/exams/${anoSorteado}/questions`);
            
            if (!response.ok) {
                throw new Error(`A API externa respondeu com status ${response.status}`);
            }

            const responseData = await response.json();

            // Definição das disciplinas por dia
            const disciplinasDia1 = ['linguagens', 'ciencias-humanas'];
            const disciplinasDia2 = ['ciencias-natureza', 'matematica'];
            const disciplinasAlvo = diaNum === 1 ? disciplinasDia1 : disciplinasDia2;

            // Garante a extração do Array, seja ele retornado diretamente ou dentro de uma propriedade
            const listaQuestoes = Array.isArray(responseData) ? responseData : (responseData.questions || responseData.data || []);

            // Filtra as questões do dia correspondente
            const questoesFiltradas = listaQuestoes.filter(q => disciplinasAlvo.includes(q.discipline));

            // Formata o payload removendo respostas corretas
            const questoesTratadas = questoesFiltradas.map(q => ({
                id: q.id,
                index: q.index,
                disciplina: q.discipline,
                enunciado: q.context,
                imagens: q.files || [],
                alternativas: (q.alternatives || []).map(alt => ({
                    letra: alt.letter,
                    texto: alt.text,
                    imagem: alt.file || null
                }))
            }));

            return res.status(200).json({
                sucesso: true,
                ano: anoSorteado,
                dia: diaNum,
                total: questoesTratadas.length,
                questoes: questoesTratadas
            });

        } catch (error) {
            console.error('[Simulado Controller Error]:', error.message);
            return res.status(500).json({ 
                erro: 'Erro ao gerar o simulado. Tente novamente.',
                detalhe: error.message 
            });
        }
    }
}

module.exports = new SimuladoController();