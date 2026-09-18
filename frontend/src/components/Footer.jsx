import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandLine}>
          <span className={styles.appName}>HyperTask</span>
          <span className={styles.divider}>&bull;</span>
          <span className={styles.compName}>HyperFlow Global</span>
        </div>
        <p className={styles.copy}>
          Plataforma de preparação e análise de proficiência para o Exame Nacional do Ensino Médio.
        </p>
      </div>
    </footer>
  );
};

export default Footer;