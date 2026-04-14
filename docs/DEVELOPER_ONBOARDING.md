# Developer Onboarding: Generic Product Finder

Welcome to the **Generic Product Finder**! This document serves as your comprehensive, end-to-end engineering guide. It consolidates the 22 core architectural specifications located in `architecture/` into an actionable overview. By the end of this guide, you will understand the system's purpose, its internal data pipelines, its database schemas, and how to safely extend its capabilities.

---

## 1. System Overview

The **Generic Product Finder** is an AI-powered opportunity discovery, scoring, and blueprinting engine. It automates the process of finding unserved niche markets by ingesting social signals (Reddit, HackerNews, Quora, etc.), triangulating demand, calculating competitive defensibility (Moats, CAC/LTV), and finally generating a step-by-step Go-To-Market execution blueprint.

### 1.1 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (`pg` library)
- **Testing:** Jest, `axios-mock-adapter`, `supertest`
- **Linting:** ESLint (flat config)

### 1.2 Core Philosophy
The codebase strictly adheres to a modular, OOP-based architecture.
- **Security First:** Raw `console.log` statements are forbidden in production logic (use `src/utils/logger.js`).
- **SQL Injection Prevention:** Every database query MUST utilize parameterized arrays (`$1, $2`).
- **Phase Cycle Rigidity:** The project was built over 10 distinct "Iterations," moving through `Research → Build → Test → QA Audit`. `SYSTEM_STATE.md` tracks the macro evolution of the repository.

---

## 2. Project Structure

```text
├── architecture/         # The 22 immutable spec documents (01_system_overview.md, etc.)
├── docs/                 # General documentation (this file)
├── planning/             # Temporary technical design blueprints mapped out during 'Research' phases
├── qa_reports/           # End-of-iteration macro audit reports proving architectural compliance
├── src/
│   ├── db/               # PostgreSQL connection pool and SQL migrations
│   ├── routes/           # Express REST API endpoints (e.g., payments.js, opportunities.js)
│   ├── services/         # The brain. Contains the 5-step Opportunity Engine.
│   │   ├── blueprints/   # BlueprintGenerator.js
│   │   ├── defense/      # AntiFraudEngine, DeliveryService, SmokeTestManager
│   │   ├── discovery/    # DiscoveryEngine.js (deduplication & triangulation)
│   │   ├── leads/        # LeadPipeline.js (CRM transitions)
│   │   ├── revenue/      # RevenueOptimizer.js (Funnel modeling, LTV projection)
│   │   ├── scoring/      # ScoringEngine.js (15-point criteria logic)
│   │   ├── source_modules/ # Web scrapers and API adapters (Reddit, HN, etc.)
│   │   └── validation/   # ValidationService.js (Moats, Legal Risk)
│   ├── utils/            # Helper utilities (logger.js)
│   ├── app.js            # Express app configuration & middleware
│   └── index.js          # Server entry point
├── tests/                # 100% Coverage Jest testing suite (unit & E2E)
├── .env.example          # Template for required environment variables
├── package.json
└── SYSTEM_STATE.md       # The historical tracker of the 10-Iteration Build process
```

---

## 3. The 5-Step Execution Pipeline (E2E Flow)

The heart of the application is a sequential data pipeline. To see this flow modeled programmatically, inspect `tests/e2e/e2e_pipeline.test.js`.

### Step 1: Ingestion (`SourceModuleManager.js`)
The `SourceModuleManager` manages a registry of adapter classes (e.g., `RedditModule`). It fires `scan()` across multiple APIs, scraping community chatter and looking for distinct `pain_quotes` and high `engagement_scores`.
- **Output:** An array of `rawSignals`.

### Step 2: Triangulation (`DiscoveryEngine.js`)
Raw signals are notoriously noisy. The `DiscoveryEngine` groups signals by semantic fingerprints (`deduplicateSignals()`). If a problem footprint appears across multiple sources (e.g., Reddit *and* HackerNews), its `triangulation_status` is upgraded to `corroborated` or `triangulated`.
- **Output:** A generalized `Opportunity` object (e.g., "AML compliance issues") persisted to the database.

### Step 3: Evaluation (`ScoringEngine.js`)
The `ScoringEngine` processes the newly created Opportunity against 15 predefined business vectors (e.g., *Willingness to Pay*, *Solo Feasibility*, *Market Size*). It evaluates "Kill Signals." If the business is fundamentally unviable (e.g., extreme legal liability), the system tags it as `killed`. Otherwise, it generates an evidence chain and a `raw_score`.
- **Output:** A mathematically weighted Opportunity score and recorded `evidence_chains`.

