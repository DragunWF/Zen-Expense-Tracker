# Expense-Log AI Developer Workspace Rules

## Project Overview

- [cite_start]Expense-Log is a highly functional, offline-first personal expense tracker[cite: 3, 62].
- [cite_start]The application is designed to prioritize rapid data entry and immediate financial visibility[cite: 4, 63].
- [cite_start]The visual identity strictly relies on a dark slate background paired with high-visibility emerald green accents[cite: 5, 64].

---

## 1. Technology Stack Boundaries

Do not attempt to import unsupported libraries or utilize alternative frameworks outside of this defined stack:

- [cite_start]**Core framework:** React Native with Expo, written strictly in TypeScript[cite: 6, 65].
- [cite_start]**Database:** Offline-first SQLite3 local storage[cite: 7, 66].
- [cite_start]**Data Access:** Drizzle ORM to ensure type-safe and robust database queries[cite: 8, 66].
- [cite_start]**Styling:** Tailwind CSS integrated strictly via NativeWind[cite: 9, 67].

---

## 2. Strict MVC Architecture

[cite_start]Expense-Log adheres strictly to a Clean Architecture approach utilizing a customized Model-View-Controller (MVC) pattern for React Native[cite: 10, 68]. You must respect these layer boundaries:

- [cite_start]**Models (`src/models/`):** This layer is strictly reserved for Drizzle ORM schemas (`schema.ts`), TypeScript interfaces (`types.ts`), and raw database interactions (`ExpenseRepository.ts`)[cite: 11, 69]. [cite_start]It must remain completely agnostic of React, React Native, and UI components[cite: 34, 70].
- [cite_start]**Views (`src/views/`):** Treat these as purely presentational, "dumb" components[cite: 12, 71]. [cite_start]Never place complex state transformations or business-logic `useEffect` hooks here[cite: 36, 72]. [cite_start]Views must solely render UI with NativeWind and capture user input[cite: 37, 73].
- [cite_start]**Controllers (`src/controllers/`):** Build Controllers strictly as custom React Hooks (e.g., `useExpenseController.ts`)[cite: 13, 74]. [cite_start]These hooks are the sole bridge that processes inputs and formats raw database models into the specific shapes required by the Views[cite: 13, 75].
- [cite_start]**Core (`src/core/`):** Reserve this layer for infrastructure, such as the SQLite connection instantiation (`database.ts`) and global styling tokens/constants (`constants.ts`)[cite: 14, 76].

---

## 3. SOLID Principles in React Native

Apply SOLID principles to fit the project's specific architecture:

- [cite_start]**Single Responsibility Principle (SRP):** Components should do one thing[cite: 40, 77]. [cite_start]If a View is handling both UI rendering and data fetching, you must refactor the fetching logic into a Controller hook[cite: 41, 78].
- [cite_start]**Dependency Inversion:** Ensure the SQLite connection and global styling tokens are decoupled into the `src/core/` layer[cite: 42, 79].
- [cite_start]**Interface Segregation:** Always rely on the strict TypeScript interfaces defined in `src/models/types.ts` rather than passing generic `any` types or bloated prop objects to components[cite: 43, 80].

---

## 4. Documentation & Source of Truth Directives

[cite_start]Before generating code, you must read the application documentation[cite: 45, 81]:

- [cite_start]Before starting a new feature, review `docs/architecture.md` for structural guidelines[cite: 46, 81].
- [cite_start]Review `docs/screens.md` to ensure UI components align with the dashboard, ledger, stats, or settings specifications[cite: 47, 82].
- [cite_start]Consult `docs/ai-assisted-workflow.md` to ensure the generated code aligns with the correct implementation phase and model selection strategy[cite: 48, 83].

---

## 5. React Native & Project-Specific Constraints

To maintain idiomatic code that supports rapid data entry, you must follow these absolute constraints:

- [cite_start]**No DOM Elements:** Explicitly forbidden to use HTML tags (`<div>`, `<span>`, `<p>`)[cite: 49, 84]. [cite_start]You must enforce the use of React Native primitives (`<View>`, `<Text>`, `<Pressable>`)[cite: 50, 85].
- [cite_start]**Offline-First Mandate:** Never write standard REST API `fetch` calls unless explicitly requested[cite: 51, 86]. [cite_start]All data operations must default to the local SQLite `ExpenseRepository`[cite: 52, 87].
- [cite_start]**Styling Exclusivity:** Inline styling (`style={{...}}`) and `StyleSheet.create` are strictly forbidden[cite: 53, 88]. [cite_start]Require all visual layouts to utilize Tailwind utility classes via NativeWind[cite: 54, 89].
- [cite_start]**Performance Optimization:** The application requires a highly optimized, scrollable transaction list in the Ledger[cite: 55, 90]. [cite_start]Default to `FlashList` (if supported) or highly optimized `FlatList` implementations[cite: 55, 91]. [cite_start]Always utilize `useMemo` and `useCallback` to prevent unnecessary re-renders[cite: 55, 92].
- [cite_start]**No Black-Box Architectures:** All code modifications must use modular functions, provide complete definitions rather than placeholders, and leverage global tokens defined in the core configuration layer[cite: 93].

---

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
