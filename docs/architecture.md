# Architecture Documentation

## Overview

Expense-Log implements a strict Model-View-Controller (MVC) architecture adapted for React Native. Adhering to Clean Architecture principles, the application treats the domain logic and database operations as a "clean core." This ensures that business rules are strictly isolated from UI components and framework-specific implementations, creating a highly maintainable, testable, and scalable system.

---

## Directory Structure

```text
expense-log/
├── src/
│   ├── models/
│   │   ├── schema.ts               # Drizzle ORM table definitions
│   │   ├── types.ts                # TypeScript domain interfaces
│   │   └── ExpenseRepository.ts    # Database query abstractions
│   ├── views/
│   │   ├── screens/                # Main layout containers (e.g., HomeScreen)
│   │   └── components/             # Reusable UI fragments (e.g., QuickAddPills)
│   ├── controllers/
│   │   ├── useExpenseController.ts # Logic bridging Views and Models
│   │   └── useLedgerController.ts
│   ├── core/
│   │   ├── database.ts             # SQLite & Drizzle initialization
│   │   └── constants.ts            # Global application constants
│   └── App.tsx                     # Entry point and navigation wrapper
```

## Layer Responsibilities

### 1. Models (The Data Layer)

**Path:** `src/models/`
The Model layer is strictly reserved for data definition, business rules, and database interactions. It remains completely agnostic of React, React Native, and the user interface.

- **`schema.ts`:** Defines the SQLite tables (Transactions, Categories) using Drizzle ORM.
- **`types.ts`:** Contains the strict TypeScript interfaces representing core domain objects.
- **`ExpenseRepository.ts`:** Acts as the gatekeeper to the database. It contains the raw Drizzle queries (inserts, selects, aggregates) and abstracts the data access logic away from the rest of the application.

### 2. Views (The Presentation Layer)

**Path:** `src/views/`
Views are "dumb" components. Their sole responsibilities are rendering the UI using Tailwind CSS (NativeWind), displaying formatted data provided by the Controllers, and capturing user inputs.

- **`screens/`:** High-level views mapped to the Bottom Tab Navigator (Home, Ledger, Stats, Settings).
- **`components/`:** Modular, reusable UI elements (e.g., the emerald-accented Balance Card, custom buttons, category pills).
- **Constraint:** Views should rarely contain complex state transformations or `useEffect` hooks governing business logic.

### 3. Controllers (The Logic Layer)

**Path:** `src/controllers/`
In this React Native implementation, Controllers are designed as custom React Hooks. They serve as the necessary bridge between the strictly defined Models and the presentation-focused Views.

- **`useExpenseController.ts`:** Encapsulates specific feature logic. It processes user input from the View, validates data, triggers the appropriate repository functions in the Model, and manages local loading/error states.
- **Responsibility:** The Controller formats raw database models into the exact shape required by the View, ensuring the UI remains decoupled from database schema changes.

### 4. Core (Infrastructure)

**Path:** `src/core/`
This layer handles application-wide infrastructure and configurations that do not belong to a specific MVC domain.

- **`database.ts`:** Handles the instantiation of the SQLite connection and Drizzle ORM client.
- **`constants.ts`:** Stores globally required variables, such as theme configurations, standardized styling tokens, or predefined data sets.

---

## Data Flow Example

1. **Action:** The user taps a "Transport" Quick Add pill on the `HomeScreen` (View).
2. **Delegation:** The View immediately passes the raw input to `useExpenseController` (Controller).
3. **Processing:** The Controller validates the input, attaches a timestamp, and calls the `insertTransaction` method on the `ExpenseRepository` (Model).
4. **Execution:** The Model executes the Drizzle ORM query to save the record in SQLite and returns a success status.
5. **Update:** The Controller updates its local state or triggers a context refresh, which provides the newly calculated balance back to the View for rendering.
