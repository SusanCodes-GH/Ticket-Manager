import styles from "./AuthForm.module.css";

export default function AuthForm({
  title,
  subtitle,
  error,
  children,
  onSubmit,
  submitLabel,
  loading,
  footer,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {error && (
        <div className={styles.error}>
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={onSubmit}>
        {children}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
          {submitLabel || "Submit"}
        </button>
      </form>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
