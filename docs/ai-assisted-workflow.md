# AI-Assisted UI/UX and Feature Development Workflow

**Purpose**: This document outlines the standard operating procedure for designing, prototyping, and implementing new features, screens, or database interactions within **Expense-Log**. The goal is to prevent premature integration of unverified code, enforce strict MVC boundaries, and optimize resource allocation within Google Antigravity.

---

## Phase 1: Ideation & Concept Generation

Before any code is written or database schemas are modified, the architectural approach and user experience must be strictly defined.

- **User Action**: Provide the AI with raw specifications, feature concepts, or a wireframe layout for a specific view or model extension.
- **AI Directive**: The AI must respond with a categorized list of conceptual approaches. These suggestions must include:
  - **Visual Layouts**: How the screen elements or data structures should be organized for mobile interfaces.
  - **Psychological Framing**: How the design impacts friction-free daily expense logging (e.g., maximizing the speed of data entry via interactive elements).
  - **Thematic Alignment**: How it integrates with the established dark slate background and high-visibility emerald green accent aesthetic.
- **Outcome**: The user selects one specific concept or refined feature scope to advance to the sandbox.

---

## Phase 2: The Gemini Canvas Prototype (The Sandbox)

Once a concept is selected, its visual and layout parameters are verified in an isolated environment before generating actual React Native components.

- **User Action**: Command the AI to "Generate a prototype prompt for [Selected Concept]."
- **AI Directive**: The AI must output a strict, highly detailed prompt optimized for **Gemini Canvas**.
- **Prototype Prompt Constraints**:
  - **Self-Contained Mobile Canvas**: Must render as a single HTML file using Tailwind CSS via CDN, styled to emulate a mobile device container view.
  - **Zero External Dependencies**: Use inline SVGs and standalone components rather than external image assets or font libraries.
  - **State Simulation**: Use lightweight Vanilla JavaScript within a `<script>` tag solely for interactive simulation (e.g., clicking a category pill toggles active states, or updating entry views). No persistent application logic.
  - **Focus**: Purely for aesthetic evaluation, copy validation, spacing audits, and verifying Tailwind utility mapping.
- **Outcome**: The user reviews and refines the HTML mockup in Gemini Canvas. Spacing variables, typography hierarchies, and emerald highlight positions are locked in.

---

## Phase 3: Project Implementation & Model Selection

Once the visual layout is verified, the design and underlying requirements are ported into the codebase. This step enforces strict compliance with the project's MVC architecture and selects the optimal engine within Google Antigravity for the task.

### 1. Intelligence Allocation (Model Selection & Ranking)

Before generating the engineering prompt, the AI assistant must evaluate the engineering complexity of the task (e.g., UI component vs. raw Drizzle ORM transactions) and output a ranked recommendation from the available **Google Antigravity** model pool:

- Gemini 3.5 Flash (Low)
- Gemini 3.5 Flash (Medium)
- Gemini 3.5 Flash (High)
- Gemini 3.1 Pro (Low)
- Gemini 3.1 Pro (High)
- Claude Sonnet 4.6 (Thinking)
- Claude Opus 4.6 (Thinking)

The assistant will categorize the task and rank the top 3 models using the following evaluation framework:

- **High-Context Boilerplate / Simple UI Layouts**: Favor efficiency (e.g., _Gemini 3.5 Flash High/Medium_).
- **Complex Data Aggregation / Drizzle ORM Schema Migration / State Management Controllers**: Favor reasoning depth (e.g., _Claude Sonnet 4.6 Thinking_ or _Gemini 3.1 Pro High_).

### 2. Implementation Prompt Constraints

The AI then outputs a precision prompt tailored to the top-ranked model to execute code integration. The prompt must enforce:

- **Adherence to `docs/architecture.md`**: Enforce explicit separation across the layers:
  - **Models**: Core schema definitions via Drizzle ORM and encapsulated SQLite interactions inside repositories (`src/models/`).
  - **Views**: Purely layout and design presentation via NativeWind/Tailwind styles (`src/views/`).
  - **Controllers**: Feature-specific logic decoupled via custom React hooks (`src/controllers/`).
- **Tech Stack Alignment**: Strict usage of Expo, TypeScript types, and local SQLite data persistence methods.
- **No Black-Box Architectures**: All code modifications must use modular functions, provide complete definitions rather than placeholders, and leverage global tokens defined in the core configuration layer.

- **Outcome**: A modular, type-safe, and visually verified component or core feature is successfully integrated into the Expense-Log codebase.
