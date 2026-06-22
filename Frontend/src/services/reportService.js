const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('ticketmgr_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export async function getDashboardData() {
  const res = await fetch(`${API_URL}/reports/dashboard`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load dashboard data');
  return json.data;
}

export async function getTicketTrendData(days = 7) {
  const res = await fetch(`${API_URL}/reports/trend?days=${days}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load trend data');
  return json.data;
}
