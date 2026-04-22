import { isAuthenticated, logout, getLoggedInUser } from './auth.js';

export function initRouter(updateViewCallback) {
  function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    updateViewCallback(hash);
  }
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function updateNavAndMenu(isLoggedIn, showMobileMenu, mobileMenuDiv, navLinksDiv) {
  const user = getLoggedInUser();
  const greeting = isLoggedIn && user ? `<span id="userGreeting" class="text-indigo-600 font-medium">Hello, ${user.fullName || user.username}</span>` : '';
  const links = isLoggedIn ?
    `${greeting}<a href="#dashboard" class="nav-link text-gray-700 hover:text-indigo-500">Dashboard</a><button id="logoutBtn" class="text-red-500 hover:text-red-600">Logout</button>` :
    `<a href="#login" class="nav-link text-gray-700">Login</a><a href="#signup" class="nav-link text-gray-700">Sign Up</a>`;
  navLinksDiv.innerHTML = links;
  if (mobileMenuDiv) mobileMenuDiv.innerHTML = links;
  if (isLoggedIn) document.getElementById('logoutBtn')?.addEventListener('click', () => { logout(); window.location.hash = 'login'; location.reload(); });
}

export function goToDashboardIfAuth() { if (isAuthenticated()) window.location.hash = 'dashboard'; }