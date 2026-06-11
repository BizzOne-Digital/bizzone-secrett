// ← YAHAN apna backend ka Vercel URL dalo (trailing slash NAHI)
const API_BASE = 'https://bizzone-secrett.vercel.app/api';

// Example: const API_BASE = 'https://bizz1-backend.vercel.app/api';
// Local dev ke liye: const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('bizz1_token');
}

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  return h;
}

async function request(method, path, body) {
  const opts = { method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Auth
export async function login(email, password) {
  const data = await request('POST', '/auth/login', { email, password });
  localStorage.setItem('bizz1_token', data.token);
  localStorage.setItem('bizz1_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
  return data;
}

export async function register(name, email, password) {
  const data = await request('POST', '/auth/register', { name, email, password });
  localStorage.setItem('bizz1_token', data.token);
  localStorage.setItem('bizz1_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
  return data;
}

export function logout() {
  localStorage.removeItem('bizz1_token');
  localStorage.removeItem('bizz1_user');
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('bizz1_user')); } catch { return null; }
}

export function isLoggedIn() {
  return !!getToken();
}

// Data CRUD
export async function loadAllData() {
  return await request('GET', '/data');
}

export async function saveAllData(data) {
  return await request('PUT', '/data', data);
}

export async function saveSection(section, data) {
  return await request('PATCH', '/data/' + section, data);
}

export async function resetAllData() {
  return await request('DELETE', '/data');
}