import styles from "../../pages/Dashboard.module.css";

const RecordesPorArea = ({ melhoresPorArea }) => {
  return (
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
  );
};

export default RecordesPorArea;
