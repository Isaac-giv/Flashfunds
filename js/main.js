import { login, signup, isAuthenticated, getLoggedInUser, logout } from './auth.js';
import { addExpense, editExpense, deleteExpense, getExpenses, setMonthlyBudget, getBudget } from './expense.js';
import { initCharts, refreshCharts, renderExpensesTable, updateStatsAndBudget, populateCategoryFilter } from './dashboard.js';
import { initRouter, updateNavAndMenu, goToDashboardIfAuth } from './router.js';
import { getStorageItem, setStorageItem } from './config.js';

// Global state
let currentFilter = { search: '', category: 'ALL' };
let currentEditId = null;

function filterExpenses(expenses) {
  return expenses.filter(exp => {
    const matchSearch = exp.description.toLowerCase().includes(currentFilter.search.toLowerCase());
    const matchCat = currentFilter.category === 'ALL' || exp.category === currentFilter.category;
    return matchSearch && matchCat;
  });
}

function refreshUI() {
  const expenses = getExpenses();
  const filtered = filterExpenses(expenses);
  updateStatsAndBudget(expenses);
  refreshCharts(expenses);
  populateCategoryFilter(expenses);
  renderExpensesTable(filtered, (id) => startEditExpense(id), async (id) => { if(confirm('Delete expense?')) { deleteExpense(id); refreshUI(); } });
}

function startEditExpense(id) {
  const expenses = getExpenses();
  const exp = expenses.find(e => e.id === id);
  if (!exp) return;
  currentEditId = id;
  document.getElementById('expenseDesc').value = exp.description;
  document.getElementById('expenseAmount').value = exp.amount;
  document.getElementById('expenseCategory').value = exp.category;
  document.getElementById('expenseDate').value = exp.date;
  document.getElementById('formTitle').innerText = 'Edit Expense';
  document.getElementById('submitBtnText').innerText = 'Update Expense';
  document.getElementById('cancelEditBtn').classList.remove('hidden');
}

function cancelEdit() { currentEditId = null; document.getElementById('expenseForm').reset(); document.getElementById('formTitle').innerText = 'Add Expense'; document.getElementById('submitBtnText').innerText = 'Add Expense'; document.getElementById('cancelEditBtn').classList.add('hidden'); }

// Router view handler
function handleView(view) {
  const isLogged = isAuthenticated();
  const authSection = document.getElementById('authSection');
  const dashboard = document.getElementById('dashboardSection');
  const landingHero = document.getElementById('landingHero');
  const featuresSection = document.getElementById('featuresSection');
  const howItWorks = document.getElementById('howItWorks');
  const ctaSection = document.getElementById('ctaSection');
  if (view === 'dashboard' && isLogged) {
    authSection.classList.add('hidden');
    landingHero.classList.add('hidden');
    if (featuresSection) featuresSection.classList.add('hidden');
    if (howItWorks) howItWorks.classList.add('hidden');
    if (ctaSection) ctaSection.classList.add('hidden');
    dashboard.classList.remove('hidden');
    refreshUI();
  } else if (view === 'login' || view === 'signup' || view === 'home') {
    authSection.classList.remove('hidden');
    landingHero.classList.remove('hidden');
    if (featuresSection) featuresSection.classList.remove('hidden');
    if (howItWorks) howItWorks.classList.remove('hidden');
    if (ctaSection) ctaSection.classList.remove('hidden');
    dashboard.classList.add('hidden');
    if (view === 'login') { document.getElementById('signupCard').classList.add('hidden'); document.querySelector('#authSection .glass-card:first-child').classList.remove('hidden'); }
    if (view === 'signup') { document.querySelector('#authSection .glass-card:first-child').classList.add('hidden'); document.getElementById('signupCard').classList.remove('hidden'); }
  } else if (!isLogged && view === 'dashboard') { window.location.hash = 'login'; }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCharts();

  // Auth handlers
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value, pwd = document.getElementById('loginPassword').value;
    try { await login(username, pwd); window.location.hash = 'dashboard'; } catch(err) { alert(err.message); }
  });
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('signupFullName').value;
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const pwd = document.getElementById('signupPassword').value;
    try { await signup(fullName, username, email, pwd); window.location.hash = 'dashboard'; } catch(err) { alert(err.message); }
  });
  document.getElementById('showSignupBtn').onclick = () => window.location.hash = 'signup';
  document.getElementById('showLoginBtn').onclick = () => window.location.hash = 'login';

  // Expense Form
  document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('expenseDesc').value, amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value, date = document.getElementById('expenseDate').value || new Date().toISOString().slice(0,10);
    if (!desc || isNaN(amount)) return;
    if (currentEditId) { editExpense(currentEditId, { description: desc, amount, category, date }); cancelEdit(); }
    else { addExpense({ description: desc, amount, category, date }); document.getElementById('expenseForm').reset(); }
    refreshUI();
  });
  document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

  // Budget
  document.getElementById('setBudgetBtn').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('budgetInput').value);
    if (!isNaN(val) && val > 0) { setMonthlyBudget(val); refreshUI(); }
    else alert('Enter valid budget');
  });

  // Search & filter
  document.getElementById('searchInput').addEventListener('input', (e) => { currentFilter.search = e.target.value; refreshUI(); });
  document.getElementById('categoryFilter').addEventListener('change', (e) => { currentFilter.category = e.target.value; refreshUI(); });

  // Export
  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    const data = { expenses: getExpenses(), budget: getBudget(), exportDate: new Date() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `flashfunds_backup_${Date.now()}.json`; a.click();
  });

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn'), mobileMenu = document.getElementById('mobileMenu'), navLinksDiv = document.getElementById('navLinks');
  mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  function updateNav() { updateNavAndMenu(isAuthenticated(), false, mobileMenu, navLinksDiv); }
  initRouter((view) => { updateNav(); handleView(view); });
  updateNav();
  goToDashboardIfAuth();
});