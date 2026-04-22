export const STORAGE_KEYS = {
  USERS: 'flashfunds_users',
  EXPENSES: 'flashfunds_expenses',
  BUDGET: 'flashfunds_budget',
  SESSION_USER: 'flashfunds_session',
  THEME: 'flashfunds_theme'
};

export function getStorageItem(key, defaultValue = null) {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultValue;
}

export function setStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}