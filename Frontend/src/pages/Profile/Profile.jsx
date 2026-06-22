import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/userService";
import { toast } from "../../utils/toast";
import PasswordResetModal from "../../components/PasswordResetModal/PasswordResetModal";
import styles from "./Profile.module.css";

const avatarColors = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
];

function getColorFromId(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(ts) {
  if (!ts) return "—";
  if (typeof ts === "string") return ts.split("T")[0];
  if (ts?.toDate) return ts.toDate().toLocaleDateString();
  if (ts?._seconds) return new Date(ts._seconds * 1000).toLocaleDateString();
  return "—";
}

export default function Profile() {
  const { user, updateCurrentUser } = useAuth();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDepartment(user.department || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim(), department });
      updateCurrentUser({ name: updated.name, department: updated.department });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageSubtitle}>Manage your account information</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.avatarSection}>
          <div
            className={styles.avatar}
            style={{ background: getColorFromId(user.id) }}
          >
            {getInitials(user.name)}
          </div>
          <div className={styles.avatarInfo}>
            <div className={styles.avatarName}>{user.name}</div>
            <div className={styles.avatarRole}>{user.role}</div>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={`${styles.formInput} ${styles.inputReadonly}`}
                value={user.email || ""}
                readOnly
                tabIndex={-1}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.inputReadonly}`}
                value={user.role || ""}
                readOnly
                tabIndex={-1}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Department</label>
              <select
                className={styles.formSelect}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Account Status</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.inputReadonly}`}
                value={user.status || "Active"}
                readOnly
                tabIndex={-1}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Created Date</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.inputReadonly}`}
                value={formatDate(user.createdAt)}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
              ) : (
                "Update Profile"
              )}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setResetOpen(true)}
            >
              <i className="fa-solid fa-lock"></i>
              Change Password
            </button>
          </div>
        </form>
      </div>

      {resetOpen && (
        <PasswordResetModal
          email={user?.email || ""}
          onClose={() => setResetOpen(false)}
        />
      )}
    </div>
  );
}
