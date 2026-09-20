import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import useAuth from "../hooks/useAuth";
import { 
  FiHome, 
  FiCheckSquare, 
  FiBarChart2, 
  FiSliders, 
  FiLogOut,
  FiCompass,
  FiChevronsLeft,
  FiChevronsRight
} from "react-icons/fi";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

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
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Toggle Button */}
      <button
        className={styles.toggleBtn}
        onClick={() => setCollapsed((prev) => !prev)}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <FiChevronsRight size={16} /> : <FiChevronsLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className={styles.navigation}>
        <span className={styles.navHeader}>Plataforma</span>
        
        <NavLink 
          to="/home" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
          title={collapsed ? "Início" : undefined}
        >
          <FiHome className={styles.navIcon} />
          <span className={styles.navLabel}>Início</span>
        </NavLink>

        <NavLink 
          to="/simulados" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
          title={collapsed ? "Simulados ENEM" : undefined}
        >
          <FiCheckSquare className={styles.navIcon} />
          <span className={styles.navLabel}>Simulados ENEM</span>
        </NavLink>

        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
          title={collapsed ? "Desempenho & TRI" : undefined}
        >
          <FiBarChart2 className={styles.navIcon} />
          <span className={styles.navLabel}>Desempenho & TRI</span>
        </NavLink>

        <span className={styles.navHeader}>Preferências</span>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ""}`}
          title={collapsed ? "Pesos & Metas SISU" : undefined}
        >
          <FiSliders className={styles.navIcon} />
          <span className={styles.navLabel}>Pesos & Metas SISU</span>
        </NavLink>
      </nav>

      {/* Target Goal Meta Pill */}
      {!collapsed && user?.cursoAlvo && user.cursoAlvo !== "Não definido" && (
        <div className={styles.targetPill}>
          <div className={styles.targetIndicator}>
            <FiCompass size={13} />
            <span>Foco</span>
          </div>
          <div className={styles.targetCourse}>{user.cursoAlvo}</div>
          <div className={styles.targetUni}>{user.faculdadeAlvo || "SISU"}</div>
        </div>
      )}

      {/* Bottom area: user section */}
      <div className={styles.bottomArea}>
        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userProfile}>
            <div
              className={styles.avatar}
              title={collapsed ? (user?.nome || "Aluno") : undefined}
            >
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
      </div>
    </aside>
  );
};

export default Sidebar;
