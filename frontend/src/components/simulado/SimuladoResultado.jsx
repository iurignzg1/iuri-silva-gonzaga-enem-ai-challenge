import styles from "../../pages/Simulados.module.css";

const NOMES_AREAS = {
  matematica: "Matemática",
  natureza: "Ciências da Natureza",
  humanas: "Ciências Humanas",
  linguagens: "Linguagens e Códigos"
};

const SimuladoResultado = ({ resultado, onReiniciar }) => {
  if (!resultado) return null;

  return (
    <div className={styles.resultCard}>
      <h2 className={styles.resultTitle}>Avaliação Concluída</h2>
      <p className={styles.resultSubtitle}>
        Sua folha de respostas foi computada com base nas curvas TRI.
      </p>

      <div className={styles.scoreBanner}>
        <div className={styles.scoreMeta}>Nota TRI Ponderada Geral</div>
        <div className={styles.scoreValue}>
          {(resultado.notaPonderada || 0).toFixed(1)}
        </div>
        <div className={styles.scoreTotal}>
          Total de acertos no exame: <strong>{resultado.totalAcertos}</strong> de {resultado.totalQuestoes} questões
        </div>
      </div>

      {resultado.notasPorMateria && (
        <div className={styles.areaScoresGrid}>
          {Object.entries(resultado.notasPorMateria).map(([area, nota]) => {
            const acertos = resultado.acertosPorMateria?.[area] || 0;
            return (
              <div key={area} className={styles.areaScoreItem}>
                <span className={styles.areaScoreLabel}>{NOMES_AREAS[area] || area}</span>
                <div className={styles.areaScoreValue}>{nota ? nota.toFixed(1) : "—"}</div>
                <span className={styles.areaScoreAcertos}>{acertos} de 45 acertos</span>
              </div>
            );
          })}
        </div>
      )}

      {resultado.feedbackIA && (
        <div className={styles.feedbackBox}>
          <div className={styles.feedbackHeader}>Síntese Pedagógica</div>
          <p className={styles.feedbackBody}>{resultado.feedbackIA}</p>
        </div>
      )}

      <button 
        onClick={onReiniciar}
        className={styles.startExamBtn}
        style={{ width: "100%" }}
      >
        Configurar Nova Prova
      </button>
    </div>
  );
};

export default SimuladoResultado;
