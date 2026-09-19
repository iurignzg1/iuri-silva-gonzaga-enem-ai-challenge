import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import useAuth from "../hooks/useAuth";
import { 
  FiHome, 
  FiCheckSquare, 
  FiBarChart2, 
  FiSliders, 
  FiLogOut,
  FiCompass
} from "react-icons/fi";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside className={styles.sidebar}>
      {/* Navigation */}
      <nav className={styles.navigation}>
        <span className={styles.navHeader}>Plataforma</span>
        
        <NavLink 
          to="/home" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
        >
          <FiHome className={styles.navIcon} />
          <span>Início</span>
        </NavLink>

        <NavLink 
          to="/simulados" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
        >
          <FiCheckSquare className={styles.navIcon} />
          <span>Simulados ENEM</span>
        </NavLink>

        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
        >
          <FiBarChart2 className={styles.navIcon} />
          <span>Desempenho & TRI</span>
        </NavLink>

        <span className={styles.navHeader}>Preferências</span>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
        >
          <FiSliders className={styles.navIcon} />
          <span>Pesos & Metas SISU</span>
        </NavLink>
      </nav>

      {/* Target Goal Meta Pill */}
      {user?.cursoAlvo && user.cursoAlvo !== "Não definido" && (
        <div className={styles.targetPill}>
          <div className={styles.targetIndicator}>
            <FiCompass size={13} />
            <span>Foco</span>
          </div>
          <div className={styles.targetCourse}>{user.cursoAlvo}</div>
          <div className={styles.targetUni}>{user.faculdadeAlvo || "SISU"}</div>
        </div>
      )}

      {/* User Section */}
      <div className={styles.userSection}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {getInitials(user?.nome)}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user?.nome || "Aluno"}</span>
            <span className={styles.userEmail}>{user?.email || "aluno@hyperflow.com"}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className={styles.logoutBtn}
          title="Encerrar sessão"
          aria-label="Encerrar sessão"
        >
          <FiLogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
