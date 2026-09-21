import styles from "../../pages/Dashboard.module.css";

const DiagnosticoIA = ({
  analiseIA,
  carregandoIA,
  erroIA,
  totalSimulados,
  onGerarAnalise
}) => {
  return (
    <div className={styles.aiSection}>
      <div className={styles.aiHeader}>
        <div className={styles.aiTitleRow}>
          <span className={styles.aiBadge}>Mentoria Estratégica</span>
          <h2 className={styles.aiTitle}>Diagnóstico Geral do Histórico</h2>
        </div>

        <button
          onClick={onGerarAnalise}
          disabled={carregandoIA || totalSimulados === 0}
          className={styles.aiGenerateBtn}
        >
          {carregandoIA
            ? "Analisando histórico..."
            : analiseIA
            ? "Atualizar Diagnóstico"
            : "Gerar Análise do Histórico"}
        </button>
      </div>

      {erroIA && (
        <div style={{ color: "#b91c1c", fontSize: "0.85rem", padding: "0.5rem 0" }}>
          {erroIA}
        </div>
      )}

      {analiseIA ? (
        <div className={styles.aiBody}>{analiseIA}</div>
      ) : (
        <p className={styles.aiPlaceholder}>
          {totalSimulados === 0
            ? "Complete simulados para que a IA possa analisar suas curvas de acertos em relação aos pesos do seu curso alvo."
            : "Clique no botão acima para que o Gemini analise todos os seus simulados concluídos e aponte as matérias com maior potencial de alavancagem para a sua aprovação."}
        </p>
      )}
    </div>
  );
};

export default DiagnosticoIA;
