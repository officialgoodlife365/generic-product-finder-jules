# AGENTS.md: AI Developer Onboarding

> **ATTENTION AI AGENTS:** This file contains critical operational instructions, architectural boundaries, and programmatic constraints for working on the Generic Product Finder repository. You MUST adhere to these rules strictly.

## 1. System Architecture Context

This repository is a Node.js/Express.js backend application built using a strict, document-driven 10-Iteration pipeline (now successfully completed). It operates as an AI-powered product discovery and blueprinting engine.

**Core Data Flow:**
1. `src/services/source_modules/SourceModuleManager.js`: Scrapes APIs (Reddit, HackerNews, etc.).
2. `src/services/discovery/DiscoveryEngine.js`: Deduplicates and clusters semantic signals into "Opportunities".
3. `src/services/scoring/ScoringEngine.js`: Mathematically weights 15 distinct business criteria.
4. `src/services/validation/ValidationService.js`: Tests Moat defensibility and LTV:CAC ratios (>2:1).
5. `src/services/blueprints/BlueprintGenerator.js`: Formulates the final Go-To-Market execution plan.

## 2. Hard Constraints & Rules

* **DO NOT USE `console.log` IN PRODUCTION CODE.** Always use the environment-aware logger imported from `src/utils/logger.js`.
* **PREVENT SQL INJECTION:** Every single database query executed via the `pg` pool MUST use parameterized arrays. Example: `db.query('SELECT * FROM table WHERE id = $1', [id])`. Never use string concatenation for SQL.
* **RESTRICTED MODULES:** Node.js built-in globals like `Buffer` must be explicitly required (`const { Buffer } = require('buffer');`) to prevent ESLint `no-undef` failures.
* **ENVIRONMENT VARIABLES:** Do not hardcode API keys, secrets, or database credentials. Use `process.env`.
* **COMMONJS IMPORTS:** This repository uses CommonJS (`require` / `module.exports`). Do NOT use ES modules (`import` / `export`).

## 3. Database Schema Knowledge
* The database is PostgreSQL. Migrations are located in `src/db/migrations/`.
* **Lead Tracking:** Leads are stored in the `warm_leads` table (NOT `leads`). Important columns are `lead_temperature` (cold/warm/hot) and `contacted_at`.
* **Security Logs:** Fraud events (chargebacks, bulk downloads) are stored in the `fraud_events` table.
* **Core Table:** Ideas are persisted to the `opportunities` table, which includes fields like `validated_score`, `triangulation_status`, and JSON arrays for `source_urls`.

## 4. Testing Protocol
* The testing framework is Jest. Run tests using `npm test`.
* **Maintain 100% Pass Rate:** If you modify code, you must run the test suite and ensure all tests pass.
* **End-to-End Mocks:** See `tests/e2e/e2e_pipeline.test.js` for an example of how to securely mock PostgreSQL `db.pool` and external API adapters (`axios-mock-adapter`) for pipeline integration tests.

## 5. Modifying Application Logic
* If the user requests a new feature, first check if it aligns with the core architectural design documented in the `architecture/` folder.
* **Adding API Routes:** Mount new routes in `src/routes/index.js` and implement the logic in dedicated files within `src/routes/`.
* **Adding Source Modules:** Extend the base class in `src/services/source_modules/adapters/` and register the new class in the constructor of `SourceModuleManager.js`.

## 6. Pre-Commit Steps
Before completing your task:
1. Verify code formatting and linting: `npm run lint`.
2. Ensure all tests pass: `npm test`.
3. Verify your changes do not violate the constraints listed above.