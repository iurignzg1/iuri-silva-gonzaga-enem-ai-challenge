import styles from "../../pages/Profile.module.css";

const AREAS_PESOS = [
  { key: "matematica", label: "Matemática" },
  { key: "natureza", label: "Natureza" },
  { key: "humanas", label: "Humanas" },
  { key: "linguagens", label: "Linguagens" },
  { key: "redacao", label: "Redação" }
];

const MatrizPesos = ({ pesos, onChangePeso }) => {
  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.sectionTitle}>Matriz de Pesos (1 a 5)</h2>
      <p className={styles.sectionHint}>
        Usados para calcular a média ponderada TRI das suas avaliações simuladas.
      </p>

      <div className={styles.weightsGrid}>
        {AREAS_PESOS.map(({ key, label }) => (
          <div key={key} className={styles.weightCard}>
            <span className={styles.weightLabel}>{label}</span>
            <input
              type="number"
              min="1"
              max="5"
              value={pesos[key] || 1}
              onChange={(e) => onChangePeso(key, Number(e.target.value))}
              className={styles.weightInput}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatrizPesos;
