const API_URL = import.meta.env.VITE_API_URL || '';

export function getApiUrl() {
  return API_URL.replace(/\/$/, '');
}

export function isBackendConfigured() {
  return !!getApiUrl();
}

const AUTH_TOKEN_KEY = 'roster-auth-token';

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.warn('Could not store token', e);
  }
}

export async function apiFetch(path, options = {}) {
  const base = getApiUrl();
  if (!base) throw new Error('API URL not configured');
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (res.status === 401) {
    setStoredToken(null);
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json().catch(() => ({}));
}
