const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('ticketmgr_token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const capitalize = (str) => {
  if (!str) return str;
  if (str === 'in-progress') return 'In Progress';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const toBackendStatus = (status) => {
  if (status === 'In Progress') return 'in-progress';
  return status ? status.toLowerCase() : status;
};

const toDateString = (ts) => {
  if (!ts) return '';
  if (typeof ts === 'string') return ts.split('T')[0];
  if (ts._seconds) return new Date(ts._seconds * 1000).toISOString().split('T')[0];
  return '';
};

const normalizeTicket = (ticket) => ({
  id: ticket.id || ticket.ticketId,
  title: ticket.title,
  description: ticket.description || '',
  createdBy: ticket.createdBy || '',
  creator: ticket.creator || '',
  assignedTo: ticket.assignedTo || '',
  assignedToNm: ticket.assignedToName || '',
  status: ticket.status ? capitalize(ticket.status) : 'Open',
  priority: ticket.priority ? capitalize(ticket.priority) : 'Medium',
  department: ticket.department || '',
  createdDate: toDateString(ticket.createdAt),
  lastUpdated: toDateString(ticket.updatedAt),
  comments: ticket.comments || [],
});

const toLocaleString = (ts) => {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString();
  return '';
};

const normalizeComment = (comment) => ({
  id: comment.id || comment.commentId,
  user: comment.userId || comment.user || '',
  userName: comment.userName || '',
  date: toLocaleString(comment.createdAt),
  text: comment.comment || comment.text || '',
});

const normalizeActivity = (activity) => ({
  type: activity.action
    ? activity.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '',
  user: activity.userId || '',
  timestamp: toLocaleString(activity.createdAt),
  ticketId: activity.ticketId || '',
});

export async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`, { headers: authHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load tickets');
  return json.data.map(normalizeTicket);
}

export async function getUnassignedTickets() {
  const res = await fetch(`${API_URL}/tickets/unassigned`, { headers: authHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load unassigned tickets');
  return json.data;
}

export async function getTicketById(id) {
  const res = await fetch(`${API_URL}/tickets/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Ticket not found');

  const ticket = normalizeTicket(json.data);
  ticket.comments = (json.data.comments || []).map(normalizeComment);
  ticket.activities = (json.data.activities || []).map(normalizeActivity);

  return ticket;
}

export async function createTicket(data, username) {
  const body = {
    title: data.title,
    description: data.description || '',
    department: data.department || '',
    creator: username,
  };

  console.log(body);

  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create ticket');
  return normalizeTicket(json.data);
}

export async function updateTicket(id, data) {
  const body = {};
  if (data.title) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.priority) body.priority = data.priority.toLowerCase();
  if (data.department) body.department = data.department;
  if (data.status) body.status = toBackendStatus(data.status);
  if (data.assignedTo) body.assignedTo = data.assignedTo;

  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update ticket');
  return normalizeTicket(json.data);
}

export async function assignTicket(id, data) {
  const body = {
    assignedTo: data.assignedTo,
  };
  if (data.priority) {
    body.priority = data.priority.toLowerCase();
  }

  const res = await fetch(`${API_URL}/tickets/${id}/assign`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to assign ticket');
  return normalizeTicket(json.data);
}

export async function updateStatus(id, status) {
  const res = await fetch(`${API_URL}/tickets/${id}/status`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ status: toBackendStatus(status) }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update status');
  return normalizeTicket(json.data);
}

export async function addComment(ticketId, commentData) {
  const res = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ comment: commentData.text || commentData.comment }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to add comment');
  return normalizeComment(json.data);
}

export async function getTicketComments(ticketId) {
  const res = await fetch(`${API_URL}/tickets/${ticketId}/comments`, { headers: authHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load comments');
  return json.data.map(normalizeComment);
}
