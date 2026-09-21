# HyperTask — Simulador ENEM com Mentoria por IA

> **Desafio de Estágio — Iuri Silva Gonzaga**

🔗 **Deploy:** https://iuri-silva-gonzaga-enem-ai-challeng.vercel.app/

---

## O que é este projeto

HyperTask é uma plataforma de preparação para o ENEM que combina simulados com provas oficiais históricas e análise pedagógica gerada pela IA do Google (Gemini). O objetivo é ir além da simples correção: o aluno recebe um parecer estratégico personalizado com base no seu desempenho e no perfil do curso e faculdade que almeja.

---

## A ideia por trás do uso da IA

O diferencial desta plataforma está na **forma como a IA é usada, não apenas no fato de ser usada**.

A maioria das plataformas de simulado mostra acertos e erros. O HyperTask vai além: após cada prova, o **Gemini atua como um mentor pedagógico**, recebendo não apenas o desempenho bruto do aluno (acertos por área), mas também:

- os **pesos SISU personalizados** de cada disciplina para o curso e faculdade que o aluno quer ingressar
- o **contexto de evolução histórica** (simulado a simulado) para identificar tendências

Com isso, a IA consegue responder perguntas que nenhum gabarito automático responde: _"Onde devo focar meu esforço esta semana para subir mais pontos considerando o que o meu curso mais valoriza?"_

Existem dois modos de análise por IA:

1. **Feedback imediato pós-simulado** — parecer curto e objetivo sobre o dia realizado (Dia 1 ou Dia 2), com orientações de revisão focadas nas matérias daquele caderno.
2. **Diagnóstico holístico do histórico** — análise estratégica profunda de toda a trajetória do aluno, com três seções: diagnóstico de proficiência, estratégia de alavancagem por pesos e plano tático de estudos para a semana.