### Step 4: Defense & Moat Check (`ValidationService.js`)
Even if an idea is popular, it must be legally safe and economically viable.
- **Moat Assessment:** Evaluates network effects and technical complexity. If the product is easily commoditized, it's flagged.
- **CAC:LTV Math:** Verifies the estimated customer acquisition cost against the projected lifetime value. Must be > 2:1.
- **Legal Risk:** Ensures the product doesn't stray into Tier D (uninsurable medical/financial advice).
- **Output:** A final verdict (`Advance`, `Conditional`, or `Kill`).

### Step 5: The Master Plan (`BlueprintGenerator.js`)
For validated opportunities, the `BlueprintGenerator` synthesizes all prior data into a final JSON payload. It calculates price anchors, designs a multi-tiered funnel (FE, Bump, OTO1, OTO2, Sub), establishes the exact Distribution Strategy, and formats the 'Day 1 Launch Plan'.

---

## 4. Database & Data Models

All migrations live in `src/db/migrations/`.
The primary tables include:

1. **opportunities:** The core entity. Tracks name, niche, phase, `validated_score`, and `triangulation_status`.
2. **warm_leads:** A rudimentary CRM. Extracted from raw signal `usernames`. Tracks `lead_temperature` (cold/warm/hot) and contact logs. *(Handled by `LeadPipeline.js` and `SmokeTestManager.js`)*.
3. **source_registry:** Configuration metrics deciding which API scrapers to run.
4. **orders / subscriptions:** Payment records for the final generated products.
5. **fraud_events:** Security logs generated by the `AntiFraudEngine` (bulk downloads, chargebacks).

### Database Rules:
- **Never write raw queries containing user input.** Always use `pg` parameter arrays: `db.query('SELECT * FROM users WHERE email = $1', [req.body.email])`.
- Complex data structures (like funnel trees) are occasionally stored as `JSONB` in PostgreSQL to allow flexible iteration.

---

## 5. Webhooks & Anti-Fraud Architecture

Digital products are highly susceptible to refund abuse and piracy.

### Payments (`src/routes/payments.js`)
The Express API exposes `/api/payments/webhook`. It securely accepts raw payloads (`express.raw()`) to facilitate future HMAC verification. It gracefully maps standardized events across Stripe/Lemon Squeezy (`payment.completed`, `refund.completed`, `dispute.created`).

### Anti-Fraud (`AntiFraudEngine.js`)
Every time a webhook fires or a download is requested, the Anti-Fraud Engine executes 4 core rules:
1. **Bulk Downloads:** (>5 downloads in 30 mins triggers rate limits).
2. **Suspicious IPs:** (3+ unique IPs accessing the same account in 24 hours).
3. **Serial Refunders:** (2+ refunds in a 12-month window auto-flags the account).
4. **Chargebacks:** Instantly revokes portal access.

---

## 6. QA & Testing Protocol

The repository relies on a robust Jest test suite that guarantees compliance.

### Running Tests
Execute the entire suite:
```bash
npm test
```
- **Unit Tests:** Found alongside service directories (`tests/defense/*`, `tests/scoring/*`).
- **E2E Tests:** `tests/e2e/e2e_pipeline.test.js` tracks the 5-step flow. It heavily mocks `db.query` to simulate persistence safely without requiring a live Postgres instance on CI environments.
- **Mocking APIs:** External API calls (like fetching Reddit JSON) are intercepted using `axios-mock-adapter`.

### The QA Audit Phase
During `SYSTEM_STATE.md` milestones (Iterations 5 and 10), a strict QA Protocol was enforced (`QA_PROTOCOL.md`). This process requires the manual generation of `qa_reports/QA_REPORT_ITERATION_X.md` to prove 100% adherence to the `architecture/` documents.
**Rule of Thumb:** If it isn't defined in the `architecture/` folder, it does not belong in the `src/` folder.

---

## 7. Adding New Features

If you want to add a new data scraper (e.g., TikTok Comments):
1. **Create the Adapter:** Add `src/services/source_modules/adapters/tiktok.js` extending the base `SourceModule` class.
2. **Register It:** Add it to the constructor object in `SourceModuleManager.js`.
3. **Mock & Test:** Create `tests/source_modules/tiktok.test.js`. Mock the Axios network request and ensure it returns an array of `SignalResult` objects mapping exactly to the schema.
4. **Document:** Ensure the new data parameters are noted in the overarching `DEVELOPER_ONBOARDING.md` or relevant architecture spec.

If you are extending the Express REST API:
1. Ensure the route maps to `architecture/16_app_architecture.md`.
2. Add the route file inside `src/routes/`.
3. Mount it in `src/routes/index.js`.
4. Validate it against the linter: `npm run lint`.