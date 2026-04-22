import { STORAGE_KEYS, getStorageItem, setStorageItem } from './config.js';

export function initTheme() {
  const saved = getStorageItem(STORAGE_KEYS.THEME, 'light');
  if (saved === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  updateToggleIcon();
}

function updateToggleIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const icon = document.querySelector('#themeToggle i');
  if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  setStorageItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  updateToggleIcon();
  window.dispatchEvent(new Event('themeChanged'));
}