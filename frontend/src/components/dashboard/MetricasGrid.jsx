import styles from "../../pages/Dashboard.module.css";

const MetricasGrid = ({ totalSimulados, melhorNota, mediaNotas }) => {
  return (
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Exames Concluídos</div>
        <div className={styles.metricValue}>{totalSimulados}</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Melhor Nota TRI Geral</div>
        <div className={`${styles.metricValue} ${styles.metricAccent}`}>
          {melhorNota}
        </div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Média Ponderada Global</div>
        <div className={styles.metricValue}>{mediaNotas}</div>
      </div>
    </div>
  );
};

export default MetricasGrid;
