# Frontend Foundation and Initial Integration - Iteration 11 Design

## Objective
Migrate the existing Node.js backend out of the repository root, establish an NPM workspace monorepo, and initialize the core React + Vite + Tailwind CSS Single Page Application inside the `frontend/` directory.

## Architectural Adherence
This iteration serves as the groundwork required to begin consuming the APIs defined across the architecture documents (e.g., `16_app_architecture.md`, `11_intelligence_dashboard.md`). While the backend is fully complete (Iterations 1-10), the frontend is now being built to interface with it.

## Scope
1. **Monorepo Setup**:
    * Create a root `package.json` for NPM Workspaces.
    * Move `src/`, `tests/`, `docs/`, `scripts/`, `qa_reports/`, `planning/`, `package.json`, `package-lock.json`, and `.eslintrc` into a new `backend/` directory.
2. **Frontend Scaffold**:
    * Create a `frontend/` workspace directory.
    * Scaffold a Vite React app (`npm init -y`, `vite`, `@vitejs/plugin-react`).
    * Install Tailwind CSS, PostCSS, and Autoprefixer.
    * Write base `tailwind.config.js` and `postcss.config.js`.
    * Construct the initial boilerplate code: `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`.
3. **Environment & Git Hygiene**:
    * Implement a strict root-level `.gitignore` tracking logic.
    * Force clear nested `node_modules/` or `dist/` caching issues from previous backend branches.
4. **Verification**:
    * Validate the frontend builds with `npm run build`.
    * Verify the local dev server starts using Playwright testing logic.

## Validation Strategy
The new structure will decouple the UI build from the API. The `frontend/` workspace is strictly separated but will eventually utilize proxying (or direct Axios calls) to interact with `backend/src/app.js` processes running on a separate port.
