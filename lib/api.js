import { clearAdminAuth, clearAuth } from './auth';

const API_BASE = '/api';

export async function apiRequest(url, options = {}) {
  if (typeof window === 'undefined') return { ok: false, status: 0, data: {} };
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok && response.status === 401) {
    clearAuth();
  }
  return { ok: response.ok, status: response.status, data };
}

export async function adminAPI(url, options = {}) {
  if (typeof window === 'undefined') return { ok: false, data: {} };
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (res.status === 401) {
      clearAdminAuth();
      window.location.href = '/admin/login';
      return { ok: false, data: { message: 'Phiên đăng nhập hết hạn.' } };
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, data: { message: 'Lỗi kết nối server.' } };
  }
}
