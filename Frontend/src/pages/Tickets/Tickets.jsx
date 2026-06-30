import { useState, useEffect, useMemo } from "react";
import {
  getTickets,
  getTicketById,
  getTicketComments,
  createTicket,
  updateTicket,
  assignTicket,
  updateStatus,
  addComment as addCommentService,
} from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";
import { getUsers } from "../../services/userService";
import TicketFilters from "../../components/TicketFilters/TicketFilters";
import TicketTable from "../../components/TicketTable/TicketTable";
import TicketModal from "../../components/TicketModal/TicketModal";
import CommentSection from "../../components/CommentSection/CommentSection";
import styles from "./Tickets.module.css";

const statusDetailStyles = {
  Open: styles.detailStatusOpen,
  "In Progress": styles.detailStatusInProgress,
  Resolved: styles.detailStatusResolved,
  Closed: styles.detailStatusClosed,
};

const departmentsList = ["IT", "HR", "Finance", "Operations", "Admin"];

export default function Tickets() {
  const { currentUser, hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [modalMode, setModalMode] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    department: "",
    status: "",
  });

  const [assignForm, setAssignForm] = useState({
    assignedTo: "",
    priority: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketData, userData] = await Promise.all([
        getTickets(),
        isAdmin ? getUsers() : Promise.resolve([]),
      ]);
      setTickets(ticketData);
      setUsers(userData);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  };

  const userNameMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.uid || u.id] = u.name;
    });
    return map;
  }, [users]);

  const resolveName = (uidOrName) => {
    if (!uidOrName) return "";
    return userNameMap[uidOrName] || uidOrName;
  };

  const enrichTicket = (ticket) => ({
    ...ticket,
    createdByName: resolveName(ticket.createdBy),
    assignedToName: ticket.assignedToName || resolveName(ticket.assignedTo),
  });

  const myTickets = useMemo(() => {
    if (isAdmin) return tickets.map(enrichTicket);
    return tickets
      .filter((t) => t.assignedTo === currentUser.uid || t.createdBy === currentUser.uid)
      .map(enrichTicket);
  }, [tickets, isAdmin, currentUser.uid, enrichTicket]);

  const filteredTickets = useMemo(() => {
    return myTickets.filter((ticket) => {
      const matchesSearch =
        !searchQuery ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.createdByName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || ticket.status === statusFilter;
      const matchesPriority =
        !priorityFilter || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [myTickets, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: myTickets.length,
      open: myTickets.filter((t) => t.status === "Open").length,
      inProgress: myTickets.filter((t) => t.status === "In Progress").length,
      resolved: myTickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ).length,
    };
  }, [myTickets]);

  const handleView = async (ticket) => {
    setViewLoading(true);
    setModalMode("view");
    setSelectedTicket(null);

    try {
      const fullTicket = await getTicketById(ticket.id);
      setSelectedTicket(fullTicket);
    } catch (err) {
      setSelectedTicket({ ...ticket, comments: [], activities: [] });
      try {
        const comments = await getTicketComments(ticket.id);
        setSelectedTicket((prev) => prev?.id === ticket.id ? { ...prev, comments } : prev);
      } catch (commentErr) {
      }
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setCreateForm({
      title: ticket.title,
      description: ticket.description,
      department: ticket.department,
      status: ticket.status,
    });
    setModalMode("edit");
  };

  const handleAssign = (ticket) => {
    setSelectedTicket(ticket);
    setAssignForm({
      assignedTo: ticket.assignedTo || "",
      priority: ticket.priority,
    });
    setModalMode("assign");
  };

  const handleCreateOpen = () => {
    setSelectedTicket(null);
    setCreateForm({
      title: "",
      description: "",
      department: "",
      status: "",
    });
    setModalMode("create");
  };

  const handleCreateSubmit = async () => {
    if (!createForm.title.trim()) return;
    await createTicket(createForm, currentUser.name);
    await loadTickets();
    setModalMode(null);
  };

  const handleEditSubmit = async () => {
    if (!createForm.title.trim() || !selectedTicket) return;
    await updateTicket(selectedTicket.id, createForm);
    await loadTickets();
    setModalMode(null);
  };

  const handleAssignSubmit = async () => {
    if (!assignForm.assignedTo) return;
    const payload = { assignedTo: assignForm.assignedTo };
    if (assignForm.priority) {
      payload.priority = assignForm.priority;
    }
    await assignTicket(selectedTicket.id, payload);
    await loadTickets();
    setModalMode(null);
  };

  const handleAddComment = async (text) => {
    const newComment = await addCommentService(selectedTicket.id, { text });
    setSelectedTicket((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, comments: [...(t.comments || []), newComment] }
          : t
      )
    );
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedTicket(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tickets</h1>
          <p className={styles.pageSubtitle}>
            {isAdmin
              ? "Manage and track all support tickets"
              : "View and manage your tickets"}
          </p>
        </div>
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
            <span className={styles.statLabel}>Resolved / Closed</span>
          </div>
        </div>
      </div>

      <TicketFilters
        searchValue={searchQuery}
        statusValue={statusFilter}
        priorityValue={priorityFilter}
        onSearch={setSearchQuery}
        onStatusFilter={setStatusFilter}
        onPriorityFilter={setPriorityFilter}
        onCreate={handleCreateOpen}
      />

      <TicketTable
        tickets={filteredTickets}
        onView={handleView}
        onEdit={handleEdit}
        onAssign={isAdmin ? handleAssign : undefined}
        loading={loading}
        isAdmin={isAdmin}
      />

      <TicketModal
        isOpen={modalMode === "view"}
        onClose={closeModal}
        // title={selectedTicket?.id || "Ticket Details"}
        title={"Ticket Details"}
        size="lg"
      >
        {viewLoading && (
          <div className={styles.loadingState}>
            <i className="fa-solid fa-spinner fa-spin"></i> Loading ticket...
          </div>
        )}
        {!viewLoading && selectedTicket && (
          <>
            <div className={styles.detailGrid}>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Title</span>
                <span className={styles.detailValue}>
                  {selectedTicket.title}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Department</span>
                <span className={styles.detailValue}>
                  {selectedTicket.department}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Status</span>
                <span
                  className={`${styles.detailBadge} ${
                    statusDetailStyles[selectedTicket.status] || ""
                  }`}
                >
                  <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i>
                  {selectedTicket.status}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Priority</span>
                <span
                  className={styles.detailBadge}
                  style={{
                    background:
                      selectedTicket.priority === "Critical"
                        ? "#fecaca"
                        : selectedTicket.priority === "High"
                        ? "#fee2e2"
                        : selectedTicket.priority === "Medium"
                        ? "#fef3c7"
                        : "#f1f5f9",
                    color:
                      selectedTicket.priority === "Critical"
                        ? "#7f1d1d"
                        : selectedTicket.priority === "High"
                        ? "#991b1b"
                        : selectedTicket.priority === "Medium"
                        ? "#92400e"
                        : "#64748b",
                  }}
                >
                  <i className="fa-solid fa-flag"></i>
                  {selectedTicket.priority}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Created By</span>
                <span className={styles.detailValue}>
                  {selectedTicket.createdByName || selectedTicket.createdBy}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Assigned To</span>
                <span className={styles.detailValue}>
                  {selectedTicket.assignedToName || selectedTicket.assignedTo || "Unassigned"}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Created Date</span>
                <span className={styles.detailValue}>
                  {selectedTicket.createdDate}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Last Updated</span>
                <span className={styles.detailValue}>
                  {selectedTicket.lastUpdated}
                </span>
              </div>
              <div className={styles.detailFieldFull}>
                <span className={styles.detailLabel}>Description</span>
                <div className={styles.detailDesc}>
                  {selectedTicket.description}
                </div>
              </div>
            </div>
            <CommentSection
              comments={selectedTicket.comments || []}
              onAddComment={handleAddComment}
              resolveName={resolveName}
            />
          </>
        )}
      </TicketModal>

      <TicketModal
        isOpen={modalMode === "create" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Ticket" : "Create New Ticket"}
        size="md"
        footer={
          <>
            <button className={styles.cancelBtn} onClick={closeModal}>
              Cancel
            </button>
            <button
              className={styles.submitBtn}
              onClick={modalMode === "edit" ? handleEditSubmit : handleCreateSubmit}
              disabled={!createForm.title.trim()}
            >
              {modalMode === "edit" ? "Update Ticket" : "Create Ticket"}
            </button>
          </>
        }
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Title *</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="Enter ticket title"
            value={createForm.title}
            disabled={modalMode === "edit" && !isAdmin}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            className={styles.formTextarea}
            placeholder="Describe the issue..."
            value={createForm.description}
            disabled={modalMode === "edit" && !isAdmin}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Department</label>
          <select
            className={styles.formSelect}
            value={createForm.department}
            disabled={modalMode === "edit" && !isAdmin}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                department: e.target.value,
              }))
            }
          >
            <option value="">Select department</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        {modalMode === "edit" && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select
              className={styles.formSelect}
              value={createForm.status}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        )}
      </TicketModal>

      {isAdmin && (
        <TicketModal
          isOpen={modalMode === "assign"}
          onClose={closeModal}
          title={`Assign Ticket - ${selectedTicket?.id || ""}`}
          size="sm"
          footer={
            <>
              <button className={styles.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleAssignSubmit}
                disabled={!assignForm.assignedTo}
              >
                Assign
              </button>
            </>
          }
        >
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Assign To *</label>
            <select
              className={styles.formSelect}
              value={assignForm.assignedTo}
              onChange={(e) =>
                setAssignForm((prev) => ({
                  ...prev,
                  assignedTo: e.target.value,
                }))
              }
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
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Priority</label>
            <select
              className={styles.formSelect}
              value={assignForm.priority}
              onChange={(e) =>
                setAssignForm((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value="">Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </TicketModal>
      )}
    </div>
  );
}
