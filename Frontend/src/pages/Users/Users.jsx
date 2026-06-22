import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import * as userService from "../../services/userService";
import UserTable from "../../components/UserTable/UserTable";
import UserModal from "../../components/UserModal/UserModal";
import styles from "./Users.module.css";

const departments = ["IT", "HR", "Finance", "Operations", "Admin"];

export default function Users() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      team: users.filter((u) => u.role === "team").length,
      active: users.filter((u) => u.status === "active").length,
    };
  }, [users]);

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleCreate = async (form) => {
    await userService.createUser({
      name: form.name,
      email: form.email,
      password: form.password || "team123",
      department: form.department,
    });
    await loadUsers();
    closeModal();
  };

  const handleEdit = async (form) => {
    await userService.updateUser(form.id, {
      name: form.name,
      email: form.email,
      department: form.department,
      status: form.status,
    });
    await loadUsers();
    closeModal();
  };

  const handleDelete = async (userToDelete) => {
    if ((userToDelete.uid || userToDelete.id) === (currentUser?.uid || currentUser?.id)) return;
    await userService.deleteUser(userToDelete.uid || userToDelete.id);
    await loadUsers();
    closeModal();
  };

  const handleSubmit = async (form) => {
    if (modalMode === "create") return handleCreate(form);
    if (modalMode === "edit") return handleEdit(form);
    if (modalMode === "delete") return handleDelete(selectedUser);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>
            Manage team members and their access
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => openModal("create")}
        >
          <i className="fa-solid fa-plus"></i>
          Add Team Member
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#eff6ff", color: "#3b82f6" }}
          >
            <i className="fa-solid fa-users"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#eef2ff", color: "#4338ca" }}
          >
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.admins}</span>
            <span className={styles.statLabel}>Admins</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#f1f5f9", color: "#475569" }}
          >
            <i className="fa-solid fa-user"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.team}</span>
            <span className={styles.statLabel}>Team Members</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#dcfce7", color: "#22c55e" }}
          >
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.searchWrapper}>
          <i className={`fa-solid fa-search ${styles.searchIcon}`}></i>
          <input
            type="text"
            placeholder="Search users..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className={styles.select}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="team">Team</option>
        </select>
      </div>

      <UserTable
        users={filteredUsers}
        onView={(user) => openModal("view", user)}
        onEdit={(user) => openModal("edit", user)}
        onDelete={(user) => openModal("delete", user)}
      />

      <UserModal
        isOpen={modalOpen}
        mode={modalMode}
        user={selectedUser}
        onClose={closeModal}
        onSubmit={handleSubmit}
        departments={departments}
      />
    </div>
  );
}
