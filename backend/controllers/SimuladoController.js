const Simulado = require('../models/Simulado');
const User = require('../models/User');
const Questao = require('../models/Questao');
const { calcularNotaSimulado, calcularNotaMateria } = require('../utils/triCalculator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { gerarPromptFeedback, gerarPromptAnaliseHistorico } = require('../utils/geminiPrompts');

// Busca questões diretamente no MongoDB (muito mais rápido e sem rate limit).
// Se o banco ainda não tiver o ano semeado, faz o fallback gracioso para a API enem.dev.
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

    // Fallback: busca na API caso o banco ainda não tenha sido semeado
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

            const questoes = await buscarQuestoes(ano, diaNum, lingua);

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
                    letra: alt.letra || alt.letter,
                    texto: alt.texto || alt.text,
                    imagem: alt.imagem || alt.file || null
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

            const questoes = await buscarQuestoes(anoNum, diaNum, lingua || 'ingles');

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
                dia: diaNum,
                acertos,
                notasPorMateria: resultadoTRI.notasPorMateria,
                totalQuestoes: questoes.length,
                notaPonderada: resultadoTRI.notaPonderada,
                feedbackIA: feedbackIA
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
                feedbackIA: feedbackIA
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao finalizar simulado.', detalhe: error.message });
        }
    };

    // 3. Lista o histórico de simulados do usuário logado garantindo notasPorMateria
    listarHistorico = async (req, res) => {
        try {
            const simulados = await Simulado.find({ userId: req.user._id }).sort({ createdAt: -1 });

            // Garante que todo simulado tenha notasPorMateria mesmo se for registro legado
            const simuladosFormatados = simulados.map(s => {
                const item = s.toObject();
                if (!item.notasPorMateria || (!item.notasPorMateria.matematica && !item.notasPorMateria.natureza && !item.notasPorMateria.humanas && !item.notasPorMateria.linguagens)) {
                    item.notasPorMateria = {};
                    if (item.acertos?.matematica) item.notasPorMateria.matematica = calcularNotaMateria(item.acertos.matematica, 45, 'matematica');
                    if (item.acertos?.natureza) item.notasPorMateria.natureza = calcularNotaMateria(item.acertos.natureza, 45, 'natureza');
                    if (item.acertos?.humanas) item.notasPorMateria.humanas = calcularNotaMateria(item.acertos.humanas, 45, 'humanas');
                    if (item.acertos?.linguagens) item.notasPorMateria.linguagens = calcularNotaMateria(item.acertos.linguagens, 45, 'linguagens');
                }
                return item;
            });

            return res.status(200).json({ sucesso: true, total: simuladosFormatados.length, simulados: simuladosFormatados });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar histórico.', detalhe: error.message });
        }
    };

    // 4. Análise holística de todo o histórico com notas TRI separadas por área
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

            const totalSimulados = simulados.length;
            const notas = simulados.map(s => s.notaPonderada || 0);
            const melhorTRI = Math.max(...notas).toFixed(1);

            // Contabiliza notas TRI reais, acertos, melhores notas (recordes) e nota mais recente por disciplina
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
            const pesos = req.user?.pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1, redacao: 1 };
            let somaPonderada = 0;
            let somaPesos = 0;
            for (const area of ['matematica', 'natureza', 'humanas', 'linguagens']) {
                if (notasMaisRecentes[area] !== null) {
                    const p = pesos[area] || 1;
                    somaPonderada += notasMaisRecentes[area] * p;
                    somaPesos += p;
                }
            }
            const mediaTRI = somaPesos > 0 
                ? (somaPonderada / somaPesos).toFixed(1) 
                : (notas.reduce((a, b) => a + b, 0) / totalSimulados).toFixed(1);

            // Melhores notas TRI (recorde atingido pelo aluno) por área
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

            const resumoHistorico = {
                totalSimulados,
                mediaTRI,
                melhorTRI,
                melhoresNotasPorArea,
                mediasNotasPorArea,
                mediasAcertos,
                historicoLinhas: linhasDetalhe.join('\n')
            };

            let analiseIA = '';
            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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