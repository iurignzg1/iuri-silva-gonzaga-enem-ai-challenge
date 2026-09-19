import { Link } from "react-router-dom";
import styles from "./AppNavbar.module.css";

const AppNavbar = () => {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/home" className={styles.brand}>
          <div className={styles.logoMark}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>HyperTask</span>
            <span className={styles.badgeCompany}>HyperFlow Global</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AppNavbar;
