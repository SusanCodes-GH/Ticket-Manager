import { useState, useEffect } from "react";
import TicketModal from "../TicketModal/TicketModal";
import styles from "./UserModal.module.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  department: "",
  status: "active",
};

function formatDate(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "string") return dateVal.split("T")[0];
  if (dateVal._seconds) {
    return new Date(dateVal._seconds * 1000).toISOString().split("T")[0];
  }
  return String(dateVal);
}

export default function UserModal({
  isOpen,
  mode,
  user,
  onClose,
  onSubmit,
  departments = [],
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        department: user.department || "",
        status: user.status,
      });
    } else if (mode === "create") {
      setForm(initialForm);
    }
  }, [mode, user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, id: user?.uid || user?.id });
  };

  if (mode === "delete") {
    return (
      <TicketModal
        isOpen={isOpen}
        onClose={onClose}
        title="Delete User"
        size="sm"
        footer={
          <>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={() => onSubmit(user)}>
              Delete
            </button>
          </>
        }
      >
        <p className={styles.confirmText}>
          Are you sure you want to delete{" "}
          <span className={styles.confirmHighlight}>{user?.name}</span>? This
          action cannot be undone.
        </p>
      </TicketModal>
    );
  }

  if (mode === "view") {
    return (
      <TicketModal
        isOpen={isOpen}
        onClose={onClose}
        title={user?.name || "User Details"}
        size="sm"
      >
        <div className={styles.detailGrid}>
          <div className={styles.detailField}>
            <span className={styles.detailLabel}>Name</span>
            <span className={styles.detailValue}>{user?.name}</span>
          </div>
          <div className={styles.detailField}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{user?.email}</span>
          </div>
          <div className={styles.detailField}>
            <span className={styles.detailLabel}>Role</span>
            <span className={styles.detailValue}>
              {user?.role === "admin" ? "Admin" : "Team Member"}
            </span>
          </div>
          <div className={styles.detailField}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue}>{user?.status}</span>
          </div>
          <div className={styles.detailField}>
            <span className={styles.detailLabel}>Department</span>
            <span className={styles.detailValue}>{user?.department}</span>
          </div>
          <div className={styles.detailField}>
            <span className={styles.detailLabel}>Created</span>
            <span className={styles.detailValue}>{formatDate(user?.createdAt || user?.createdDate)}</span>
          </div>
        </div>
      </TicketModal>
    );
  }

  const isEditing = mode === "edit";

  return (
    <TicketModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Team Member" : "Add Team Member"}
      size="sm"
      footer={
        <>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.email.trim()}
          >
            {isEditing ? "Save Changes" : "Create Team Member"}
          </button>
        </>
      }
    >
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Full Name *</label>
        <input
          type="text"
          className={styles.formInput}
          placeholder="Enter full name"
          value={form.name}
          onChange={handleChange("name")}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Email *</label>
        <input
          type="email"
          className={styles.formInput}
          placeholder="Enter email address"
          value={form.email}
          onChange={handleChange("email")}
        />
      </div>
      {!isEditing && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Password</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="Default: team123"
            value={form.password}
            onChange={handleChange("password")}
          />
          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            Share these credentials with the team member
          </span>
        </div>
      )}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Department</label>
        <select
          className={styles.formSelect}
          value={form.department}
          onChange={handleChange("department")}
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      {isEditing && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Status</label>
          <select
            className={styles.formSelect}
            value={form.status}
            onChange={handleChange("status")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}
    </TicketModal>
  );
}
