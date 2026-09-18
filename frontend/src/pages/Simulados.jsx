import { useState } from "react";
import { API_URL, getAuthHeaders } from "../services/api";
import styles from "./Simulados.module.css";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";

const Simulados = () => {
  const [dia, setDia] = useState(1);
  const [ano, setAno] = useState(2023);
  const [lingua, setLingua] = useState("ingles");

  const [iniciado, setIniciado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [erro, setErro] = useState("");

  const [resultado, setResultado] = useState(null);
  const [finalizando, setFinalizando] = useState(false);

  const handleIniciar = async () => {
    setCarregando(true);
    setErro("");
    try {
      const url = `${API_URL}/simulado/${dia}?ano=${ano}${dia === 1 ? `&lingua=${lingua}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.erro || "Falha ao carregar exame.");
      if (!data.questoes || data.questoes.length === 0) {
        throw new Error("Nenhuma questão encontrada para os parâmetros informados.");
      }

      setQuestoes(data.questoes);
      setRespostas({});
      setIndiceAtual(0);
      setIniciado(true);
      setResultado(null);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleSelectAlternativa = (indexQuestao, letra) => {
    setRespostas(prev => ({ ...prev, [indexQuestao]: letra }));
  };

  const handleFinalizar = async () => {
    if (Object.keys(respostas).length === 0) {
      if (!confirm("Você ainda não selecionou nenhuma resposta. Deseja finalizar mesmo assim?")) return;
    }

    setFinalizando(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/simulado/finalizar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ano, dia, lingua, respostas })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || data.detalhe || "Erro ao processar respostas.");

      setResultado(data);
      setIniciado(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setFinalizando(false);
    }
  };

  // Tela de Resultado
  if (resultado) {
    return (
      <div className={styles.resultCard}>
        <h2 className={styles.resultTitle}>Avaliação Concluída</h2>
        <p className={styles.resultSubtitle}>
          Sua folha de respostas foi computada com base nas curvas TRI.
        </p>

        <div className={styles.scoreBanner}>
          <div className={styles.scoreMeta}>Nota TRI Ponderada</div>
          <div className={styles.scoreValue}>
            {(resultado.notaPonderada || 0).toFixed(1)}
          </div>
          <div className={styles.scoreTotal}>
            Total de acertos: <strong>{resultado.totalAcertos}</strong> de {resultado.totalQuestoes} questões
          </div>
        </div>

        {resultado.feedbackIA && (
          <div className={styles.feedbackBox}>
            <div className={styles.feedbackHeader}>Síntese Pedagógica</div>
            <p className={styles.feedbackBody}>{resultado.feedbackIA}</p>
          </div>
        )}

        <button 
          onClick={() => setResultado(null)}
          className={styles.startExamBtn}
          style={{ width: "100%" }}
        >
          Configurar Nova Prova
        </button>
      </div>
    );
  }

  // Renderizador para enunciado com suporte a markdown de imagens e array de imagens
  const renderEnunciado = (texto, imagensExtras = []) => {
    if (!texto && (!imagensExtras || imagensExtras.length === 0)) return null;

    const urlRegex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
    const imagensEncontradas = new Set();
    const partes = [];
    let ultimoIndice = 0;
    let match;

    if (texto) {
      while ((match = urlRegex.exec(texto)) !== null) {
        const inicio = match.index;
        const fim = urlRegex.lastIndex;

        if (inicio > ultimoIndice) {
          const trechoTexto = texto.slice(ultimoIndice, inicio).trim();
          if (trechoTexto) {
            partes.push({ tipo: "texto", conteudo: trechoTexto });
          }
        }

        const alt = match[1];
        const url = match[2];
        imagensEncontradas.add(url);
        partes.push({ tipo: "imagem", url, alt: alt || "Figura da questão" });

        ultimoIndice = fim;
      }

      if (ultimoIndice < texto.length) {
        const trechoTexto = texto.slice(ultimoIndice).trim();
        if (trechoTexto) {
          partes.push({ tipo: "texto", conteudo: trechoTexto });
        }
      }
    }

    const adicionais = (imagensExtras || []).filter(url => !imagensEncontradas.has(url));

    return (
      <div className={styles.questionContext}>
        {partes.map((p, idx) => {
          if (p.tipo === "imagem") {
            return (
              <div key={idx} className={styles.imageWrapper}>
                <img 
                  src={p.url} 
                  alt={p.alt} 
                  className={styles.questionImage} 
                  loading="lazy" 
                />
              </div>
            );
          }
          return (
            <p key={idx} className={styles.questionParagraph}>
              {p.conteudo}
            </p>
          );
        })}

        {adicionais.map((url, idx) => (
          <div key={`extra-${idx}`} className={styles.imageWrapper}>
            <img 
              src={url} 
              alt={`Figura complementar ${idx + 1}`} 
              className={styles.questionImage} 
              loading="lazy" 
            />
          </div>
        ))}
      </div>
    );
  };

  // Tela durante a Prova
  if (iniciado && questoes.length > 0) {
    const q = questoes[indiceAtual];
    const questaoId = q.index;
    const alternativaEscolhida = respostas[questaoId];

    return (
      <div className={styles.container}>
        <div className={styles.examTopBar}>
          <div className={styles.examMeta}>
            <span className={styles.areaTag}>{q.disciplina?.replace("-", " ")}</span>
            <span className={styles.questionCount}>
              Questão {indiceAtual + 1} de {questoes.length}
            </span>
          </div>

          <button 
            onClick={handleFinalizar}
            disabled={finalizando}
            className={styles.submitExamBtn}
          >
            {finalizando ? "Processando..." : "Entregar Prova"}
          </button>
        </div>

        <div className={styles.questionCard}>
          {renderEnunciado(q.enunciado, q.imagens)}

          {q.comando && (
            <div className={styles.questionPrompt}>{q.comando}</div>
          )}

          <div className={styles.optionsList}>
            {q.alternativas?.map(alt => {
              const selecionada = alternativaEscolhida === alt.letra;
              return (
                <div 
                  key={alt.letra}
                  onClick={() => handleSelectAlternativa(questaoId, alt.letra)}
                  className={`${styles.optionItem} ${selecionada ? styles.optionSelected : ""}`}
                >
                  <span className={styles.optionLetter}>{alt.letra}</span>
                  <div className={styles.altContent}>
                    {alt.texto && <span className={styles.optionText}>{alt.texto}</span>}
                    {alt.imagem && (
                      <img 
                        src={alt.imagem} 
                        alt={`Alternativa ${alt.letra}`} 
                        className={styles.altImage} 
                        loading="lazy" 
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.examNavBar}>
          <button 
            onClick={() => setIndiceAtual(prev => Math.max(0, prev - 1))}
            disabled={indiceAtual === 0}
            className={styles.navButton}
          >
            <FiArrowLeft size={14} /> Anterior
          </button>

          <span className={styles.answeredCount}>
            {Object.keys(respostas).length} de {questoes.length} respondidas
          </span>

          <button 
            onClick={() => setIndiceAtual(prev => Math.min(questoes.length - 1, prev + 1))}
            disabled={indiceAtual === questoes.length - 1}
            className={styles.navButton}
          >
            Próxima <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Tela Inicial de Configuração
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Simulados ENEM</h1>
        <p className={styles.subtitle}>
          Selecione uma edição histórica oficial para resolução cronometrada.
        </p>
      </div>

      {erro && (
        <div style={{ padding: "0.85rem 1rem", background: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          {erro}
        </div>
      )}

      <div className={styles.configCard}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Dia de Aplicação</label>
          <div className={styles.daySelector}>
            <div 
              onClick={() => setDia(1)}
              className={`${styles.dayOption} ${dia === 1 ? styles.daySelected : ""}`}
            >
              <div className={styles.dayTitle}>Caderno 1</div>
              <p className={styles.dayDesc}>Linguagens, Códigos e Ciências Humanas</p>
            </div>

            <div 
              onClick={() => setDia(2)}
              className={`${styles.dayOption} ${dia === 2 ? styles.daySelected : ""}`}
            >
              <div className={styles.dayTitle}>Caderno 2</div>
              <p className={styles.dayDesc}>Ciências da Natureza e Matemática</p>
            </div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Edição do Exame</label>
          <select 
            value={ano} 
            onChange={(e) => setAno(Number(e.target.value))}
            className={styles.selectInput}
          >
            {[2023, 2022, 2021, 2020, 2019, 2018, 2017].map(a => (
              <option key={a} value={a}>ENEM {a}</option>
            ))}
          </select>
        </div>

        {dia === 1 && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Língua Estrangeira</label>
            <div className={styles.langButtons}>
              <button
                type="button"
                onClick={() => setLingua("ingles")}
                className={`${styles.langBtn} ${lingua === "ingles" ? styles.langBtnActive : ""}`}
              >
                Inglês
              </button>
              <button
                type="button"
                onClick={() => setLingua("espanhol")}
                className={`${styles.langBtn} ${lingua === "espanhol" ? styles.langBtnActive : ""}`}
              >
                Espanhol
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={handleIniciar}
          disabled={carregando}
          className={styles.startExamBtn}
        >
          {carregando ? "Carregando Caderno..." : "Iniciar Simulado"}
        </button>
      </div>
    </div>
  );
};

export default Simulados;
