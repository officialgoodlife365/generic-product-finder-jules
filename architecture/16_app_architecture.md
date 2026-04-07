# 16 — App Architecture

> System architecture for the standalone Opportunity Discovery application. Maps every document module to an API service, defines frontend components, authentication, scheduling, external integrations, deployment, and MVP scoping.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                          FRONTEND                              │
│  Dashboard │ Pipeline │ Leads │ Calendar │ Settings             │
└──────────┬─────────────────────────────────────────────────────┘
           │ REST API (JSON)
           ▼
┌────────────────────────────────────────────────────────────────┐
│                         API LAYER                              │
│  Auth │ Opportunities │ Leads │ Sources │ Runs │ Calendar      │
└──────────┬─────────────────────────────────────────────────────┘
           │
     ┌─────┼──────────────────────────────────┐
     │     │                                  │
     ▼     ▼                                  ▼
┌──────┐ ┌───────────────────────┐   ┌──────────────────┐
│  DB  │ │    SERVICE LAYER      │   │   SCHEDULER      │
│ PgSQL│ │                       │   │   (Cron Jobs)    │
│      │ │  DiscoveryEngine      │   │                  │
│      │ │  ScoringEngine        │   │  Weekly run      │
│      │ │  ValidationService    │   │  Calendar scan   │
│      │ │  LegalRiskEngine      │   │  Competitive     │
│      │ │  RevenueOptimizer     │   │    delta check   │
│      │ │  SmokeTestManager     │   │                  │
│      │ │  BlueprintGenerator   │   └──────────────────┘
│      │ │  IntelligenceEngine   │
│      │ │  LeadPipeline         │
│      │ │  SourceModuleManager  │
└──────┘ └───────────────────────┘
```

---

## Service Layer: Document-to-Service Mapping

| Document | Service Module | Primary Responsibility |
|----------|---------------|----------------------|
| [02a_source_modules_community.md](./02a_source_modules_community.md) | `SourceModuleManager` | Community source plugin registry, module execution, quality tracking |
| [02b_source_modules_data.md](./02b_source_modules_data.md) | `SourceModuleManager` | Data/marketplace source modules, trend analysis |
| [03_discovery_engine.md](./03_discovery_engine.md) | `DiscoveryEngine` | Phase 1A/1B orchestration, triangulation, freshness |
| [04_warm_lead_pipeline.md](./04_warm_lead_pipeline.md) | `LeadPipeline` | Lead CRUD, temperature management, outreach tracking |
| [05a_scoring_criteria.md](./05a_scoring_criteria.md) | `ScoringEngine` | Criterion scoring, weighted calculation, disqualification |
| [05b_scoring_evidence.md](./05b_scoring_evidence.md) | `ScoringEngine` | Evidence chains, calibration feedback loop |
| [06_validation_framework.md](./06_validation_framework.md) | `ValidationService` | Phase 3 research, re-scoring, verdict generation |
| [07a_legal_risk_engine.md](./07a_legal_risk_engine.md) | `LegalRiskEngine` | Precedent scanning, disclaimer tiers, insurance checks |
| [07b_legal_shields.md](./07b_legal_shields.md) | `LegalRiskEngine` | Product architecture, positioning language, protection checklist |
| [08a_revenue_pricing.md](./08a_revenue_pricing.md) | `RevenueOptimizer` | Price anchoring, format multiplication |
| [08b_revenue_funnels.md](./08b_revenue_funnels.md) | `RevenueOptimizer` | Funnel architecture, stress test, LTV modeling |
| [09_smoke_testing.md](./09_smoke_testing.md) | `SmokeTestManager` | Smoke test configuration, result tracking, lead upgrades |
| [10_blueprint_generator.md](./10_blueprint_generator.md) | `BlueprintGenerator` | Phase 4 document generation, portfolio analysis |
| [11_intelligence_dashboard.md](./11_intelligence_dashboard.md) | `IntelligenceEngine` | Run deltas, calibration, competitive monitoring, alerts |
| [15a_database_schema_core.md](./15a_database_schema_core.md) | `Database` (PostgreSQL) | Core data layer, migrations, queries |
| [15b_database_schema_analytics.md](./15b_database_schema_analytics.md) | `Database` (PostgreSQL) | Analytics, calibration, tracking tables |

---

## API Endpoint Design

### Authentication

```
POST   /api/auth/register     — Create account
POST   /api/auth/login         — Login, receive JWT
POST   /api/auth/refresh       — Refresh JWT token
GET    /api/auth/me             — Get current user profile
PUT    /api/auth/me             — Update profile/settings
```

### Opportunities

```
GET    /api/opportunities                       — List all (with filters, pagination)
GET    /api/opportunities/:id                    — Get one with full detail
POST   /api/opportunities                       — Create manually (user-injected idea)
PUT    /api/opportunities/:id                    — Update (scores, phase, metadata)
DELETE /api/opportunities/:id                    — Soft delete (archive)
GET    /api/opportunities/:id/evidence            — Get evidence chains
POST   /api/opportunities/:id/evidence            — Add evidence entry
GET    /api/opportunities/:id/competitors         — Get competitor snapshots
POST   /api/opportunities/:id/competitors         — Add competitor snapshot
GET    /api/opportunities/:id/leads               — Get linked warm leads
GET    /api/opportunities/:id/blueprint            — Get generated blueprint
POST   /api/opportunities/:id/transition           — Move to next phase (with validation)
```

### Warm Leads

```
GET    /api/leads                                — List all (with filters, pagination)
GET    /api/leads/:id                             — Get one with history
PUT    /api/leads/:id                             — Update (temperature, contact info)
POST   /api/leads/:id/outreach                    — Record outreach action
GET    /api/leads/stats                            — Dashboard statistics
GET    /api/leads/export                           — Export as CSV
```

### Source Modules

```
GET    /api/sources                              — List registered sources
GET    /api/sources/:name                         — Get source config + quality metrics
PUT    /api/sources/:name                         — Update config (enable/disable, priority)
POST   /api/sources/:name/test                    — Test-run a single source
GET    /api/sources/:name/quality                  — Quality history
```

### Discovery Runs

```
GET    /api/runs                                 — List all runs
GET    /api/runs/:id                              — Get run details + delta summary
POST   /api/runs                                 — Trigger a manual discovery run
GET    /api/runs/latest                            — Get most recent run
GET    /api/runs/:id/delta                         — Get run-over-run delta
```

### Regulatory Calendar

```
GET    /api/calendar                             — List all entries (filterable by date, niche)
GET    /api/calendar/upcoming                      — Next 90 days
GET    /api/calendar/urgent                        — Next 30 days
POST   /api/calendar                              — Add manual entry
PUT    /api/calendar/:id                           — Update entry
```

### Intelligence

```
GET    /api/intelligence/dashboard                — Full dashboard data
GET    /api/intelligence/calibration              — Scoring calibration status
GET    /api/intelligence/alerts                    — Active alerts
PUT    /api/intelligence/alerts/:id/dismiss        — Dismiss alert
GET    /api/intelligence/sources/quality           — Source quality report
```

### Blueprints & Outcomes

```
GET    /api/blueprints/:opportunity_id             — Get blueprint for opportunity
POST   /api/blueprints/:opportunity_id/generate    — Generate/regenerate blueprint
GET    /api/outcomes                               — List launched outcomes
POST   /api/outcomes                               — Record launch outcome
PUT    /api/outcomes/:id                            — Update outcome data (revenue, etc.)
```

---

## Frontend Components

### Page Structure

| Page | Route | Components | Data Source |
|------|-------|-----------|------------|
| **Dashboard** | `/` | Pipeline funnel, alerts, key metrics, lead pool summary, calendar preview, signal trends | `GET /intelligence/dashboard` |
| **Opportunities** | `/opportunities` | Opportunity cards with filters, sort, search | `GET /opportunities` |
| **Opportunity Detail** | `/opportunities/:id` | Score breakdown, evidence list, competitor table, lead count, phase controls | `GET /opportunities/:id` |
| **Leads** | `/leads` | Lead table with filters, temperature tags, outreach status | `GET /leads` |
| **Lead Detail** | `/leads/:id` | Full lead profile, outreach history, linked opportunities | `GET /leads/:id` |
| **Calendar** | `/calendar` | Timeline view of regulatory deadlines, color-coded by urgency | `GET /calendar` |
| **Runs** | `/runs` | Run history, delta summaries, trend charts | `GET /runs` |
| **Sources** | `/sources` | Source module list with enable/disable toggles, quality metrics | `GET /sources` |
| **Calibration** | `/calibration` | Criterion weight table, correlation data, historical adjustments | `GET /intelligence/calibration` |
| **Blueprint** | `/blueprints/:id` | Full rendered blueprint document | `GET /blueprints/:id` |
| **Settings** | `/settings` | Niche config, schedule, API keys, notification preferences | User profile |

### Key UI Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Kanban pipeline** | Dashboard | Visual progression: Discovery → Scored → Validated → Smoke Tested → Blueprinted |
| **Score cards** | Opportunities list | Quick-scan: name, score, maturity badge, lead count, velocity, format count |
| **Evidence drill-down** | Opportunity detail | Click any score to see supporting evidence + source links |
| **Temperature tags** | Leads list/detail | Color-coded: 🔵 Cold, 🟡 Warm, 🔴 Hot, ✅ Converted |
| **Calendar timeline** | Calendar page | Gantt-style: deadlines on timeline, urgency color-coding |
| **Comparison table** | Blueprints | Side-by-side comparison of 2-3 opportunities for final selection |

---

## Authentication & Multi-User

### User Model

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "owner",
  "niches": ["real_estate", "ecommerce"],
  "schedule": {
    "enabled": true,
    "frequency": "weekly",
    "day": "Monday",
    "time": "06:00"
  },
  "notifications": {
    "email_alerts": true,
    "alert_levels": ["critical", "medium"]
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Multi-User Separation

| Data | Scope |
|------|-------|
| Opportunities | Per-user |
| Warm leads | Per-user |
| Discovery runs | Per-user |
| Source registry | Per-user (each user configures their own sources) |
| Regulatory calendar | Shared (global regulations) + per-user (niche-specific alerts) |
| Scoring weights | Per-user (each user's calibration is independent) |

---

## Scheduler

### Periodic Jobs

| Job | Default Schedule | Configurable | Purpose |
|-----|-----------------|-------------|---------|
| **Full discovery run** | Weekly (Monday 6am) | Yes | Execute Phase 1A+1B across all enabled sources |
| **Regulatory calendar scan** | Weekly (with discovery run) | No | Check gov sources for new deadlines |
| **Competitive delta check** | Biweekly | Yes | Re-scan competitor prices, ratings, status |
| **Source quality recalc** | After each run | No | Update source quality scores |
| **Scoring calibration** | Monthly (if 3+ outcomes) | No | Run correlation analysis and suggest weight adjustments |
| **Alert check** | Daily | No | Check all alert triggers |

---

## External Integrations

| Integration | Purpose | Implementation |
|------------|---------|---------------|
| **Google Drive** | Export blueprints, reports, opportunity data | Google Drive API |
| **Email (SendGrid/Resend)** | Alert notifications, outreach tracking | SMTP/API |
| **Stripe** | Smoke test pre-sale payment processing | Stripe API |
| **Reddit API** | Enhanced Reddit source module (optional) | OAuth + API |
| **Google Trends** | Trend data integration | Unofficial API / scraping |
| **CSV export** | Lead export for external CRM tools | Built-in export endpoint |

---

## Technology Stack Recommendations

| Layer | Recommended | Alternatives | Rationale |
|-------|------------|-------------|-----------|
| **Frontend** | React + TypeScript | Vue, Svelte | Largest ecosystem, component library support |
| **UI Framework** | shadcn/ui + Tailwind | Material UI, Ant Design | Modern, customizable, lightweight |
| **Backend** | FastAPI (Python) | Node.js/Express, Django | Python for AI integration, async support, auto-docs |
| **Database** | PostgreSQL | MySQL | JSONB support for flexible data (evidence, configs) |
| **ORM** | SQLAlchemy + Alembic | Prisma (if Node) | Mature, migration support, Python native |
| **Auth** | JWT + bcrypt | Auth0, Supabase Auth | Simple for MVP, upgrade later |
| **Scheduler** | APScheduler (Python) | Celery + Redis | Lightweight for MVP, upgrade to Celery for scale |
| **Hosting** | Railway / Render | AWS, GCP, Vercel | One-click deploy, free tiers for MVP |
| **File Storage** | S3-compatible (R2/Minio) | Google Cloud Storage | Blueprint PDF exports, report storage |

### Development Priorities

Python is recommended for the backend because:
- All AI/ML libraries are Python-native — scoring, calibration, NLP
- Web scraping libraries (BeautifulSoup, Playwright) are Python-native
- FastAPI provides automatic OpenAPI documentation
- Single language for all backend services

---

## Deployment

### Container Strategy

```dockerfile
# API + Services
FROM python:3.12-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ /app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/opportunity_db

