# Expense-Log

A highly functional, offline-first personal expense tracker. Designed with a sleek, dark slate and emerald-accented aesthetic, Expense-Log prioritizes rapid data entry, strict architectural boundaries, and immediate financial visibility.

Built using MVC architecture (Model, View, Controller) principles, the application strictly decouples the UI components from the core domain logic and local database operations, ensuring a highly maintainable and scalable codebase.

## ❗❗ DISCLAIMER ❗❗

I built this app to track my own expenses, but feel free to make it your own! If you like the setup, go ahead and clone the repository to customize it however you want.

## Tech Stack

- **Framework:** React Native with Expo
- **Programming Language:** TypeScript
- **Database:** SQLite3 (Local, offline-first storage)
- **ORM:** Drizzle ORM (Type-safe, robust data access)
- **Styling:** Tailwind CSS

## Interface Specifications

**1. Home (Dashboard & Data Entry)**
The Home screen serves as the central command hub of the application, prioritizing rapid data entry and immediate financial visibility.

- **Balance Display:** A prominent central card displaying the current net balance (Profit), styled with emerald accents to indicate positive cash flow against the dark UI theme.
- **Quick Action Toggles:** Dedicated buttons for logging standard Income or Expenses.
- **Quick Add System:** A grid of pre-defined category pills (e.g., Food, Transport) designed for frictionless, one-tap logging of daily transactions.

**2. Ledger (Transaction History)**
The Ledger provides a comprehensive, chronological record of all financial activity.

- **Transaction List:** A highly optimized, scrollable view rendering individual transaction records fetched from the local SQLite repository.
- **Accessible Filtering:** Filter chips located directly at the top of the screen, allowing the user to instantly query their transaction history by specific categories or data types without navigating through complex menus.

**3. Stats (Financial Analytics)**
This screen is dedicated to data visualization, transforming raw ledger data into actionable financial insights.

- **Categorical Breakdown:** A pie chart component illustrating the distribution of expenses across various categories, making it easy to identify spending habits.
- **Cash Flow Trends:** A line graph tracking the momentum of income and expenses over a selected time period.

**4. Settings (Configuration & Preferences)**
The Settings screen provides modular controls for the application's configuration.

- **Management Controls:** A clean, block-based layout for managing custom categories, adjusting user preferences, and potentially housing data management options like local SQLite backups or CSV exports.

## Running Locally with Expo Go

Follow these steps to run the application on your local machine and physical device:

### Prerequisites

- Node.js installed on your machine.
- The **Expo Go** app installed on your iOS or Android device.

### Setup Instructions

1.  **Clone the repository and navigate to the project directory:**

    ```bash
    git clone https://github.com/DragunWF/Expense-Log
    cd Expense-Log
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or yarn install
    ```

3.  **Create `.env` file at the root directory with the following content:**

    ```
    DB_FILE_NAME=file:local.db
    ```

4.  **Run the development server:**

    ```bash
    npx expo start
    ```

5.  **Connect your device:**
    - Open the Expo Go app on your phone.
    - Scan the QR code displayed in your terminal (or browser window) to launch Expense-Log.
