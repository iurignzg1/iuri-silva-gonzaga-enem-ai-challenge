import styles from "../../pages/Simulados.module.css";

const ANOS_DISPONIVEIS = [2023, 2022, 2021, 2020, 2019, 2018, 2017];

const SimuladoConfig = ({
  dia,
  setDia,
  ano,
  setAno,
  lingua,
  setLingua,
  carregando,
  erro,
  onIniciar
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Simulados ENEM</h1>
        <p className={styles.subtitle}>
          Selecione uma edição histórica oficial para resolução cronometrada.
        </p>
      </div>

      {erro && (
        <div style={{
          padding: "0.85rem 1rem",
          background: "#fef2f2",
          border: "1px solid #fee2e2",
          color: "#b91c1c",
          borderRadius: "8px",
          fontSize: "0.85rem",
          marginBottom: "1.5rem"
        }}>
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
            {ANOS_DISPONIVEIS.map(a => (
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
          onClick={onIniciar}
          disabled={carregando}
          className={styles.startExamBtn}
        >
          {carregando ? "Carregando Caderno..." : "Iniciar Simulado"}
        </button>
      </div>
    </div>
  );
};

export default SimuladoConfig;
