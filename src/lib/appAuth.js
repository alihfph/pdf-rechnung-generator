const STORAGE_KEY = 'app-auth';

const DEFAULT_USERNAME = 'partap.singh';
const DEFAULT_PASSWORD = 'Germany1234';

export function getAppUsername() {
  return import.meta.env.VITE_APP_USERNAME || DEFAULT_USERNAME;
}

export function getAppPassword() {
  return import.meta.env.VITE_APP_PASSWORD || DEFAULT_PASSWORD;
}

export function isAppAuthenticated() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAppAuthenticated(value) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, 'true');
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not set app auth', e);
  }
}

export function checkAppLogin(username, password) {
  const u = (username || '').trim();
  const p = password || '';
  return u === getAppUsername() && p === getAppPassword();
}
