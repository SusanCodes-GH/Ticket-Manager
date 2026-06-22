import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Sidebar.module.css";

const allNavItems = [
  { path: "/", icon: "fa-solid fa-gauge-high", label: "Dashboard", roles: ["admin", "team"] },
  { path: "/tickets", icon: "fa-solid fa-ticket", label: "Tickets", roles: ["admin", "team"] },
  { path: "/reports", icon: "fa-solid fa-chart-simple", label: "Reports", roles: ["admin"] },
  { path: "/users", icon: "fa-solid fa-users", label: "Users", roles: ["admin"] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { hasRole } = useAuth();

  const navItems = useMemo(
    () => allNavItems.filter((item) => hasRole(...item.roles)),
    [hasRole]
  );

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <i className={`fa-solid fa-ticket ${styles.logoIcon}`} onClick={onToggle}></i>
          <span className={styles.logoText}>TicketMgr</span>
        </div>
        <button className={styles.toggleBtn} onClick={onToggle}>
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <i className={`${item.icon} ${styles.navIcon}`}></i>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerText}>Ticket Manager v1.0</span>
      </div>
    </aside>
  );
}
