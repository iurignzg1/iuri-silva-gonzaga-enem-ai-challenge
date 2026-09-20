import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import useAuth from "../hooks/useAuth";
import { FiArrowRight } from "react-icons/fi";
import logoWhite from "../assets/HyperTask/Ativo 3.svg";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <img src={logoWhite} alt="HyperTask" className={styles.logoImg} />
        </Link>

        <div className={styles.actions}>
          <Link to="/" className={styles.menuItem}>
            Início
          </Link>

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