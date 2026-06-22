import { useAuth } from "../../context/AuthContext";
import styles from "./RequireRole.module.css";

export default function RequireRole({ roles = ["admin"], children }) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return (
      <div className={styles.denied}>
        <div className={styles.icon}>
          <i className="fa-solid fa-lock"></i>
        </div>
        <div className={styles.title}>Access Denied</div>
        <div className={styles.message}>
          You do not have the required permissions to view this page.
          Please contact an administrator.
        </div>
      </div>
    );
  }

  return children;
}
