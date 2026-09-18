import { Link } from "react-router-dom";
import styles from "./PaginaInicial.module.css";
import useAuth from "../hooks/useAuth";
import { FiArrowRight, FiCheck, FiSliders, FiActivity, FiLayers } from "react-icons/fi";

const PaginaInicial = () => {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.tag}>
          <span>Exames Oficiais ENEM &bull; Calibração TRI</span>
        </div>

        <h1 className={styles.headline}>
          Simulações de alta fidelidade para candidatos ao ENEM.
        </h1>

        <p className={styles.subheadline}>
          Acesse o banco de questões históricas do ENEM, avalie seu rendimento com pesos 
          reais do SISU e receba diagnósticos objetivos dos seus pontos de atenção.
        </p>

        <div className={styles.heroCta}>
          {user ? (
            <Link to="/home" className={styles.primaryButton}>
              Continuar Estudos <FiArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/register" className={styles.primaryButton}>
                Criar conta gratuita <FiArrowRight size={15} />
              </Link>
              <Link to="/login" className={styles.secondaryButton}>
                Acessar plataforma
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Grid de Especificações */}
      <section className={styles.specsSection}>
        <div className={styles.specsGrid}>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>
              <FiSliders size={18} />
            </div>
            <h3 className={styles.specTitle}>Ponderação SISU Real</h3>
            <p className={styles.specDesc}>
              Insira os pesos do curso e universidade almejada. O cálculo da sua média é ajustado conforme o edital da sua meta.
            </p>
          </div>

          <div className={styles.specCard}>
            <div className={styles.specIcon}>
              <FiActivity size={18} />
            </div>
            <h3 className={styles.specTitle}>Metodologia TRI</h3>
            <p className={styles.specDesc}>
              Estimativa de proficiência baseada na Teoria de Resposta ao Item para cada uma das quatro áreas de conhecimento.
            </p>
          </div>

          <div className={styles.specCard}>
            <div className={styles.specIcon}>
              <FiLayers size={18} />
            </div>
            <h3 className={styles.specTitle}>Diagnósticos Pedagógicos</h3>
            <p className={styles.specDesc}>
              Síntese contextualizada de acertos e lacunas conceituais gerada ao término de cada edição simulada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaginaInicial;