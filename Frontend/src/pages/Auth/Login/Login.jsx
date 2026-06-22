import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "../../../utils/toast";
import AuthForm from "../../../components/AuthForm/AuthForm";
import styles from "./Login.module.css";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brandSide}>
        <div className={styles.brandContent}>
          <div className={styles.logoIcon}>
            <i className="fa-solid fa-ticket"></i>
          </div>
          <h1 className={styles.brandTitle}>Ticket Manager</h1>
          <p className={styles.brandText}>
            Streamline your support workflow. Track, manage, and resolve tickets
            efficiently with your team.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-gauge-high"></i>
              </div>
              <span className={styles.featureText}>
                Real-time ticket tracking dashboard
              </span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-users"></i>
              </div>
              <span className={styles.featureText}>
                Team collaboration and assignment
              </span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <span className={styles.featureText}>
                Reports and analytics
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <AuthForm
          title="Welcome Back"
          subtitle="Sign in to your account to continue"
          error={null}
          onSubmit={handleSubmit}
          submitLabel="Sign In"
          loading={loading}
          footer={
            <>
              Don't have an account?{" "}
              <Link to="/register" className="footerLink" style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                Register
              </Link>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange("email")}
              style={{
                padding: "11px 14px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 14,
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={undefined}
              onBlur={undefined}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange("password")}
              style={{
                padding: "11px 14px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 14,
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={undefined}
              onBlur={undefined}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: "var(--primary-color)" }}
              />
              Remember me
            </label>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                fontSize: 13,
                color: "var(--primary-color)",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Forgot password?
            </button>
          </div>
        </AuthForm>
      </div>
    </div>
  );
}
