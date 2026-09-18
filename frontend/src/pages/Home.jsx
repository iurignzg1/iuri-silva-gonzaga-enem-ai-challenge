import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "./Home.module.css";
import { FiCheckSquare, FiBarChart2, FiArrowRight, FiSliders } from "react-icons/fi";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>
            Visão Geral
          </h1>
          <p className={styles.subtitle}>
            Bem-vindo, {user?.nome || "Estudante"}. Acompanhe seu progresso e inicie novos simulados.
          </p>
        </div>
      </div>

      {/* Target Card */}
      <div className={styles.targetCard}>
        <div className={styles.targetInfo}>
          <span className={styles.targetLabel}>Objetivo SISU</span>
          <div className={styles.targetValues}>
            {user?.cursoAlvo && user.cursoAlvo !== "Não definido" ? user.cursoAlvo : "Curso não definido"} 
            <span className={styles.targetUni}>
              {" — "}{user?.faculdadeAlvo && user.faculdadeAlvo !== "Não definida" ? user.faculdadeAlvo : "Faculdade não definida"}
            </span>
          </div>
        </div>

        <Link to="/profile" className={styles.targetEditLink}>
          Editar metas e pesos
        </Link>
      </div>

      {/* Action Panels */}
      <div className={styles.gridActions}>
        <div className={styles.actionCard}>
          <div>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}>
                <FiCheckSquare size={16} />
              </div>
              <h3 className={styles.cardTitle}>Simulados Oficiais</h3>
            </div>
            <p className={styles.cardDesc}>
              Resolva provas completas do ENEM por dia de exame. As respostas são processadas com modelo TRI e análise pedagógica.
            </p>
          </div>

          <Link to="/simulados" className={styles.primaryActionBtn}>
            Novo Simulado <FiArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.actionCard}>
          <div>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}>
                <FiBarChart2 size={16} />
              </div>
              <h3 className={styles.cardTitle}>Histórico de Desempenho</h3>
            </div>
            <p className={styles.cardDesc}>
              Visualize o relatório de notas ponderadas por disciplina, evolução temporal e pareceres analíticos detalhados.
            </p>
          </div>

          <Link to="/dashboard" className={styles.secondaryActionBtn}>
            Ver Desempenho <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
