import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnassignedTickets, assignTicket } from "../services/ticketService";
import { getUsers } from "../services/userService";
import NotificationDropdown from "../components/NotificationDropdown/NotificationDropdown";
import styles from "./Navbar.module.css";

const avatarColors = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
];

function getColorFromId(id) {
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

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unassigned, setUnassigned] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchUnassigned = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [ticketData, userData] = await Promise.all([
        getUnassignedTickets(),
        getUsers(),
      ]);
      setUnassigned(ticketData);
      setUsers(userData);
    } catch (err) {
      console.error("Failed to fetch unassigned tickets", err);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUnassigned();
  }, [fetchUnassigned]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleAssign = async (ticketId, payload) => {
    await assignTicket(ticketId, payload);
    setUnassigned((prev) => prev.filter((t) => t.id !== ticketId));
  };

  if (!user) return null;

  return (
    <header className={styles.navbar}>
      <div className={styles.searchBar}>
        <i className={`fa-solid fa-search ${styles.searchIcon}`}></i>
        <input
          type="text"
          placeholder="Search tickets..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.navRight}>
        {isAdmin && (
          <div className={styles.notifWrapper} ref={notifRef}>
            <button
              className={styles.iconBtn}
              onClick={() => {
                setNotifOpen((prev) => !prev);
                if (!notifOpen) fetchUnassigned();
              }}
            >
              <i className="fa-solid fa-bell"></i>
              {unassigned.length > 0 && (
                <span className={styles.badge}>{unassigned.length}</span>
              )}
            </button>
            {notifOpen && (
              <NotificationDropdown
                tickets={unassigned}
                users={users}
                onAssign={handleAssign}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>
        )}

        <div className={styles.userDropdown} ref={userMenuRef}>
          <div
            className={styles.userInfo}
            onClick={() => setUserMenuOpen((prev) => !prev)}
          >
            <div
              className={styles.avatar}
              style={{ background: getColorFromId(user.id) }}
            >
              {getInitials(user.name)}
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <i className={`fa-solid fa-chevron-down ${styles.arrow}`}></i>
          </div>

          {userMenuOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUserInfo}>
                  <div
                    className={styles.dropdownAvatar}
                    style={{ background: getColorFromId(user.id) }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{user.name}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                  </div>
                </div>
              </div>
              <button
                className={styles.dropdownItem}
                onClick={() => { setUserMenuOpen(false); navigate("/profile"); }}
              >
                <i className="fa-solid fa-user"></i>
                Profile
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => { setUserMenuOpen(false); navigate("/settings"); }}
              >
                <i className="fa-solid fa-gear"></i>
                Settings
              </button>
              <div className={styles.dropdownDivider}></div>
              <button
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-right-from-bracket"></i>
                )}
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
