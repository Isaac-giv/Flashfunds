import { getExpenses, deleteExpense, getMonthlyTotal, getBudget, getTopCategory, getAvgDailySpend, getCategoryTotals, getLast7DaysSpending } from './expense.js';

let doughnutChart, lineChart;
let currentEditId = null;

export function initCharts() {
  const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
  const lineCtx = document.getElementById('lineChart').getContext('2d');
  if (doughnutChart) doughnutChart.destroy();
  if (lineChart) lineChart.destroy();
  doughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: { labels: [], datasets: [{ data: [], backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#C9CBCF'] }] }, options: { responsive: true } });
  lineChart = new Chart(lineCtx, { type: 'line', data: { labels: [], datasets: [{ label: 'Spending ($)', data: [], borderColor: '#6366f1', tension: 0.3, fill: false }] }, options: { responsive: true } });
}

export function refreshCharts(expenses) {
  if (!doughnutChart || !lineChart) initCharts();
  const catTotals = getCategoryTotals(expenses);
  doughnutChart.data.labels = Object.keys(catTotals);
  doughnutChart.data.datasets[0].data = Object.values(catTotals);
  doughnutChart.update();

  const sevenDays = getLast7DaysSpending(expenses);
  lineChart.data.labels = sevenDays.map(d => d.date.slice(5));
  lineChart.data.datasets[0].data = sevenDays.map(d => d.total);
  lineChart.update();
}

export function renderExpensesTable(filteredExpenses, onEdit, onDelete) {
  const tbody = document.getElementById('expensesTableBody');
  if (!filteredExpenses.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-gray-400">No expenses found</td></tr>'; return; }
  tbody.innerHTML = filteredExpenses.map(exp => `
    <tr class="border-b dark:border-gray-700">
      <td class="py-2">${escapeHtml(exp.description)}</td><td class="py-2">$${parseFloat(exp.amount).toFixed(2)}</td>
      <td class="py-2">${exp.category}</td><td class="py-2">${exp.date}</td>
      <td class="py-2"><button class="edit-expense text-blue-500 mr-2" data-id="${exp.id}"><i class="fas fa-edit"></i></button><button class="delete-expense text-red-500" data-id="${exp.id}"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('');
  document.querySelectorAll('.edit-expense').forEach(btn => btn.addEventListener('click', () => onEdit(parseInt(btn.dataset.id))));
  document.querySelectorAll('.delete-expense').forEach(btn => btn.addEventListener('click', () => onDelete(parseInt(btn.dataset.id))));
}

function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

export function updateStatsAndBudget(expenses) {
  const monthlyTotal = getMonthlyTotal(expenses);
  document.getElementById('totalSpentMonth').innerText = `$${monthlyTotal.toFixed(2)}`;
  const budgetAmount = getBudget();
  const remaining = budgetAmount ? Math.max(0, budgetAmount - monthlyTotal) : 0;
  document.getElementById('remainingBudget').innerText = budgetAmount ? `$${remaining.toFixed(2)}` : '—';
  const avgDaily = getAvgDailySpend(expenses);
  document.getElementById('avgDailySpend').innerText = `$${avgDaily.toFixed(2)}`;
  document.getElementById('topCategory').innerText = getTopCategory(expenses);
  if (budgetAmount) {
    const percent = Math.min(100, (monthlyTotal / budgetAmount) * 100);
    document.getElementById('budgetProgressBar').style.width = `${percent}%`;
    document.getElementById('budgetStatus').innerHTML = `$${monthlyTotal.toFixed(2)} spent of $${budgetAmount.toFixed(2)} budget (${percent.toFixed(0)}%)`;
  } else { document.getElementById('budgetProgressBar').style.width = '0%'; document.getElementById('budgetStatus').innerText = 'No budget set'; }
}

export function populateCategoryFilter(expenses) {
  const cats = [...new Set(expenses.map(e => e.category))];
  const filterSelect = document.getElementById('categoryFilter');
  filterSelect.innerHTML = '<option value="ALL">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}