# Frontend Missing Pieces: Generic Product Finder

Based on the architectural specifications (`16_app_architecture.md` and `11_intelligence_dashboard.md`), the current `frontend` directory is almost completely empty (only containing a `package-lock.json`).

The following is a detailed, comprehensive list of all the missing pieces required to build the frontend Single Page Application (SPA).

## 1. Setup & Configuration

The foundational tooling and environment configuration for the SPA is entirely missing:
- **`package.json`**: Needs dependency definitions (React, Vite, Tailwind CSS, TypeScript, React Router, etc.).
- **Vite Configuration (`vite.config.ts`)**: Setup for the Vite build tool.
- **TypeScript Configuration (`tsconfig.json` / `tsconfig.node.json`)**: Strict typing setup for the project.
- **Tailwind CSS Configuration (`tailwind.config.js` / `postcss.config.js`)**: Design system and utility class configuration.
- **shadcn/ui Setup (`components.json`)**: Configuration for the shadcn/ui component library, as recommended in the architecture.
- **Environment Variables (`.env.example` / `.env`)**: API URL configurations.

## 2. Core Foundation & Routing

The basic structure to bootstrap the React application:
- **`index.html`**: Entry point HTML file.
- **`src/main.tsx`**: Bootstraps React, sets up global providers (Theme, Auth, Query Client).
- **`src/App.tsx`**: Main application component.
- **Routing Setup**: Implementation of `react-router-dom` to map all application routes.
- **Layout Components**:
  - Main Layout with a sidebar/navbar for navigating between Dashboard, Pipeline, Leads, Calendar, Settings.
  - Authentication Layout (Login/Register views).

## 3. Pages & Views

The specific page components mapped to the application routes:
- **Dashboard (`/`)**: Must include Pipeline funnel, Alerts, Key metrics, Lead pool summary, Calendar preview, and Signal trends.
- **Opportunities List (`/opportunities`)**: Cards with filters, sorting, and search functionalities.
- **Opportunity Detail (`/opportunities/:id`)**: Detailed view with Score breakdown, Evidence drill-down list, Competitor table, Lead count, and Phase controls.
- **Leads List (`/leads`)**: Table of warm leads with filters, temperature tags (Cold, Warm, Hot, Converted), and outreach status.
- **Lead Detail (`/leads/:id`)**: Full lead profile, outreach history, and linked opportunities.
- **Calendar (`/calendar`)**: Gantt-style timeline view of regulatory deadlines, color-coded by urgency.
- **Runs (`/runs`)**: Run history list, delta summaries, and trend charts.
- **Sources (`/sources`)**: Source module list with enable/disable toggles and quality metrics.
- **Calibration (`/calibration`)**: Criterion weight table, correlation data, and historical adjustments.
- **Blueprint View (`/blueprints/:id`)**: Full rendered blueprint document visualization.
- **Settings (`/settings`)**: Forms for User profile, Niche config, Schedule, API keys, and notification preferences.

## 4. Reusable UI Components (shadcn/ui & Custom)

Complex UI patterns defined in the architecture that need to be created as reusable components:
- **Kanban Pipeline**: Drag-and-drop or visual progression board (Discovery → Scored → Validated → Smoke Tested → Blueprinted).
- **Score Cards**: Quick-scan UI displaying name, score, maturity badge, lead count, velocity, and format count.
- **Evidence Drill-down**: Accordion or modal component to click any score and see supporting evidence/source links.
- **Temperature Tags**: Color-coded badges for Leads (🔵 Cold, 🟡 Warm, 🔴 Hot, ✅ Converted).
- **Calendar Timeline Component**: Custom Gantt chart implementation for deadlines.
- **Comparison Table**: Side-by-side tabular layout for evaluating 2-3 opportunities in Blueprints.
- **Base UI Library**: Standard components (Buttons, Inputs, Modals, Tables, Dropdowns, Cards, Alerts) built via shadcn/ui.

## 5. API Integration & State Management

Data fetching layers to interact with the backend Express application (`/api` endpoints):
- **API Client**: Axios or Fetch wrapper configured with JWT interceptors for Authentication.
- **Data Fetching Hooks**: Custom hooks (e.g., using React Query or SWR) for:
  - `Auth`: Login, Register, Profile (`/api/auth/*`)
  - `Opportunities`: CRUD, Evidence, Competitors, Phase Transitions (`/api/opportunities/*`)
  - `Leads`: CRUD, Outreach Actions, Stats (`/api/leads/*`)
  - `Sources`: List, Config Updates, Quality (`/api/sources/*`)
  - `Runs`: History, Delta Summaries (`/api/runs/*`)
  - `Calendar`: Deadlines, Niche Filtering (`/api/calendar/*`)
  - `Intelligence`: Dashboard Metrics, Calibration, Alerts (`/api/intelligence/*`)
  - `Blueprints`: Fetch, Generate (`/api/blueprints/*`)
- **Global State**: Client-side state for the current logged-in user, active theme, and UI toggle states (like sidebar open/close).

## 6. Authentication & Security Handling

- **JWT Management**: Secure storage of JWT tokens (in memory or HTTP-only cookies) and logic for refreshing tokens (`/api/auth/refresh`).
- **Protected Routes**: React Router guards to redirect unauthenticated users to the Login page.
- **Role/Access Management**: Hiding UI elements based on user permissions or missing configurations (e.g., disabling Run triggers if no sources are enabled).

## 7. Build, Testing & Tooling

- **Testing Setup**: Vitest and React Testing Library configuration for frontend unit tests.
- **Linting & Formatting**: ESLint (flat config) and Prettier configurations for frontend standards.
- **Verification Scripts**: Playwright setup for frontend automated E2E testing as defined in the memory protocol.