const { GoogleGenerativeAI } = require('@google/generative-ai');
const { gerarPromptFeedback, gerarPromptAnaliseHistorico } = require('../utils/geminiPrompts');

// Modelos ordenados por velocidade e tolerância com fallback automático caso ocorra 503
const MODELOS_DISPONIVEIS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];


//Executa o prompt no Gemini com fallback automático entre os modelos disponíveis.

async function executarPrompt(prompt) {
    if (!process.env.GEMINI_API_KEY) {
        return '';
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const nomeModelo of MODELOS_DISPONIVEIS) {
        try {
            const model = genAI.getGenerativeModel({ model: nomeModelo });
            const result = await model.generateContent(prompt);
            const texto = result.response.text();
            if (texto) {
                return texto
                    .replace(/\*\*/g, '')
                    .replace(/^#+\s+/gm, '')
                    .trim();
            }
        } catch (error) {
            console.warn(`[GeminiService] Modelo ${nomeModelo} indisponível, tentando próximo...`, error.message);
        }
    }

    return '';
}


 // Gera feedback pedagógico para a conclusão de um simulado individual.
 
async function gerarFeedbackSimulado({ diaNum, acertos, totaisPorDisciplina, pesos, cursoAlvo, faculdadeAlvo }) {
    try {
        const prompt = gerarPromptFeedback(
            diaNum,
            acertos,
            totaisPorDisciplina,
            pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1, redacao: 1 },
            cursoAlvo,
            faculdadeAlvo
        );

        const feedback = await executarPrompt(prompt);
        return feedback || 'Parabéns por concluir o simulado! Continue revisando os pontos fracos.';
    } catch (err) {
        console.error('[GeminiService] Erro ao gerar feedback individual:', err.message);
        return 'Não foi possível gerar o parecer da IA no momento.';
    }
}


//Gera análise estratégica abrangente sobre o histórico completo de provas do estudante.

async function gerarAnaliseHistorico({ resumoHistorico, pesos, cursoAlvo, faculdadeAlvo }) {
    try {
        const prompt = gerarPromptAnaliseHistorico(
            resumoHistorico,
            pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1, redacao: 1 },
            cursoAlvo,
            faculdadeAlvo
        );

        const analise = await executarPrompt(prompt);
        return analise || 'Não foi possível gerar a análise completa no momento.';
    } catch (err) {
        console.error('[GeminiService] Erro ao gerar análise de histórico:', err.message);
        return 'Não foi possível gerar a análise no momento.';
    }
}

module.exports = {
    gerarFeedbackSimulado,
    gerarAnaliseHistorico
};
