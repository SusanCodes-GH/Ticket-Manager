import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "../../utils/toast";
import styles from "./PasswordResetModal.module.css";

export default function PasswordResetModal({ email, onClose }) {
  const [sending, setSending] = useState(false);

  const handleReset = async () => {
    setSending(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Check your inbox.");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Change Password</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className={styles.body}>
          <p className={styles.desc}>
            A password reset email will be sent to:
          </p>
          <div className={styles.emailBox}>
            <i className="fa-solid fa-envelope"></i>
            {email}
          </div>
          <p className={styles.note}>
            You will be redirected to Firebase's secure password reset page. After resetting, come back and log in with your new password.
          </p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.sendBtn}
            onClick={handleReset}
            disabled={sending}
          >
            {sending ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
            Send Reset Email
          </button>
        </div>
      </div>
    </div>
  );
}
