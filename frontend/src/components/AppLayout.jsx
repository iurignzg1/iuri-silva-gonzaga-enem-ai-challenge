import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import styles from "./AppLayout.module.css";

const AppLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
