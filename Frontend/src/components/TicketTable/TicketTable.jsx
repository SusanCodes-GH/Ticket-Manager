import { useAuth } from "../../context/AuthContext";
import styles from "./TicketTable.module.css";

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

function displayName(ticket, field) {
  const name = ticket[`${field}Name`];
  const val = ticket[field];
  return name || val || (field === "assignedTo" ? "" : val) || "";
}

export default function TicketTable({
  tickets,
  onView,
  onEdit,
  onAssign,
  loading = false,
  isAdmin = false,
}) {
  if (loading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}>
            <i className="fa-solid fa-spinner"></i>
          </div>
          <div className={styles.emptyText}>Loading tickets...</div>
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fa-solid fa-ticket"></i>
          </div>
          <div className={styles.emptyText}>No tickets found</div>
          <div className={styles.emptySubtext}>
            Try adjusting your filters or create a new ticket.
          </div>
        </div>
      </div>
    );
  }

  const { user } = useAuth();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>S.NO</th>
            <th>Title</th>
            <th>Created By</th>
            <th>Assigned To</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets
            // .filter((ticket) => ticket.assignedTo === user?.id)
            .map((ticket, i) => (
              <tr key={ticket.id} className={styles.tableRow}>
                {console.log("Ticket : ",ticket)}
                <td className={styles.ticketId}>{i + 1}</td>
                <td className={styles.title} title={ticket.title}>
                  {ticket.title}
                </td>
                {/* {displayName(ticket, "createdBy")}   {displayName(ticket, "assignedTo") || "—"} */}
                <td className={styles.createdBy}>{ticket.creator}</td>
                <td className={styles.assignedTo}>{ticket.assignedToNm}</td>
                <td>
                  <span
                    className={`${styles.priorityBadge} ${priorityStyles[ticket.priority] || ""
                      }`}
                  >
                    <i className="fa-solid fa-flag"></i>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${statusStyles[ticket.status] || ""
                      }`}
                  >
                    <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.createdDate}</td>
                <td className={styles.actions}>
                  <button
                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                    onClick={() => onView(ticket)}
                    title="View Details"
                  >
                    <i className="fa-solid fa-eye"></i>
                    View
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => onEdit(ticket)}
                    title="Edit Ticket"
                  >
                    <i className="fa-solid fa-pen"></i>
                    Edit
                  </button>
                  {isAdmin && (
                    <button
                      className={`${styles.actionBtn} ${styles.assignBtn}`}
                      onClick={() => onAssign(ticket)}
                      title="Assign Ticket"
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      Assign
                    </button>)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
