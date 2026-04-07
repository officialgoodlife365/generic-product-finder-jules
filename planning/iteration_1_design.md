# Iteration 1 Design Document: Backend Foundation & Database Schema

## Overview
Iteration 1 establishes the core backend foundation for the Generic Product Finder. It involves setting up an Express.js server, configuring a PostgreSQL connection, and implementing the core database schema (both core and analytics tables). It also lays out the basic API routing structure corresponding to the app architecture.

## Deliverables Checklist
- [ ] Express.js server with health check endpoint
- [ ] PostgreSQL connection module using environment variables
- [ ] Core database tables: `opportunities`, `warm_leads`, `evidence_chains`, `competitor_snapshots`
- [ ] Analytics tables: `discovery_runs`, `source_registry`, `source_quality_metrics`, `regulatory_calendar`, `launched_outcomes`
- [ ] Database migration system
- [ ] Basic API routing structure matching `16_app_architecture.md`
- [ ] Jest test suite for DB connections and API routes

## Architecture Review
Based on reading the following architecture files:
1.  **`15a_database_schema_core.md`:** Details the core data schema including `opportunities`, `warm_leads`, `evidence_chains`, `competitor_snapshots`, `discovery_runs`, and `launched_outcomes`.
2.  **`15b_database_schema_analytics.md`:** Details the analytics schema including `regulatory_calendar`, `source_registry`, and `source_quality_metrics`. Also provides guidance on cross-table queries and PostgreSQL migrations.
3.  **`16_app_architecture.md`:** Specifies the Express API endpoints structure (Auth, Opportunities, Warm Leads, Source Modules, Discovery Runs, Regulatory Calendar, Intelligence, Blueprints & Outcomes) and the required service layer mapping. Note: While `16_app_architecture.md` recommends FastAPI for the backend, `JULES_START_HERE.md` strictly mandates a Tech Stack of `Node.js 20+`, `Express.js`, `Jest`, `PostgreSQL`, `Axios`, and `dotenv`. I will strictly adhere to the Node/Express stack.

## Implementation Details

### 1. Database Configuration (PostgreSQL)
-   Use `pg` (node-postgres) library to manage PostgreSQL connections.
-   Database connection URL will be retrieved from the `DATABASE_URL` environment variable via `dotenv`.
-   Create a connection pool module (`src/db/index.js`) to handle database queries.

### 2. Database Migration System
-   Implement a basic migration system to run initialization scripts.
-   Create `src/db/migrations/001_initial_schema.sql` which will contain the `CREATE TABLE` statements for:
    -   `opportunities`
    -   `warm_leads`
    -   `evidence_chains`
    -   `competitor_snapshots`
    -   `discovery_runs`
    -   `launched_outcomes`
    -   `regulatory_calendar`
    -   `source_registry`
    -   `source_quality_metrics`
-   Convert SQLite data types from the architecture documents to PostgreSQL equivalents:
    -   `INTEGER PRIMARY KEY AUTOINCREMENT` -> `SERIAL PRIMARY KEY`
    -   `TEXT` -> `TEXT` or `VARCHAR`
    -   `REAL` -> `DECIMAL(10,2)` or `FLOAT`
    -   JSON stored as `TEXT` -> `JSONB`
    -   Boolean integers -> `BOOLEAN`
    -   `datetime('now')` -> `CURRENT_TIMESTAMP`
-   Create a script (`src/db/migrate.js`) to execute these SQL files on startup or via a separate npm script.
-   Include default data insertion for `source_registry`.

### 3. Express.js Server Setup
-   Initialize an Express application in `src/index.js` or `src/app.js`.
-   Configure basic middleware: `express.json()` for parsing JSON bodies.
-   Create a basic `GET /health` endpoint that returns a 200 status and "OK".

### 4. API Routing Structure
-   Set up an API router in `src/routes/index.js` prefixing all routes with `/api`.
-   Create stub route files matching the design in `16_app_architecture.md`:
    -   `src/routes/auth.js` (/api/auth)
    -   `src/routes/opportunities.js` (/api/opportunities)
    -   `src/routes/leads.js` (/api/leads)
    -   `src/routes/sources.js` (/api/sources)
    -   `src/routes/runs.js` (/api/runs)
    -   `src/routes/calendar.js` (/api/calendar)
    -   `src/routes/intelligence.js` (/api/intelligence)
    -   `src/routes/blueprints.js` (/api/blueprints)
    -   `src/routes/outcomes.js` (/api/outcomes)
-   These routes will only contain basic placeholders (e.g., returning 501 Not Implemented or empty arrays) for this iteration, establishing the required scaffolding.

### 5. Testing (Jest)
-   Set up Jest configuration.
-   Create test files in the `tests/` directory:
    -   `tests/db.test.js`: To verify connection pooling and simple query execution.
    -   `tests/api.test.js`: To verify that the Express app starts and the `/health` endpoint and basic route prefixes are correctly mounted.

### 6. Dependency Management
-   Add necessary production dependencies: `express`, `pg`, `dotenv`.
-   Add development dependencies: `jest`, `supertest` (for API testing).

## Summary
The goal of the upcoming Build phase is strictly to lay the plumbing for the application. No business logic (discovery engine, scoring, validation) will be implemented yet. Success is defined by a running Express server, a working PostgreSQL connection with a fully migrated schema, and a passing test suite.
