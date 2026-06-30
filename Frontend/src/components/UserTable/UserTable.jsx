import styles from "./UserTable.module.css";

const avatarColors = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
];

function getColor(id) {
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

function formatDate(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "string") return dateVal.split("T")[0];
  if (dateVal._seconds) {
    return new Date(dateVal._seconds * 1000).toISOString().split("T")[0];
  }
  return String(dateVal);
}

export default function UserTable({ users = [], onView, onEdit, onDelete }) {
  if (users.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className={styles.emptyText}>No users found</div>
          <div className={styles.emptySubtext}>
            Create your first team member to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            {/* <th>Email</th> */}
            <th>Role</th>
            <th>Status</th>
            <th>Department</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const userId = user.uid || user.id;
            return (
              <tr key={userId} className={styles.row}>
                <td>
                  <div className={styles.userInfo}>
                    <div
                      className={styles.avatar}
                      style={{ background: getColor(userId) }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                {/* <td className={styles.userEmail}>{user.email}</td> */}
                <td>
                  <span
                    className={`${styles.roleBadge} ${
                      user.role === "admin" ? styles.roleAdmin : styles.roleTeam
                    }`}
                  >
                    {user.role === "admin" ? (
                      <i className="fa-solid fa-shield-halved"></i>
                    ) : (
                      <i className="fa-solid fa-user"></i>
                    )}
                    {user.role === "admin" ? "Admin" : "Team"}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      user.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i>
                    {user.status}
                  </span>
                </td>
                <td>{user.department}</td>
                <td>{formatDate(user.createdAt || user.createdDate)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      onClick={() => onView(user)}
                      title="View User"
                    >
                      <i className="fa-solid fa-eye"></i>
                      View
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => onEdit(user)}
                      title="Edit User"
                    >
                      <i className="fa-solid fa-pen"></i>
                      Edit
                    </button>
                    {user.role !== "admin" && (<button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => onDelete(user)}
                      title="Delete User"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      Delete
                    </button>)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
