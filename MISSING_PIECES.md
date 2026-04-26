# Missing Backend Components List

This document outlines all the missing, stubbed, or mocked components within the Generic Product Finder backend application. It was compiled by auditing the `src/routes`, `src/services`, architectural documentation, and the roadmap.

## 1. API Endpoints (Not Implemented)
Based on `architecture/16_app_architecture.md`, the following API endpoints are currently stubbed returning `501 Not Implemented Yet`:

### Authentication (`src/routes/auth.js`)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PUT /api/auth/me`

### Opportunities (`src/routes/opportunities.js`)
- `GET /api/opportunities`
- `GET /api/opportunities/:id`
- `POST /api/opportunities`
- `PUT /api/opportunities/:id`
- `DELETE /api/opportunities/:id`
- `GET /api/opportunities/:id/evidence`
- `POST /api/opportunities/:id/evidence`
- `GET /api/opportunities/:id/competitors`
- `POST /api/opportunities/:id/competitors`
- `GET /api/opportunities/:id/leads`
- `GET /api/opportunities/:id/blueprint`
- `POST /api/opportunities/:id/transition`

### Leads (`src/routes/leads.js`)
- `GET /api/leads`
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `POST /api/leads/:id/outreach`
- `GET /api/leads/stats`
- `GET /api/leads/export`

### Sources (`src/routes/sources.js`)
- `GET /api/sources`
- `GET /api/sources/:name`
- `PUT /api/sources/:name`
- `POST /api/sources/:name/test`
- `GET /api/sources/:name/quality`

### Runs (`src/routes/runs.js`)
- `GET /api/runs`
- `GET /api/runs/:id`
- `POST /api/runs`
- `GET /api/runs/latest`
- `GET /api/runs/:id/delta`

### Calendar (`src/routes/calendar.js`)
- `GET /api/calendar`
- `GET /api/calendar/upcoming`
- `GET /api/calendar/urgent`
- `POST /api/calendar`
- `PUT /api/calendar/:id`

### Intelligence & Alerts (`src/routes/intelligence.js`)
- `GET /api/intelligence/dashboard`
- `GET /api/intelligence/calibration`
- `GET /api/intelligence/alerts`
- `PUT /api/intelligence/alerts/:id/dismiss`
- `GET /api/intelligence/sources/quality`

### Blueprints (`src/routes/blueprints.js`)
- `GET /api/blueprints/:opportunity_id`
- `POST /api/blueprints/:opportunity_id/generate`

### Outcomes (`src/routes/outcomes.js`)
- `GET /api/outcomes`
- `POST /api/outcomes`
- `PUT /api/outcomes/:id`

---

## 2. Services: Mocked & Stubbed Functionality

### Source Modules (`src/services/source_modules/adapters`)
These currently contain mocked data or simulated behavior for Phase 1 scanning:
- `amazon_reviews.js`: MVP stub (Needs proxy/API e.g., Rainforest API)
- `gov_regulatory.js`: MVP stub (Simulates finding new regulation)
- `exploding_topics.js`: MVP stub (Needs headless scraping or paid API)
- `producthunt_g2.js`: MVP stub (Simulates finding review complaints)
- `youtube.js`: MVP mock (Needs real Google API key integration)
- `upwork_fiverr.js`: MVP stub (Simulates finding recurring gigs)
- `google_trends.js`: MVP stub (Simulates "rising" trends, needs `google-trends-api`)

### Delivery & Defense (`src/services/defense/DeliveryService.js`)
- `generateWatermarkStamp()`: Currently simulates watermark text. Needs real implementation (e.g., using `pdf-lib` or Python microservice to physically inject watermarks).

---

## 3. Webhook Infrastructure
### Payments Webhook (`src/routes/payments.js`)
- Missing HMAC signature verification for Stripe/LemonSqueezy webhooks. Need to uncomment logic and configure `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 4. Scheduling & Infrastructure
- **Cron Jobs**: No task scheduler is implemented. Needs `node-cron` or `BullMQ` to automatically trigger `DiscoveryEngine.runPhase1A()` and other periodic tasks defined in architecture (e.g., weekly runs, calendar scans, delta checks, alert checks).
- **LLM Integration**: Semantic string matching in `DiscoveryEngine.js` needs to be replaced with OpenAI `gpt-4o-mini` for high-fidelity clustering and sentiment analysis.
- **CI/CD**: Missing GitHub Actions workflow for automated testing and linting.
- **Frontend SPA**: The user interface (React/Vite/Tailwind) described in the architecture is entirely missing.
