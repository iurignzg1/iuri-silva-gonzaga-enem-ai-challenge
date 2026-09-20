const Simulado = require('../models/Simulado');
const questaoService = require('../services/questaoService');
const geminiService = require('../services/geminiService');
const historicoStats = require('../utils/historicoStats');
const { calcularNotaSimulado } = require('../utils/triCalculator');

class SimuladoController {
    // 1. Gera as questões para o aluno responder (sem o gabarito)
    gerarSimulado = async (req, res) => {
        try {
            const diaNum = parseInt(req.params.dia, 10);
            if (diaNum !== 1 && diaNum !== 2) {
                return res.status(400).json({ erro: 'Dia inválido. Use 1 ou 2.' });
            }

            const ano = req.query.ano ? parseInt(req.query.ano, 10) : Math.floor(Math.random() * (2023 - 2021 + 1)) + 2021;
            const lingua = req.query.lingua === 'espanhol' ? 'espanhol' : 'ingles';

            const questoes = await questaoService.buscarQuestoes(ano, diaNum, lingua);
            const questoesSemGabarito = questaoService.sanitizarParaAluno(questoes, ano);

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

    // 2. Recebe as respostas do aluno, calcula acertos e salva no banco com feedback da IA
    finalizarSimulado = async (req, res) => {
        try {
            const { ano, dia, lingua, respostas } = req.body;
            const diaNum = parseInt(dia, 10);
            const anoNum = parseInt(ano, 10);

            if (!anoNum || (diaNum !== 1 && diaNum !== 2)) {
                return res.status(400).json({ erro: 'Informe o ano e o dia (1 ou 2).' });
            }

            const questoes = await questaoService.buscarQuestoes(anoNum, diaNum, lingua || 'ingles');

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

            const resultadoTRI = calcularNotaSimulado({
                acertos,
                totaisPorDisciplina,
                pesos: req.user?.pesos,
                diaNum
            });

            const feedbackIA = await geminiService.gerarFeedbackSimulado({
                diaNum,
                acertos,
                totaisPorDisciplina,
                pesos: req.user?.pesos,
                cursoAlvo: req.user?.cursoAlvo,
                faculdadeAlvo: req.user?.faculdadeAlvo
            });

            const simulado = await Simulado.create({
                userId: req.user._id,
                tipo: req.body.tipo || 'completo',
                dia: diaNum,
                acertos,
                notasPorMateria: resultadoTRI.notasPorMateria,
                totalQuestoes: questoes.length,
                notaPonderada: resultadoTRI.notaPonderada,
                feedbackIA
            });

            return res.status(201).json({
                sucesso: true,
                simuladoId: simulado._id,
                dia: diaNum,
                totalQuestoes: questoes.length,
                totalAcertos,
                acertosPorMateria: acertos,
                notasPorMateria: resultadoTRI.notasPorMateria,
                notaPonderada: resultadoTRI.notaPonderada,
                feedbackIA
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao finalizar simulado.', detalhe: error.message });
        }
    };

    // 3. Lista o histórico de simulados do usuário logado
    listarHistorico = async (req, res) => {
        try {
            const simulados = await Simulado.find({ userId: req.user._id }).sort({ createdAt: -1 });
            const simuladosFormatados = historicoStats.normalizarHistorico(simulados);

            return res.status(200).json({
                sucesso: true,
                total: simuladosFormatados.length,
                simulados: simuladosFormatados
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar histórico.', detalhe: error.message });
        }
    };

    // 4. Análise holística de todo o histórico com IA
    analisarHistorico = async (req, res) => {
        try {
            const simulados = await Simulado.find({ userId: req.user._id }).sort({ createdAt: 1 });

            if (!simulados || simulados.length === 0) {
                return res.status(200).json({
                    sucesso: true,
                    temHistorico: false,
                    mensagem: 'Complete pelo menos um simulado para gerar uma análise estratégica da IA.'
                });
            }

            const pesos = req.user?.pesos;
            const resumoHistorico = historicoStats.processarEstatisticasHistorico(simulados, pesos);

            const analiseIA = await geminiService.gerarAnaliseHistorico({
                resumoHistorico,
                pesos,
                cursoAlvo: req.user?.cursoAlvo,
                faculdadeAlvo: req.user?.faculdadeAlvo
            });

            return res.status(200).json({
                sucesso: true,
                temHistorico: true,
                resumo: resumoHistorico,
                analiseIA
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao analisar histórico com IA.', detalhe: error.message });
        }
    };
}

module.exports = new SimuladoController();