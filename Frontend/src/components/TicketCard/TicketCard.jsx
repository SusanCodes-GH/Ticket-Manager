import styles from "./TicketCard.module.css";

const statusStyles = {
  Open: styles.statusOpen,
  "In Progress": styles.statusInProgress,
  Resolved: styles.statusResolved,
  Closed: styles.statusClosed,
};

const priorityStyles = {
  Low: styles.priorityLow,
  Medium: styles.priorityMedium,
  High: styles.priorityHigh,
  Critical: styles.priorityCritical,
};

export default function TicketCard({ ticket, onClick }) {
  return (
    <div className={styles.card} onClick={() => onClick?.(ticket)}>
      <div className={styles.header}>
        <span className={styles.id}>{ticket.id}</span>
      </div>
      <div className={styles.title}>{ticket.title}</div>
      <div className={styles.meta}>
        <span className={styles.metaLabel}>
          <i className="fa-solid fa-user"></i> {ticket.assignedTo || "Unassigned"}
        </span>
        <span className={styles.metaLabel}>
          <i className="fa-solid fa-calendar"></i> {ticket.createdDate}
        </span>
      </div>
      <div className={styles.badges}>
        <span className={`${styles.badge} ${statusStyles[ticket.status] || ""}`}>
          <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i>
          {ticket.status}
        </span>
        <span className={`${styles.badge} ${priorityStyles[ticket.priority] || ""}`}>
          <i className="fa-solid fa-flag"></i>
          {ticket.priority}
        </span>
      </div>
    </div>
  );
}