# Auth
JWT_SECRET=<random-secret>
JWT_ALGORITHM=HS256

# External Services
REDDIT_CLIENT_ID=<optional>
REDDIT_CLIENT_SECRET=<optional>
SENDGRID_API_KEY=<for-notifications>
STRIPE_SECRET_KEY=<for-smoke-test-presales>
GOOGLE_DRIVE_CREDENTIALS=<for-exports>

# App Config
DEFAULT_SCHEDULE=weekly
DEFAULT_NICHES=real_estate,ecommerce,tax
LOG_LEVEL=INFO
```

### CI/CD

```yaml
# GitHub Actions (simplified)
on: push to main
steps:
  - Run tests (pytest)
  - Lint check (ruff)
  - Type check (mypy)
  - Build container
  - Deploy to Railway/Render
```

---

## Security

| Area | Implementation |
|------|---------------|
| **API auth** | JWT tokens, short expiry (1h), refresh tokens (7d) |
| **Password storage** | bcrypt with salt |
| **API rate limiting** | 100 requests/minute per user, 10 requests/minute for scraping endpoints |
| **Data encryption** | TLS in transit, AES-256 at rest for PII (lead emails, contact info) |
| **PII handling** | Lead email/name stored encrypted, decrypted only for display/export |
| **Source credentials** | Stored in environment variables or secrets manager, never in database |
| **Input validation** | Pydantic models for all API inputs (FastAPI native) |
| **SQL injection** | ORM-only database access (no raw SQL from user input) |
| **CORS** | Restricted to frontend domain only |

---

## MVP vs. Full Feature Matrix

### Phase 1: MVP (4-6 weeks)

| Feature | Scope |
|---------|-------|
| ✅ Manual discovery trigger (Phase 1A/1B) | Run all source modules, display results |
| ✅ Scoring engine | Score all criteria, rank results |
| ✅ Basic lead capture | Store leads from discovery signals |
| ✅ Opportunity pipeline view | Kanban-style with phase progression |
| ✅ Opportunity detail + evidence | View scores + evidence drill-down |
| ✅ Lead list with temperature | View leads, manual temperature update |
| ✅ Regulatory calendar | View upcoming deadlines |
| ✅ Basic settings | Niche configuration, source enable/disable |
| ❌ Validation Framework | Manual (user does this using the document guidance) |
| ❌ Smoke Test Manager | Manual (user sets up tests externally) |
| ❌ Blueprint Generator | Manual (user creates using template) |
| ❌ Intelligence Dashboard | Limited (run history only) |
| ❌ Scoring Calibration | Not until 3+ products launched |
| ❌ Multi-user | Single-user only for MVP |

### Phase 2: Core Product (Weeks 7-12)

| Feature | Scope |
|---------|-------|
| ✅ Automated scheduled runs | Weekly cron with delta summaries |
| ✅ Validation Framework | Semi-automated validation with report generation |
| ✅ Competitive delta tracking | Automated competitor snapshots |
| ✅ Lead outreach tracking | Record outreach actions + responses |
| ✅ Blueprint Generator | Auto-generate blueprints from validated data |
| ✅ Email notifications | Alerts for deadlines, signals, responses |
| ✅ CSV/PDF export | Export leads, blueprints, reports |

### Phase 3: Full Product (Weeks 13-20)

| Feature | Scope |
|---------|-------|
| ✅ Full Intelligence Dashboard | All modules, trend charts, calibration |
| ✅ Scoring Calibration | Automated weight adjustment from outcomes |
| ✅ Smoke Test Manager | Landing page builder + conversion tracking |
| ✅ Multi-user | Team access, per-user pipelines |
| ✅ Stripe integration | Smoke test pre-sale payments |
| ✅ Google Drive export | Auto-export blueprints to Drive |
| ✅ Advanced analytics | Signal velocity charts, lifecycle visualizations |

---

## Scaling Considerations

| Concern | MVP Solution | Scaled Solution |
|---------|-------------|----------------|
| **Concurrent users** | Single-user, direct DB | Connection pooling (PgBouncer), read replicas |
| **Source module execution** | Sequential | Async workers (Celery + Redis) |
| **Large datasets** | Pagination | Cursor-based pagination, materialized views |
| **API performance** | Direct queries | Redis cache for dashboard, pre-computed aggregates |
| **File storage** | Local filesystem | S3-compatible (R2, MinIO) |
| **Monitoring** | Console logs | Structured logging + Sentry + PostHog |

---

*This document defines the application architecture. It maps every upstream document to a service module, providing the bridge from specification to implementation. For the data layer, see [15a_database_schema_core.md](./15a_database_schema_core.md).*
