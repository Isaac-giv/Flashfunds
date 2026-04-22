# FlashFunds — Smart Expense Tracker

A privacy-first, local storage expense tracking application. Track your expenses, set monthly budgets, and visualize your spending habits — all without accounts or cloud storage.

## Features

- **Visual Analytics** — Beautiful charts showing spending by category and 7-day trends
- **Budget Tracking** — Set monthly budgets with visual progress bars
- **Smart Filtering** — Search and filter expenses by category
- **Export Data** — Export all your data to JSON anytime
- **Private by Design** — All data stored locally, no accounts required

## Getting Started

1. Open `index.html` in a web browser
2. Click "Get Started Free" to create an account
3. Start tracking your expenses!

## Tech Stack

- HTML5, CSS3 (Tailwind CSS)
- Vanilla JavaScript (ES6 Modules)
- Chart.js for visualizations
- LocalStorage for data persistence

## Project Structure

```
FlashFunds/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Custom styles
└── js/
    ├── main.js         # Application entry point
    ├── auth.js        # Authentication (signup/login)
    ├── expense.js    # Expense CRUD operations
    ├── dashboard.js  # Dashboard & charts
    ├── router.js     # Client-side routing
    ├── config.js      # Configuration & storage keys
    └── theme.js       # Theme management
```

## Usage

### Adding Expenses
Fill in the expense form with description, amount, category, and date.

### Setting Budgets
Enter a budget amount and click "Set" to track your monthly spending.

### Filtering
Use the search box and category dropdown to filter expenses.

### Exporting Data
Click "Export JSON" to download a backup of all your data.

## License

MIT