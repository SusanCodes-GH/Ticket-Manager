const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('ticketmgr_token');
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, { headers: headers() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load users');
  return json.data;
}

export async function getUserById(id) {
  const res = await fetch(`${API_URL}/users/${id}`, { headers: headers() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'User not found');
  return json.data;
}

export async function createUser(data) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password || 'team123',
      department: data.department || '',
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create user');
  return json.data;
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      department: data.department,
      status: data.status,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update user');
  return json.data;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete user');
  return json.data;
}

export async function getSettings() {
  const res = await fetch(`${API_URL}/users/settings`, { headers: headers() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to load settings');
  return json.data;
}

export async function updateSettings(data) {
  const res = await fetch(`${API_URL}/users/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update settings');
  return json.data;
}

export async function updateProfile(data) {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      name: data.name,
      department: data.department,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update profile');
  return json.data;
}
