import styles from "./TicketFilters.module.css";

export default function TicketFilters({
  searchValue,
  statusValue,
  priorityValue,
  onSearch,
  onStatusFilter,
  onPriorityFilter,
  onCreate,
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.searchWrapper}>
        <i className={`fa-solid fa-search ${styles.searchIcon}`}></i>
        <input
          type="text"
          placeholder="Search tickets..."
          className={styles.searchInput}
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <select
        className={styles.select}
        value={statusValue}
        onChange={(e) => onStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      <select
        className={styles.select}
        value={priorityValue}
        onChange={(e) => onPriorityFilter(e.target.value)}
      >
        <option value="">All Priority</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>

      <button className={styles.createBtn} onClick={onCreate}>
        <i className="fa-solid fa-plus"></i>
        New Ticket
      </button>
    </div>
  );
}
