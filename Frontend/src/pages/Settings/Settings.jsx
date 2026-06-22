import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getSettings, updateSettings, updateProfile } from "../../services/userService";
import { toast } from "../../utils/toast";
import PasswordResetModal from "../../components/PasswordResetModal/PasswordResetModal";
import styles from "./Settings.module.css";

export default function Settings() {
  const { user, updateCurrentUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name || "");
    setDepartment(user.department || "");
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      if (data.emailNotifications !== undefined) setEmailNotifications(data.emailNotifications);
      if (data.inAppNotifications !== undefined) setInAppNotifications(data.inAppNotifications);
    } catch {
      // Defaults used
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ name: displayName.trim(), department });
      updateCurrentUser({ name: updated.name, department: updated.department });
      toast.success("Account preferences saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateSettings({ emailNotifications, inAppNotifications });
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTheme = (value) => {
    setTheme(value);
    toast.success("Theme preference saved");
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your preferences and account settings</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <i className="fa-solid fa-spinner fa-spin"></i> Loading settings...
        </div>
      ) : (
        <div className={styles.sections}>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fa-solid fa-user-gear"></i>
              <div>
                <h2 className={styles.sectionTitle}>Account Preferences</h2>
                <p className={styles.sectionDesc}>Update your display name and department</p>
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.fieldRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Display Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
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
              </div>
              <button
                className={styles.saveBtn}
                onClick={handleSaveAccount}
                disabled={saving || !displayName.trim()}
              >
                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
                Save Changes
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fa-solid fa-bell"></i>
              <div>
                <h2 className={styles.sectionTitle}>Notifications</h2>
                <p className={styles.sectionDesc}>Control how you receive notifications</p>
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>Email Notifications</div>
                  <div className={styles.toggleDesc}>Receive ticket updates via email</div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>In-App Notifications</div>
                  <div className={styles.toggleDesc}>Receive notifications within the application</div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
              <button
                className={styles.saveBtn}
                onClick={handleSaveNotifications}
                disabled={saving}
              >
                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
                Save Preferences
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fa-solid fa-palette"></i>
              <div>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <p className={styles.sectionDesc}>Choose your theme preference</p>
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.themeOptions}>
                {[
                  { value: "light", icon: "fa-sun", label: "Light" },
                  { value: "dark", icon: "fa-moon", label: "Dark" },
                  { value: "system", icon: "fa-desktop", label: "System Default" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.themeOption} ${theme === opt.value ? styles.themeOptionActive : ""}`}
                    onClick={() => handleSaveTheme(opt.value)}
                  >
                    <i className={`fa-solid ${opt.icon}`}></i>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fa-solid fa-shield-halved"></i>
              <div>
                <h2 className={styles.sectionTitle}>Security</h2>
                <p className={styles.sectionDesc}>Manage your account security</p>
              </div>
            </div>
            <div className={styles.sectionBody}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setResetOpen(true)}
              >
                <i className="fa-solid fa-lock"></i>
                Change Password
              </button>
            </div>
          </section>

        </div>
      )}

      {resetOpen && (
        <PasswordResetModal
          email={user?.email || ""}
          onClose={() => setResetOpen(false)}
        />
      )}
    </div>
  );
}
