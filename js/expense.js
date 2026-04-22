import { STORAGE_KEYS, getStorageItem, setStorageItem } from './config.js';
import { getLoggedInUser } from './auth.js';

function getUserId() {
  const user = getLoggedInUser();
  return user ? user.id : null;
}

function getUserExpensesKey() {
  const userId = getUserId();
  return userId ? `flashfunds_expenses_${userId}` : STORAGE_KEYS.EXPENSES;
}

function getUserBudgetKey() {
  const userId = getUserId();
  return userId ? `flashfunds_budget_${userId}` : STORAGE_KEYS.BUDGET;
}

export function getExpenses() {
  const key = getUserExpensesKey();
  return getStorageItem(key, []);
}

function saveExpenses(expenses) {
  const key = getUserExpensesKey();
  setStorageItem(key, expenses);
}

export function addExpense(expense) {
  const expenses = getExpenses();
  const newExpense = { ...expense, id: Date.now(), createdAt: new Date().toISOString() };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

export function editExpense(id, updatedData) {
  let expenses = getExpenses();
  const index = expenses.findIndex(e => e.id == id);
  if (index === -1) throw new Error('Expense not found');
  expenses[index] = { ...expenses[index], ...updatedData };
  saveExpenses(expenses);
  return expenses[index];
}

export function deleteExpense(id) {
  let expenses = getExpenses();
  const filtered = expenses.filter(e => e.id != id);
  saveExpenses(filtered);
}

export function setMonthlyBudget(amount) {
  const key = getUserBudgetKey();
  setStorageItem(key, { amount: parseFloat(amount), month: new Date().toISOString().slice(0,7) });
}

export function getBudget() {
  const key = getUserBudgetKey();
  const budget = getStorageItem(key, null);
  const currentMonth = new Date().toISOString().slice(0,7);
  if (budget && budget.month === currentMonth) return budget.amount;
  return null;
}

export function getMonthlyTotal(expenses) {
  const currentMonth = new Date().toISOString().slice(0,7);
  return expenses.filter(e => e.date.startsWith(currentMonth)).reduce((sum, e) => sum + parseFloat(e.amount), 0);
}

export function getCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach(exp => { totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount); });
  return totals;
}

export function getTopCategory(expenses) {
  const totals = getCategoryTotals(expenses);
  let top = null, max = 0;
  for (const [cat, amt] of Object.entries(totals)) if (amt > max) { max = amt; top = cat; }
  return top || 'None';
}

export function getAvgDailySpend(expenses) {
  const monthly = getMonthlyTotal(expenses);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  return monthly / daysInMonth;
}

export function getLast7DaysSpending(expenses) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0,10);
    const dailyTotal = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + parseFloat(e.amount), 0);
    result.push({ date: dateStr, total: dailyTotal });
  }
  return result;
}