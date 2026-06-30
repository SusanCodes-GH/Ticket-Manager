import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketService";
import styles from "./Dashboard.module.css";

const statusStyles = {
  Open: styles.statusOpen,
  "In Progress": styles.statusInProgress,
  Resolved: styles.statusResolved,
};

const priorityColors = {
  High: styles.priorityHigh,
  Medium: styles.priorityMedium,
  Low: styles.priorityLow,
};

export default function Dashboard() {
  const { currentUser, hasRole } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets().then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const isAdmin = hasRole("admin");

  const myTickets = isAdmin
    ? tickets
    : tickets.filter((t) => t.createdBy === currentUser.uid);

  const calcStats = (list) => ({
    total: list.length,
    open: list.filter((t) => t.status === "Open").length,
    inProgress: list.filter((t) => t.status === "In Progress").length,
    resolved: list.filter(
      (t) => t.status === "Resolved" || t.status === "Closed"
    ).length,
  });

  const stats = calcStats(myTickets);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            {isAdmin
              ? "Overview of your ticket system"
              : `Welcome back, ${currentUser.name?.split(" ")[0]}`}
          </p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => navigate("/tickets")}
        >
          <i className="fa-solid fa-plus"></i>
          New Ticket
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#eff6ff", color: "#3b82f6" }}
          >
            <i className="fa-solid fa-ticket"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>
              {isAdmin ? "Total Tickets" : "My Tickets"}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#fef3c7", color: "#f59e0b" }}
          >
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.open}</span>
            <span className={styles.statLabel}>Open</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#eef2ff", color: "#8b5cf6" }}
          >
            <i className="fa-solid fa-spinner"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#dcfce7", color: "#22c55e" }}
          >
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.resolved}</span>
            <span className={styles.statLabel}>
              {isAdmin ? "Resolved / Closed" : "Resolved"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {isAdmin ? "Recent Tickets" : "My Recent Tickets"}
          </h2>
          <button
            className={styles.viewAll}
            onClick={() => navigate("/tickets")}
          >
            View All
          </button>
        </div>
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading...
          </div>
        ) : myTickets.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            No tickets found. Create your first ticket!
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.slice(0, 6).map((ticket, i) => (
                <tr key={ticket.id}>
                  {console.log("Ticket",ticket)}
                  <td className={styles.ticketId}>{i + 1}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <span
                      className={`${styles.status} ${statusStyles[ticket.status]}`}
                    >
                      <i
                        className="fa-solid fa-circle"
                        style={{ fontSize: 8 }}
                      ></i>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.priority} ${
                        priorityColors[ticket.priority]
                      }`}
                    >
                      <i className="fa-solid fa-flag"></i>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{ticket.createdDate}</td>
                  <td>{ticket.assignedToNm || ticket.assignedTo || "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
