import { Link } from "react-router-dom";
import { FiInbox, FiArrowRight, FiFileText, FiChevronDown, FiChevronUp } from "react-icons/fi";
import styles from "../../pages/Dashboard.module.css";

const HistoricoList = ({
  historico,
  loading,
  erro,
  openFeedbackId,
  onToggleFeedback
}) => {
  return (
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
                      onClick={() => onToggleFeedback(id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.2rem 0.5rem"
                      }}
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
  );
};

export default HistoricoList;
