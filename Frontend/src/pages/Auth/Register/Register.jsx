import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "../../../utils/toast";
import AuthForm from "../../../components/AuthForm/AuthForm";
import styles from "./Register.module.css";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = form;

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        department: "IT",
      });
      toast.success("Account created! Please sign in.");
      navigate("/login", { replace: true });
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
          <h1 className={styles.brandTitle}>Get Started</h1>
          <p className={styles.brandText}>
            Create your admin account and start managing your support workflow in
            minutes.
          </p>
          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className={styles.infoText}>
                Admin account creation only
              </span>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <span className={styles.infoText}>
                Create team member accounts later
              </span>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-lock"></i>
              </div>
              <span className={styles.infoText}>
                Secure authentication ready
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <AuthForm
          title="Create Admin Account"
          subtitle="Register to set up your ticket management system"
          error={null}
          onSubmit={handleSubmit}
          submitLabel="Create Admin Account"
          loading={loading}
          footer={
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--primary-color)",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Link>
            </>
          }
        >
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange("name")}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Company Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your company name"
              value={form.company}
              onChange={handleChange("company")}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange("email")}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Create a password (min 6 chars)"
              value={form.password}
              onChange={handleChange("password")}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
            />
          </div>
        </AuthForm>
      </div>
    </div>
  );
}
