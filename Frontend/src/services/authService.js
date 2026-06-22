import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase.js';

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('ticketmgr_token');

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Login failed');
  }

  localStorage.setItem('ticketmgr_token', json.data.token);
  return json.data.user;
}

export async function registerAdmin(data) {
  const res = await fetch(`${API_URL}/auth/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department || 'IT',
    }),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Registration failed');
  }

  return json.data;
}

export async function refresh() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to refresh user');
  return json.data;
}

export async function logout() {
  const token = getToken();

  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  }

  localStorage.removeItem('ticketmgr_token');
}
