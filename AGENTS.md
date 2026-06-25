# Expense-Log AI Developer Workspace Rules

## Project Overview

- Expense-Log is a highly functional, offline-first personal expense tracker.
- The application is designed to prioritize rapid data entry and immediate financial visibility.
- The visual identity strictly relies on a dark slate background paired with high-visibility emerald green accents.

---

## 1. Technology Stack & Dependency Protocol

**Primary Stack:**

- **Core framework:** React Native with Expo, written strictly in TypeScript.
- **Database:** Offline-first SQLite3 local storage.
- **Data Access:** Drizzle ORM to ensure type-safe and robust database queries.
- **Styling:** Tailwind CSS integrated strictly via NativeWind.

**Dependency Protocol (Suggest First):** While the stack above is our foundation, you are permitted to suggest well-known, highly optimized alternative frameworks or dependencies if they provide a significantly better solution to a problem. **However, you must strictly follow the "Suggest First" protocol:** You must never write code importing external libraries outside of the primary stack unless you have explicitly proposed the dependency first and the user has explicitly approved its installation.

---

## 2. Strict MVC Architecture

Expense-Log adheres strictly to a Clean Architecture approach utilizing a customized Model-View-Controller (MVC) pattern for React Native. You must respect these layer boundaries:

- **Models (`src/models/`):** This layer is strictly reserved for Drizzle ORM schemas (`schema.ts`), TypeScript interfaces (`types.ts`), and raw database interactions (`ExpenseRepository.ts`). It must remain completely agnostic of React, React Native, and UI components.
- **Views (`src/views/`):** Treat these as purely presentational, "dumb" components. Never place complex state transformations or business-logic `useEffect` hooks here. Views must solely render UI with NativeWind and capture user input.
- **Controllers (`src/controllers/`):** Build Controllers strictly as custom React Hooks (e.g., `useExpenseController.ts`). These hooks are the sole bridge that processes inputs and formats raw database models into the specific shapes required by the Views.
- **Core (`src/core/`):** Reserve this layer for infrastructure, such as the SQLite connection instantiation (`database.ts`) and global styling tokens/constants (`constants.ts`).

---

## 3. SOLID Principles in React Native

Apply SOLID principles to fit the project's specific architecture:

- **Single Responsibility Principle (SRP):** Components should do one thing. If a View is handling both UI rendering and data fetching, you must refactor the fetching logic into a Controller hook.
- **Dependency Inversion:** Ensure the SQLite connection and global styling tokens are decoupled into the `src/core/` layer.
- **Interface Segregation:** Always rely on the strict TypeScript interfaces defined in `src/models/types.ts` rather than passing generic `any` types or bloated prop objects to components.

---

## 4. Documentation & Source of Truth Directives

Before generating code, you must read the application documentation:

- Before starting a new feature, review `docs/architecture.md` for structural guidelines.
- Review `docs/screens.md` to ensure UI components align with the dashboard, ledger, stats, or settings specifications.
- Consult `docs/ai-assisted-workflow.md` to ensure the generated code aligns with the correct implementation phase and model selection strategy.

---

## 5. React Native & Project-Specific Constraints

To maintain idiomatic code that supports rapid data entry, you must follow these absolute constraints:

- **Strict Component Modularity:** When implementing new features, views, or UI elements, never build massive, monolithic screen files. You must aggressively break down interfaces into isolated, highly reusable components within `src/views/components/` (e.g., custom buttons, category pills, balance cards) to keep the presentation layer modular and maintainable.
- **No DOM Elements:** Explicitly forbidden to use HTML tags (`<div>`, `<span>`, `<p>`). You must enforce the use of React Native primitives (`<View>`, `<Text>`, `<Pressable>`).
- **Offline-First Mandate:** Never write standard REST API `fetch` calls unless explicitly requested. All data operations must default to the local SQLite `ExpenseRepository`.
- **Styling Exclusivity:** Inline styling (`style={{...}}`) and `StyleSheet.create` are strictly forbidden. Require all visual layouts to utilize Tailwind utility classes via NativeWind.
- **Performance Optimization:** The application requires a highly optimized, scrollable transaction list in the Ledger. Default to `FlashList` (if supported) or highly optimized `FlatList` implementations. Always utilize `useMemo` and `useCallback` to prevent unnecessary re-renders.
- **No Black-Box Architectures:** All code modifications must use modular functions, provide complete definitions rather than placeholders, and leverage global tokens defined in the core configuration layer.

---

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
