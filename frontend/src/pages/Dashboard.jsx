import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL, getAuthHeaders } from "../services/api";
import styles from "./Dashboard.module.css";
import { FiInbox, FiArrowRight, FiFileText, FiChevronDown, FiChevronUp } from "react-icons/fi";

const Dashboard = () => {
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
  const mediaNotas = historico.length > 0
    ? (historico.reduce((acc, s) => acc + (s.notaPonderada || 0), 0) / historico.length).toFixed(1)
    : "—";

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
          <div className={styles.metricLabel}>Melhor Nota TRI</div>
          <div className={`${styles.metricValue} ${styles.metricAccent}`}>{melhorNota}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Média Ponderada</div>
          <div className={styles.metricValue}>{mediaNotas}</div>
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

                  {/* Pills de acertos */}
                  <div className={styles.disciplinePills}>
                    <span className={styles.pill}>
                      Matemática: <strong>{sim.acertos?.matematica || 0}</strong>
                    </span>
                    <span className={styles.pill}>
                      Natureza: <strong>{sim.acertos?.natureza || 0}</strong>
                    </span>
                    <span className={styles.pill}>
                      Humanas: <strong>{sim.acertos?.humanas || 0}</strong>
                    </span>
                    <span className={styles.pill}>
                      Linguagens: <strong>{sim.acertos?.linguagens || 0}</strong>
                    </span>

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