Os prompts foram engenheirizados para gerar respostas em **texto corrido, sem markdown**, prontas para exibição direta na interface.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + CSS Modules |
| Backend | Node.js + Express 5 |
| Banco de dados | MongoDB Atlas (Mongoose) |
| IA | Google Gemini (`@google/generative-ai`) com fallback automático entre modelos |
| Autenticação | JWT + bcryptjs |
| Dados ENEM | [api.enem.dev](https://api.enem.dev) (seed) + MongoDB (runtime) |

---

## Funcionalidades

- **Cadastro e login** com autenticação JWT
- **Perfil personalizado**: curso-alvo, faculdade-alvo e pesos SISU por disciplina (1–5)
- **Simulados históricos do ENEM** (2017–2023) com suporte a Língua Estrangeira (inglês ou espanhol)
- **Correção automática** com cálculo de nota estimada por TRI (Teoria de Resposta ao Item)
- **Feedback da IA (Gemini)** ao finalizar cada simulado
- **Dashboard de desempenho**: histórico completo, recordes por área, médias ponderadas e evolução TRI
- **Análise holística por IA** do histórico completo com estratégia de estudo personalizada
- **Modo escuro / claro** com toggle persistente

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cluster gratuito funciona)
- Chave de API do [Google AI Studio](https://aistudio.google.com/) (Gemini)

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd "Desafio Estágio - Iuri Silva Gonzaga"
```

---

### 2. Configure o backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` dentro de `backend/`:

```env
PORT=5000
DB_USER=seu_usuario_mongodb
DB_PASS=sua_senha_mongodb
JWT_SECRET=uma_string_secreta_qualquer
GEMINI_API_KEY=sua_chave_gemini
```

> ⚠️ **Nunca suba o `.env` para o GitHub.** Ele já está no `.gitignore`.

---

### 3. Popule o banco com as questões do ENEM

O script aceita os anos desejados diretamente como argumentos. Para baixar todas as edições disponíveis na API pública:

```bash
node scripts/seedQuestoes.js 2009 2010 2011 2012 2013 2014 2015 2016 2017 2018 2019 2020 2021 2022 2023
```

Para baixar apenas os anos padrão (2021, 2022 e 2023) use o atalho:

```bash
npm run seed
```

> O seed respeita o rate limit da API pública com pausas automáticas entre as requisições. Edições mais antigas podem levar mais tempo. Após concluído, os simulados são servidos exclusivamente pelo banco, sem nenhuma chamada externa em runtime.

---

### 4. Inicie o servidor

```bash
npm run server   # com hot-reload (nodemon)
# ou
npm start        # sem hot-reload
```

O backend estará em `http://localhost:5000`.

---

### 5. Configure e rode o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em `http://localhost:5173`.

---

## Estrutura do projeto

```
├── backend/
│   ├── controllers/       # SimuladoController, UserController
│   ├── models/            # User, Questao, Simulado (Mongoose)
│   ├── routes/            # SimuladoRoutes, UserRoutes
│   ├── services/          # geminiService, questaoService
│   ├── utils/             # geminiPrompts, historicoStats, triCalculator
│   ├── middlewares/       # authGuard (JWT)
│   ├── scripts/           # seedQuestoes.js (CLI de população de banco)
│   └── app.js
│
└── frontend/
    └── src/
        ├── pages/         # PaginaInicial, Login, Register, Home, Simulados, Dashboard, Profile
        ├── components/    # Componentes modulares e reutilizáveis
        │   ├── simulado/  # QuestaoEnunciado, SimuladoConfig, SimuladoExame, SimuladoResultado
        │   ├── dashboard/ # MetricasGrid, RecordesPorArea, DiagnosticoIA, HistoricoList
        │   ├── profile/   # MetasAprovacao, MatrizPesos
        │   └── ...        # Sidebar, AppLayout, PublicLayout, ThemeToggle
        ├── context/       # AuthContext, ThemeContext
        ├── utils/         # dashboardMetrics.js (cálculos de TRI ponderada e recordes)
        └── services/      # api.js (base URL + auth headers)
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor Express |
| `DB_USER` | Usuário do MongoDB Atlas |
| `DB_PASS` | Senha do MongoDB Atlas |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT |
| `GEMINI_API_KEY` | Chave da API do Google Gemini |

---

## Prints da aplicação

Pagina inicial
<img width="1920" height="1032" alt="HyperTask — Simulador ENEM com Mentoria por IA - Brave 21_09_2026 17_37_52" src="https://github.com/user-attachments/assets/6deb17fb-8f2c-4e79-b70a-03b4afc18568" />

Pagina de Registro e Login
<img width="1920" height="1032" alt="HyperTask — Simulador ENEM com Mentoria por IA - Brave 21_09_2026 17_38_01" src="https://github.com/user-attachments/assets/a60fdd56-e7b9-44b4-81c3-ec548118eee5" />
<img width="1920" height="1032" alt="HyperTask — Simulador ENEM com Mentoria por IA - Brave 21_09_2026 17_38_10" src="https://github.com/user-attachments/assets/5e4a4ef4-a6fd-48d8-9dae-65bc51ae785f" />

Pagina de Simulado e conclusão com relatório da IA
<img width="1918" height="1027" alt="Animação" src="https://github.com/user-attachments/assets/f7ffcb69-f432-4630-9f61-b1dda38fa150" />

Pagina de histórico e relatório holístico da IA com base no histórico
<img width="1916" height="989" alt="Tema escuro e diagnostico do historico" src="https://github.com/user-attachments/assets/dcf529d2-36a4-4164-8931-e7a2e2eb7e51" />

Dashboard do aluno com configurações de curso, instituição e pesos
<img width="1920" height="1032" alt="HyperTask — Simulador ENEM com Mentoria por IA - Brave 21_09_2026 17_53_36" src="https://github.com/user-attachments/assets/14f6abe8-858b-410d-bf65-4ad108093e35" />





---

## Autor

**Iuri Silva Gonzaga**  
Desafio de Estágio — 2026
