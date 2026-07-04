### **Expense-Log: Interface Specifications**

**1. Home (Dashboard & Data Entry)**
The Home screen serves as the central command hub of the application, prioritizing rapid data entry and immediate financial visibility.

- **Balance Display:** A prominent central card displaying the current net balance (Profit), styled with emerald accents to indicate positive cash flow against the dark UI theme.
- **Quick Action Toggles:** Dedicated buttons for logging standard Income or Expenses.
- **Quick Add System:** A grid of pre-defined category pills (e.g., Food, Transport) designed for frictionless, one-tap logging of daily transactions, keeping the user interface entirely decoupled from the underlying database operations.

**2. Ledger (Transaction History)**
The Ledger provides a comprehensive, chronological record of all financial activity.

- **Transaction List:** A highly optimized, scrollable view rendering individual transaction records fetched from the local SQLite repository.
- **Accessible Filtering:** Filter chips located directly at the top of the screen, allowing the user to instantly query their transaction history by specific categories or data types without navigating through complex menus.

**3. Stats (Financial Analytics)**
This screen is dedicated to data visualization, transforming raw ledger data into actionable financial insights.

- **Categorical Breakdown:** A pie chart component illustrating the distribution of expenses across various categories, making it easy to identify spending habits.
- **Cash Flow Trends:** A line graph tracking the momentum of income and expenses over a selected time period.
- **Transaction Activity Heatmap:** A visual calendar-grid heatmap (similar to GitHub contributions) showing daily transaction frequencies or spend volumes over the last 90 days. Days are colored in shades of dark slate to bright emerald depending on activity level.

**4. Settings (Configuration & Preferences)**
The Settings screen provides modular controls for the application's configuration.

- **Management Controls:** A clean, block-based layout for managing custom categories, adjusting user preferences, and potentially housing data management options like local SQLite backups or CSV exports.
