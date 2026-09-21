import catalogoCursos from "../../config/cursos.json";
import catalogoInstituicoes from "../../config/instituicoes.json";
import styles from "../../pages/Profile.module.css";

const MetasAprovacao = ({ cursoAlvo, setCursoAlvo, faculdadeAlvo, setFaculdadeAlvo }) => {
  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.sectionTitle}>Metas de Aprovação</h2>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Curso Alvo</label>
          <select
            value={cursoAlvo}
            onChange={(e) => setCursoAlvo(e.target.value)}
            className={styles.input}
          >
            {catalogoCursos.map((grupo) => (
              <optgroup key={grupo.area} label={grupo.area}>
                {grupo.cursos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            ))}
            {cursoAlvo &&
              !catalogoCursos.some((g) => g.cursos.includes(cursoAlvo)) && (
                <option value={cursoAlvo}>{cursoAlvo} (Personalizado)</option>
              )}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Instituição Alvo</label>
          <select
            value={faculdadeAlvo}
            onChange={(e) => setFaculdadeAlvo(e.target.value)}
            className={styles.input}
          >
            {catalogoInstituicoes.map((regiao) => (
              <optgroup key={regiao.regiao} label={regiao.regiao}>
                {regiao.instituicoes.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </optgroup>
            ))}
            {faculdadeAlvo &&
              !catalogoInstituicoes.some((r) => r.instituicoes.includes(faculdadeAlvo)) && (
                <option value={faculdadeAlvo}>{faculdadeAlvo} (Personalizado)</option>
              )}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MetasAprovacao;
