const Simulado = require('../models/Simulado');
const User = require('../models/User');
const { calcularNotaSimulado } = require('../utils/triCalculator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { gerarPromptFeedback, gerarPromptAnaliseHistorico } = require('../utils/geminiPrompts');

// Função auxiliar para buscar questões na API do ENEM
async function buscarQuestoesEnem(ano, diaNum, lingua) {
    const offsets = diaNum === 1 ? [1, 51] : [91, 141];
    const langQuery = diaNum === 1 && lingua ? `&language=${lingua}` : '';

    const requests = offsets.map(offset =>
        fetch(`https://api.enem.dev/v1/exams/${ano}/questions?offset=${offset}&limit=50${langQuery}`)
            .then(res => res.json())
            .then(data => data.questions || [])
    );

    const resultados = await Promise.all(requests);
    const todas = resultados.flat();

    // Filtra pelo dia e remove repetições
    const mapa = new Map();
    for (const q of todas) {
        const pertenceAoDia = diaNum === 1 ? q.index <= 90 : q.index > 90;
        if (pertenceAoDia && !mapa.has(q.index)) {
            // Força a disciplina correta baseada no index padrão do ENEM para evitar erros da API externa
            if (q.index >= 1 && q.index <= 45) q.discipline = 'linguagens';
            else if (q.index >= 46 && q.index <= 90) q.discipline = 'ciencias-humanas';
            else if (q.index >= 91 && q.index <= 135) q.discipline = 'ciencias-natureza';
            else if (q.index >= 136 && q.index <= 180) q.discipline = 'matematica';
            
            mapa.set(q.index, q);
        }
    }
    return Array.from(mapa.values()).sort((a, b) => a.index - b.index);
}

class SimuladoController {
    // 1. Gera as questões para o aluno responder (sem o gabarito)
    gerarSimulado = async (req, res) => {
        try {
            const diaNum = parseInt(req.params.dia, 10);
            if (diaNum !== 1 && diaNum !== 2) {
                return res.status(400).json({ erro: 'Dia inválido. Use 1 ou 2.' });
            }

            const ano = req.query.ano ? parseInt(req.query.ano, 10) : Math.floor(Math.random() * (2023 - 2017 + 1)) + 2017;
            const lingua = req.query.lingua === 'espanhol' ? 'espanhol' : 'ingles';

            const questoes = await buscarQuestoesEnem(ano, diaNum, lingua);

            // Remove o gabarito antes de enviar ao frontend
            const questoesSemGabarito = questoes.map(q => ({
                id: `${ano}-${q.index}`,
                index: q.index,
                disciplina: q.discipline,
                lingua: q.language || null,
                enunciado: q.context,
                comando: q.alternativesIntroduction || null,
                imagens: q.files || [],
                alternativas: (q.alternatives || []).map(alt => ({
                    letra: alt.letter,
                    texto: alt.text,
                    imagem: alt.file || null
                }))
            }));

            return res.status(200).json({
                sucesso: true,
                ano,
                dia: diaNum,
                lingua: diaNum === 1 ? lingua : undefined,
                total: questoesSemGabarito.length,
                questoes: questoesSemGabarito
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao carregar simulado.', detalhe: error.message });
        }
    };

    // 2. Recebe as respostas do aluno, calcula acertos e salva no banco
    finalizarSimulado = async (req, res) => {
        try {
            const { ano, dia, lingua, respostas } = req.body;
            const diaNum = parseInt(dia, 10);
            const anoNum = parseInt(ano, 10);

            if (!anoNum || (diaNum !== 1 && diaNum !== 2)) {
                return res.status(400).json({ erro: 'Informe o ano e o dia (1 ou 2).' });
            }

            const questoes = await buscarQuestoesEnem(anoNum, diaNum, lingua || 'ingles');

            // Contabiliza acertos e totais por disciplina
            const acertos = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
            const totaisPorDisciplina = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
            let totalAcertos = 0;

            questoes.forEach(q => {
                if (q.discipline === 'linguagens') totaisPorDisciplina.linguagens++;
                if (q.discipline === 'ciencias-humanas') totaisPorDisciplina.humanas++;
                if (q.discipline === 'ciencias-natureza') totaisPorDisciplina.natureza++;
                if (q.discipline === 'matematica') totaisPorDisciplina.matematica++;

                const respAluno = respostas?.[q.index] || respostas?.[`${anoNum}-${q.index}`];
                if (respAluno && respAluno.toUpperCase() === q.correctAlternative?.toUpperCase()) {
                    totalAcertos++;
                    if (q.discipline === 'linguagens') acertos.linguagens++;
                    if (q.discipline === 'ciencias-humanas') acertos.humanas++;
                    if (q.discipline === 'ciencias-natureza') acertos.natureza++;
                    if (q.discipline === 'matematica') acertos.matematica++;
                }
            });

            // Estima a nota TRI real baseada nas curvas históricas do ENEM e nos pesos do aluno
            const resultadoTRI = calcularNotaSimulado({
                acertos,
                totaisPorDisciplina,
                pesos: req.user?.pesos,
                diaNum
            });

            let feedbackIA = '';
            try {
                if (process.env.GEMINI_API_KEY) {
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const pesos = req.user?.pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1, redacao: 1 };
                    
                    const prompt = gerarPromptFeedback(
                        diaNum, 
                        acertos, 
                        totaisPorDisciplina, 
                        pesos, 
                        req.user?.cursoAlvo, 
                        req.user?.faculdadeAlvo
                    );

                    // Lista de modelos disponíveis com fallback automático caso um esteja sobrecarregado (503)
                    const modelosDisponiveis = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];
                    
                    for (const nomeModelo of modelosDisponiveis) {
                        try {
                            const model = genAI.getGenerativeModel({ model: nomeModelo });
                            const result = await model.generateContent(prompt);
                            feedbackIA = result.response.text();
                            if (feedbackIA) break;
                        } catch (modelErr) {
                            console.warn(`Modelo ${nomeModelo} indisponível, tentando próximo...`, modelErr.message);
                        }
                    }
                }
            } catch (err) {
                console.error('Erro ao gerar feedback com IA:', err);
                feedbackIA = 'Não foi possível gerar o feedback da IA nesse momento.';
            }

            const simulado = await Simulado.create({
                userId: req.user._id,
                tipo: req.body.tipo || 'completo',
                acertos,
                totalQuestoes: questoes.length,
                notaPonderada: resultadoTRI.notaPonderada,
                feedbackIA: feedbackIA
            });

            return res.status(201).json({
                sucesso: true,
                simuladoId: simulado._id,
                totalQuestoes: questoes.length,
                totalAcertos,
                acertosPorMateria: acertos,
                notasPorMateria: resultadoTRI.notasPorMateria,
                notaPonderada: resultadoTRI.notaPonderada,
                feedbackIA: feedbackIA
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao finalizar simulado.', detalhe: error.message });
        }
    };

    // 4. Análise holística de todo o histórico do aluno via IA
    analisarHistorico = async (req, res) => {
        try {
            const simulados = await Simulado.find({ userId: req.user._id }).sort({ createdAt: 1 });

            if (!simulados || simulados.length === 0) {
                return res.status(200).json({
                    sucesso: true,
                    temHistorico: false,
                    mensagem: "Complete pelo menos um simulado para gerar uma análise estratégica da IA."
                });
            }

            // Calcula estatísticas consolidadas
            const totalSimulados = simulados.length;
            const notas = simulados.map(s => s.notaPonderada || 0);
            const mediaTRI = (notas.reduce((a, b) => a + b, 0) / totalSimulados).toFixed(1);
            const melhorTRI = Math.max(...notas).toFixed(1);

            // Médias de acertos por matéria
            const contagemMaterias = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
            const somasAcertos = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };

            simulados.forEach(s => {
                if (s.acertos) {
                    if (s.acertos.matematica > 0) { somasAcertos.matematica += s.acertos.matematica; contagemMaterias.matematica++; }
                    if (s.acertos.natureza > 0) { somasAcertos.natureza += s.acertos.natureza; contagemMaterias.natureza++; }
                    if (s.acertos.humanas > 0) { somasAcertos.humanas += s.acertos.humanas; contagemMaterias.humanas++; }
                    if (s.acertos.linguagens > 0) { somasAcertos.linguagens += s.acertos.linguagens; contagemMaterias.linguagens++; }
                }
            });

            const mediasAcertos = {
                matematica: contagemMaterias.matematica ? (somasAcertos.matematica / contagemMaterias.matematica).toFixed(1) : '0',
                natureza: contagemMaterias.natureza ? (somasAcertos.natureza / contagemMaterias.natureza).toFixed(1) : '0',
                humanas: contagemMaterias.humanas ? (somasAcertos.humanas / contagemMaterias.humanas).toFixed(1) : '0',
                linguagens: contagemMaterias.linguagens ? (somasAcertos.linguagens / contagemMaterias.linguagens).toFixed(1) : '0',
            };

            const resumoHistorico = {
                totalSimulados,
                mediaTRI,
                melhorTRI,
                mediasAcertos
            };

            let analiseIA = '';
            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const pesos = req.user?.pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1, redacao: 1 };
                const prompt = gerarPromptAnaliseHistorico(
                    resumoHistorico,
                    pesos,
                    req.user?.cursoAlvo,
                    req.user?.faculdadeAlvo
                );

                const modelosDisponiveis = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];
                for (const nomeModelo of modelosDisponiveis) {
                    try {
                        const model = genAI.getGenerativeModel({ model: nomeModelo });
                        const result = await model.generateContent(prompt);
                        analiseIA = result.response.text();
                        if (analiseIA) break;
                    } catch (modelErr) {
                        console.warn(`Modelo ${nomeModelo} indisponível na análise de histórico, tentando próximo...`, modelErr.message);
                    }
                }
            }

            return res.status(200).json({
                sucesso: true,
                temHistorico: true,
                resumo: resumoHistorico,
                analiseIA: analiseIA || "Não foi possível gerar a análise no momento."
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao analisar histórico com IA.', detalhe: error.message });
        }
    };
}

module.exports = new SimuladoController();