import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { API_URL, getAuthHeaders } from "../services/api";
import catalogoCursos from "../config/cursos.json";
import catalogoInstituicoes from "../config/instituicoes.json";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [nome, setNome] = useState(user?.nome || "");
  const [cursoAlvo, setCursoAlvo] = useState(user?.cursoAlvo || "");
  const [faculdadeAlvo, setFaculdadeAlvo] = useState(user?.faculdadeAlvo || "");
  const [pesos, setPesos] = useState(user?.pesos || {
    matematica: 1,
    natureza: 1,
    humanas: 1,
    linguagens: 1,
    redacao: 1
  });

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok && data) {
          setNome(data.nome || "");
          setCursoAlvo(data.cursoAlvo || "");
          setFaculdadeAlvo(data.faculdadeAlvo || "");
          if (data.pesos) setPesos(data.pesos);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome,
          cursoAlvo,
          faculdadeAlvo,
          pesos
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Erro ao salvar perfil.");

      updateUser({
        nome: data.nome,
        cursoAlvo: data.cursoAlvo,
        faculdadeAlvo: data.faculdadeAlvo,
        pesos: data.pesos
      });

      setMensagem("Configurações atualizadas com sucesso.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Pesos & Metas SISU</h1>
        <p className={styles.subtitle}>
          Configure seus objetivos acadêmicos e a matriz de pesos da sua faculdade.
        </p>
      </div>

      {mensagem && <div className={styles.successBanner}>{mensagem}</div>}
      {erro && <div className={styles.errorBanner}>{erro}</div>}

      <form onSubmit={handleSalvar} className={styles.formCard}>
        {/* Identificação */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}>Identificação</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Nome Completo</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>E-mail</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className={`${styles.input} ${styles.inputDisabled}`}
              />
            </div>
          </div>
        </div>

        {/* Metas */}
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

        {/* Pesos */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}>Matriz de Pesos (1 a 5)</h2>
          <p className={styles.sectionHint}>
            Usados para calcular a média ponderada TRI das suas avaliações simuladas.
          </p>

          <div className={styles.weightsGrid}>
            {[
              { key: "matematica", label: "Matemática" },
              { key: "natureza", label: "Natureza" },
              { key: "humanas", label: "Humanas" },
              { key: "linguagens", label: "Linguagens" },
              { key: "redacao", label: "Redação" }
            ].map(({ key, label }) => (
              <div key={key} className={styles.weightCard}>
                <span className={styles.weightLabel}>{label}</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={pesos[key] || 1}
                  onChange={(e) => setPesos({ ...pesos, [key]: Number(e.target.value) })}
                  className={styles.weightInput}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
