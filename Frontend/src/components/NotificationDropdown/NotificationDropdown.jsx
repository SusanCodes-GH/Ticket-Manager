import { useState } from "react";
import styles from "./NotificationDropdown.module.css";

const priorityColors = {
  low: { bg: "#f1f5f9", color: "#64748b" },
  medium: { bg: "#fef3c7", color: "#92400e" },
  high: { bg: "#fee2e2", color: "#991b1b" },
  critical: { bg: "#fecaca", color: "#7f1d1d" },
};

export default function NotificationDropdown({
  tickets = [],
  users = [],
  onAssign,
  onClose,
}) {
  const [assigningId, setAssigningId] = useState(null);
  const [assignForm, setAssignForm] = useState({ assignedTo: "", priority: "" });
  const [assigning, setAssigning] = useState(false);

  const resolveName = (uid) => {
    if (!uid) return "Unknown";
    const u = users.find((x) => (x.uid || x.id) === uid);
    return u ? u.name : uid;
  };

  const handleAssignClick = (ticket) => {
    setAssigningId(ticket.id);
    setAssignForm({ assignedTo: "", priority: "" });
  };

  const handleAssignSubmit = async (ticket) => {
    if (!assignForm.assignedTo) return;
    setAssigning(true);
    try {
      const payload = { assignedTo: assignForm.assignedTo };
      if (assignForm.priority) payload.priority = assignForm.priority;
      await onAssign(ticket.id, payload);
      setAssigningId(null);
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    if (typeof ts === "string") return ts.split("T")[0];
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleDateString();
    return "";
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <i className="fa-solid fa-bell"></i>
        Unassigned Tickets
        <span className={styles.count}>{tickets.length}</span>
      </div>

      <div className={styles.body}>
        {tickets.length === 0 ? (
          <div className={styles.empty}>
            <i className="fa-solid fa-circle-check"></i>
            No unassigned tickets
          </div>
        ) : (
          <div className={styles.list}>
            {tickets.map((ticket) => (
              <div key={ticket.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.title}>{ticket.title}</span>
                  <span
                    className={styles.priority}
                    style={priorityColors[ticket.priority?.toLowerCase()] || priorityColors.medium}
                  >
                    {capitalize(ticket.priority)}
                  </span>
                </div>
                <div className={styles.meta}>
                  <span>
                    <i className="fa-solid fa-user"></i> {resolveName(ticket.reporterId)}
                  </span>
                  <span>
                    <i className="fa-solid fa-building"></i> {ticket.department || "—"}
                  </span>
                  <span>
                    <i className="fa-solid fa-calendar"></i> {formatDate(ticket.createdAt)}
                  </span>
                </div>

                {assigningId === ticket.id ? (
                  <div className={styles.assignForm}>
                    <select
                      className={styles.assignSelect}
                      value={assignForm.assignedTo}
                      onChange={(e) => setAssignForm((p) => ({ ...p, assignedTo: e.target.value }))}
                    >
                      <option value="">Select user</option>
                      {users
                        .filter((u) => u.role === "team" && u.status === "active")
                        .map((u) => (
                          <option key={u.uid || u.id} value={u.uid || u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                    <select
                      className={styles.assignSelect}
                      value={assignForm.priority}
                      onChange={(e) => setAssignForm((p) => ({ ...p, priority: e.target.value }))}
                    >
                      <option value="">Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <div className={styles.assignActions}>
                      <button
                        className={styles.assignBtn}
                        onClick={() => handleAssignSubmit(ticket)}
                        disabled={!assignForm.assignedTo || assigning}
                      >
                        {assigning ? <i className="fa-solid fa-spinner fa-spin"></i> : "Assign"}
                      </button>
                      <button
                        className={styles.cancelAssignBtn}
                        onClick={() => setAssigningId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className={styles.assignBtn} onClick={() => handleAssignClick(ticket)}>
                    <i className="fa-solid fa-user-plus"></i> Assign
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
