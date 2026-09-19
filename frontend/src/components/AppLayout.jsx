import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppNavbar from "./AppNavbar";
import styles from "./AppLayout.module.css";

const AppLayout = () => {
  return (
    <div className={styles.layout}>
      <AppNavbar />
      <div className={styles.bodyContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
