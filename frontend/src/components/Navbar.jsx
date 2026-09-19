import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import useAuth from "../hooks/useAuth";
import { FiArrowRight } from "react-icons/fi";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>HyperTask</span>
            <span className={styles.badgeCompany}>HyperFlow Global</span>
          </div>
        </Link>

        <nav className={styles.navMenu}>
          <Link to="/" className={styles.menuItem}>Início</Link>
          <a href="#simulados" className={styles.menuItem}>Simulados</a>
          <a href="#metodologia" className={styles.menuItem}>Metodologia TRI</a>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <Link to="/home" className={styles.btnPrimary}>
              Painel do Aluno <FiArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.btnGhost}>
                Entrar
              </Link>
              <Link to="/register" className={styles.btnPrimary}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;