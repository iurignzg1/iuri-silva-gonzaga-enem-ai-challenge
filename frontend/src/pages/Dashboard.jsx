import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL, getAuthHeaders } from "../services/api";
import styles from "./Dashboard.module.css";
import { FiInbox, FiArrowRight, FiFileText, FiChevronDown, FiChevronUp } from "react-icons/fi";

const Dashboard = () => {
  const { user } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [openFeedbackId, setOpenFeedbackId] = useState(null);

  // Análise Geral com IA
  const [analiseIA, setAnaliseIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState("");

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const res = await fetch(`${API_URL}/simulado/historico`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || "Falha ao carregar histórico.");
        setHistorico(data.simulados || []);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  const handleGerarAnaliseIA = async () => {
    setCarregandoIA(true);
    setErroIA("");

    try {
      const res = await fetch(`${API_URL}/simulado/analise-historico`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || data.detalhe || "Erro ao consultar a IA.");

      if (data.temHistorico === false) {
        setAnaliseIA(data.mensagem);
      } else {
        setAnaliseIA(data.analiseIA);
      }
    } catch (err) {
      setErroIA(err.message);
    } finally {
      setCarregandoIA(false);
    }
  };

  const toggleFeedback = (id) => {
    setOpenFeedbackId(prev => prev === id ? null : id);
  };

  const totalSimulados = historico.length;
  const melhorNota = historico.length > 0 
    ? Math.max(...historico.map(s => s.notaPonderada || 0)).toFixed(1)
    : "—";

  // Média Ponderada Global considerando a nota de somente UMA prova por matéria (a mais recente)
  const mediaNotas = (() => {
    if (historico.length === 0) return "—";

    const pesos = user?.pesos || { matematica: 1, natureza: 1, humanas: 1, linguagens: 1 };

    // Filtra para pegar exclusivamente a prova mais recente de cada área
    const maisRecentes = {
      matematica: null,
      natureza: null,
      humanas: null,
      linguagens: null
    };

    const ordenados = [...historico].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    for (const s of ordenados) {
      const notas = s.notasPorMateria || {};
      if (maisRecentes.matematica === null && typeof notas.matematica === "number" && notas.matematica > 0) {
        maisRecentes.matematica = notas.matematica;
      }
      if (maisRecentes.natureza === null && typeof notas.natureza === "number" && notas.natureza > 0) {
        maisRecentes.natureza = notas.natureza;
      }
      if (maisRecentes.humanas === null && typeof notas.humanas === "number" && notas.humanas > 0) {
        maisRecentes.humanas = notas.humanas;
      }
      if (maisRecentes.linguagens === null && typeof notas.linguagens === "number" && notas.linguagens > 0) {
        maisRecentes.linguagens = notas.linguagens;
      }
    }

    let somaPonderada = 0;
    let somaPesos = 0;

    for (const [area, nota] of Object.entries(maisRecentes)) {
      if (typeof nota === "number" && nota > 0) {
        const peso = pesos[area] || 1;
        somaPonderada += nota * peso;
        somaPesos += peso;
      }
    }

    if (somaPesos === 0) {
      return (historico.reduce((acc, s) => acc + (s.notaPonderada || 0), 0) / historico.length).toFixed(1);
    }

    return (somaPonderada / somaPesos).toFixed(1);
  })();

  // Cálculo da nota mais alta (recorde TRI) por área do conhecimento
  const melhoresPorArea = (() => {
    const maxNotas = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
    const contagem = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };

    historico.forEach(s => {
      const notas = s.notasPorMateria || {};
      if (typeof notas.matematica === "number" && notas.matematica > 0) {
        if (notas.matematica > maxNotas.matematica) maxNotas.matematica = notas.matematica;
        contagem.matematica++;
      }
      if (typeof notas.natureza === "number" && notas.natureza > 0) {
        if (notas.natureza > maxNotas.natureza) maxNotas.natureza = notas.natureza;
        contagem.natureza++;
      }
      if (typeof notas.humanas === "number" && notas.humanas > 0) {
        if (notas.humanas > maxNotas.humanas) maxNotas.humanas = notas.humanas;
        contagem.humanas++;
      }
      if (typeof notas.linguagens === "number" && notas.linguagens > 0) {
        if (notas.linguagens > maxNotas.linguagens) maxNotas.linguagens = notas.linguagens;
        contagem.linguagens++;
      }
    });

    return {
      matematica: contagem.matematica ? maxNotas.matematica.toFixed(1) : null,
      natureza: contagem.natureza ? maxNotas.natureza.toFixed(1) : null,
      humanas: contagem.humanas ? maxNotas.humanas.toFixed(1) : null,
      linguagens: contagem.linguagens ? maxNotas.linguagens.toFixed(1) : null,
      contagem
    };
  })();

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Desempenho & TRI</h1>
        <p className={styles.subtitle}>
          Relatório de avaliações concluídas e estimativas de pontuação por área.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Exames Concluídos</div>
          <div className={styles.metricValue}>{totalSimulados}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Melhor Nota TRI Geral</div>
          <div className={`${styles.metricValue} ${styles.metricAccent}`}>{melhorNota}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Média Ponderada Global</div>
          <div className={styles.metricValue}>{mediaNotas}</div>
        </div>
      </div>

      {/* Melhores Notas por Área do Conhecimento (Recordes TRI) */}
      <div className={styles.areasSection}>
        <div className={styles.sectionTitleSmall}>
          Melhor Nota TRI por Área do Conhecimento (Recordes)
        </div>
        <div className={styles.areasGrid}>
          <div className={styles.areaCard}>
            <span className={styles.areaName}>Matemática</span>
            <div className={`${styles.areaScore} ${melhoresPorArea.matematica ? styles.areaScoreActive : ""}`}>
              {melhoresPorArea.matematica ? `${melhoresPorArea.matematica} pts` : "—"}
            </div>
            <span className={styles.areaCount}>
              {melhoresPorArea.contagem.matematica ? `Recorde em ${melhoresPorArea.contagem.matematica} prova(s)` : "Sem registros"}
            </span>
          </div>

          <div className={styles.areaCard}>
            <span className={styles.areaName}>Ciências da Natureza</span>
            <div className={`${styles.areaScore} ${melhoresPorArea.natureza ? styles.areaScoreActive : ""}`}>
              {melhoresPorArea.natureza ? `${melhoresPorArea.natureza} pts` : "—"}
            </div>
            <span className={styles.areaCount}>
              {melhoresPorArea.contagem.natureza ? `Recorde em ${melhoresPorArea.contagem.natureza} prova(s)` : "Sem registros"}
            </span>
          </div>

          <div className={styles.areaCard}>
            <span className={styles.areaName}>Ciências Humanas</span>
            <div className={`${styles.areaScore} ${melhoresPorArea.humanas ? styles.areaScoreActive : ""}`}>
              {melhoresPorArea.humanas ? `${melhoresPorArea.humanas} pts` : "—"}
            </div>
            <span className={styles.areaCount}>
              {melhoresPorArea.contagem.humanas ? `Recorde em ${melhoresPorArea.contagem.humanas} prova(s)` : "Sem registros"}
            </span>
          </div>

          <div className={styles.areaCard}>
            <span className={styles.areaName}>Linguagens e Códigos</span>
            <div className={`${styles.areaScore} ${melhoresPorArea.linguagens ? styles.areaScoreActive : ""}`}>
              {melhoresPorArea.linguagens ? `${melhoresPorArea.linguagens} pts` : "—"}
            </div>
            <span className={styles.areaCount}>
              {melhoresPorArea.contagem.linguagens ? `Recorde em ${melhoresPorArea.contagem.linguagens} prova(s)` : "Sem registros"}
            </span>
          </div>
        </div>
      </div>

      {/* AI Holistic History Analysis Section */}
      <div className={styles.aiSection}>
        <div className={styles.aiHeader}>
          <div className={styles.aiTitleRow}>
            <span className={styles.aiBadge}>Mentoria Estratégica</span>
            <h2 className={styles.aiTitle}>Diagnóstico Geral do Histórico</h2>
          </div>

          <button
            onClick={handleGerarAnaliseIA}
            disabled={carregandoIA || totalSimulados === 0}
            className={styles.aiGenerateBtn}
          >
            {carregandoIA ? "Analisando histórico..." : analiseIA ? "Atualizar Diagnóstico" : "Gerar Análise do Histórico"}
          </button>
        </div>

        {erroIA && (
          <div style={{ color: "#b91c1c", fontSize: "0.85rem", padding: "0.5rem 0" }}>{erroIA}</div>
        )}

        {analiseIA ? (
          <div className={styles.aiBody}>
            {analiseIA}
          </div>
        ) : (
          <p className={styles.aiPlaceholder}>
            {totalSimulados === 0 
              ? "Complete simulados para que a IA possa analisar suas curvas de acertos em relação aos pesos do seu curso alvo."
              : "Clique no botão acima para que o Gemini analise todos os seus simulados concluídos e aponte as matérias com maior potencial de alavancagem para a sua aprovação."}
          </p>
        )}
      </div>

      {/* Table Section */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Registros Anteriores</h2>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#71717a", fontSize: "0.88rem" }}>
            Carregando registros...
          </div>
        ) : erro ? (
          <div style={{ padding: "2rem", color: "#dc2626", fontSize: "0.88rem" }}>{erro}</div>
        ) : historico.length === 0 ? (
          <div className={styles.emptyState}>
            <FiInbox size={28} color="#a1a1aa" />
            <h3 className={styles.emptyTitle}>Nenhum registro encontrado</h3>
            <p className={styles.emptyDesc}>Conclua sua primeira edição para visualizar o histórico de notas.</p>
            <Link to="/simulados" className={styles.newSimBtn}>
              Realizar Simulado <FiArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {historico.map((sim, idx) => {
              const id = sim._id || idx;
              const isFeedbackOpen = openFeedbackId === id;

              return (
                <div key={id} className={styles.rowItem}>
                  <div className={styles.rowHeader}>
                    <div className={styles.rowMeta}>
                      <span className={styles.badgeType}>
                        {sim.tipo === "completo" ? "ENEM" : sim.tipo}
                      </span>
                      <span className={styles.rowDate}>
                        {new Date(sim.createdAt).toLocaleDateString("pt-BR", { 
                          day: "2-digit", 
                          month: "short", 
                          year: "numeric", 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </span>
                    </div>

                    <div className={styles.scoreBlock}>
                      <span className={styles.scoreLabel}>TRI Ponderada:</span>
                      <span className={styles.scoreNum}>{(sim.notaPonderada || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Notas TRI e Acertos por Matéria */}
                  <div className={styles.disciplinePills}>
                    {sim.notasPorMateria?.matematica ? (
                      <span className={styles.pill}>
                        Matemática: <strong>{sim.notasPorMateria.matematica.toFixed(1)} pts</strong> ({sim.acertos?.matematica || 0}/45 acertos)
                      </span>
                    ) : null}

                    {sim.notasPorMateria?.natureza ? (
                      <span className={styles.pill}>
                        Natureza: <strong>{sim.notasPorMateria.natureza.toFixed(1)} pts</strong> ({sim.acertos?.natureza || 0}/45 acertos)
                      </span>
                    ) : null}

                    {sim.notasPorMateria?.humanas ? (
                      <span className={styles.pill}>
                        Humanas: <strong>{sim.notasPorMateria.humanas.toFixed(1)} pts</strong> ({sim.acertos?.humanas || 0}/45 acertos)
                      </span>
                    ) : null}

                    {sim.notasPorMateria?.linguagens ? (
                      <span className={styles.pill}>
                        Linguagens: <strong>{sim.notasPorMateria.linguagens.toFixed(1)} pts</strong> ({sim.acertos?.linguagens || 0}/45 acertos)
                      </span>
                    ) : null}

                    {sim.feedbackIA && (
                      <button 
                        onClick={() => toggleFeedback(id)}
                        style={{ background: "transparent", border: "none", color: "#7c3aed", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.5rem" }}
                      >
                        <FiFileText size={12} />
                        {isFeedbackOpen ? "Ocultar análise" : "Ver parecer pedagógico"}
                        {isFeedbackOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Feedback Drawer */}
                  {sim.feedbackIA && isFeedbackOpen && (
                    <div className={styles.feedbackDrawer}>
                      <div className={styles.feedbackTitle}>
                        Parecer Diagnóstico
                      </div>
                      <p className={styles.feedbackText}>{sim.feedbackIA}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
