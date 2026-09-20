import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";
import styles from "./ThemeToggle.module.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.btn}
      onClick={toggleTheme}
      title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
    </button>
  );
};

export default ThemeToggle;
