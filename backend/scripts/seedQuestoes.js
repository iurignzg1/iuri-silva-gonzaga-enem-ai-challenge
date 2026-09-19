require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const Questao = require('../models/Questao');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const API_BASE_URL = 'https://api.enem.dev/v1/exams';
const RATE_LIMIT_DELAY_MS = 7000;
const RETRY_COOLDOWN_MS = 65000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getDisciplineByIndex(index) {
    if (index >= 1 && index <= 45) return 'linguagens';
    if (index >= 46 && index <= 90) return 'ciencias-humanas';
    if (index >= 91 && index <= 135) return 'ciencias-natureza';
    if (index >= 136 && index <= 180) return 'matematica';
    return 'linguagens';
}

async function fetchQuestionsBatch(url, attempts = 3) {
    for (let i = 1; i <= attempts; i++) {
        try {
            const res = await fetch(url);

            if (res.status === 429) {
                console.warn(`[seed] 429 Too Many Requests. Pausing for ${RETRY_COOLDOWN_MS / 1000}s...`);
                await wait(RETRY_COOLDOWN_MS);
                continue;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            return data.questions || [];
        } catch (error) {
            console.warn(`[seed] Attempt ${i} failed for ${url}:`, error.message);
            if (i < attempts) {
                await wait(3000);
            } else {
                throw error;
            }
        }
    }
    return [];
}

async function seedExamYear(year) {
    console.log(`[seed] Processing exam year ${year}...`);

    const batches = [
        { day: 1, offset: 1, limit: 50, language: 'ingles' },
        { day: 1, offset: 51, limit: 50, language: 'ingles' },
        { day: 1, offset: 1, limit: 10, language: 'espanhol' },
        { day: 2, offset: 91, limit: 50, language: null },
        { day: 2, offset: 141, limit: 50, language: null }
    ];

    for (const batch of batches) {
        const langQuery = batch.language ? `&language=${batch.language}` : '';
        const endpoint = `${API_BASE_URL}/${year}/questions?offset=${batch.offset}&limit=${batch.limit}${langQuery}`;

        console.log(`[seed] Fetching offset ${batch.offset} (day ${batch.day})...`);
        const questions = await fetchQuestionsBatch(endpoint);

        if (!questions.length) {
            await wait(RATE_LIMIT_DELAY_MS);
            continue;
        }

        // Prepara operações em lote (bulkWrite) para performance e escrita limpa
        const operations = questions
            .filter((q) => q.index && q.correctAlternative)
            .map((q) => {
                const day = q.index <= 90 ? 1 : 2;
                const discipline = getDisciplineByIndex(q.index);
                const language = day === 1 && q.index <= 5 ? (batch.language || q.language || 'ingles') : null;
                const questaoId = language ? `${year}-${q.index}-${language}` : `${year}-${q.index}`;

                return {
                    updateOne: {
                        filter: { questaoId },
                        update: {
                            $set: {
                                questaoId,
                                ano: year,
                                dia: day,
                                index: q.index,
                                disciplina: discipline,
                                lingua: language,
                                enunciado: q.context || '',
                                comando: q.alternativesIntroduction || null,
                                imagens: q.files || [],
                                alternativas: (q.alternatives || []).map((alt) => ({
                                    letra: alt.letter,
                                    texto: alt.text || '',
                                    imagem: alt.file || null
                                })),
                                correctAlternative: q.correctAlternative
                            }
                        },
                        upsert: true
                    }
                };
            });

        if (operations.length > 0) {
            await Questao.bulkWrite(operations);
            console.log(`[seed] Upserted ${operations.length} questions.`);
        }

        await wait(RATE_LIMIT_DELAY_MS);
    }
}

async function run() {
    try {
        const dbUser = process.env.DB_USER;
        const dbPass = process.env.DB_PASS;

        console.log('[seed] Connecting to MongoDB...');
        await mongoose.connect(
            `mongodb+srv://${dbUser}:${dbPass}@cluster0.iefcofr.mongodb.net/?appName=Cluster0`
        );
        console.log('[seed] Database connected.');

        const cliArgs = process.argv.slice(2);
        let targetYears = [2023, 2022, 2021];

        if (cliArgs.length > 0) {
            targetYears = cliArgs
                .join(' ')
                .split(/[\s,]+/)
                .map((y) => parseInt(y.trim(), 10))
                .filter((y) => !isNaN(y) && y >= 2000);
        }

        console.log(`[seed] Target years: ${targetYears.join(', ')}`);

        for (const year of targetYears) {
            await seedExamYear(year);
        }

        const totalInDb = await Questao.countDocuments();
        console.log(`[seed] Completed successfully. Total questions in database: ${totalInDb}`);

        process.exit(0);
    } catch (err) {
        console.error('[seed] Fatal error:', err.message);
        process.exit(1);
    }
}

run();
