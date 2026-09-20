import { Link } from "react-router-dom";
import styles from "./AppNavbar.module.css";
import logoWhite from "../assets/HyperTask/Ativo 3.svg";

const AppNavbar = () => {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/home" className={styles.brand}>
          <img src={logoWhite} alt="HyperTask" className={styles.logoImg} />
        </Link>
      </div>
    </header>
  );
};

export default AppNavbar;
