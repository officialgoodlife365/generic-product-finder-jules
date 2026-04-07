# 15b — Database Schema: Analytics & Configuration

> Analytics, configuration, and operational tables for the Generic Product Finder. Regulatory calendar, source registry, source quality metrics, cross-table queries, SQLite→PostgreSQL migration guidance, and data retention policies.

---

## Table: `regulatory_calendar`

**Purpose:** Proactive timing engine. Tracks upcoming regulation effective dates so products can be built before demand spikes.

**App mapping:** `GET /calendar`, `GET /calendar?days_ahead=90`

### DDL

```sql
CREATE TABLE IF NOT EXISTS regulatory_calendar (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    regulation_name     TEXT NOT NULL,
    jurisdiction        TEXT DEFAULT 'US-Federal',
    agency              TEXT,
    effective_date      TEXT NOT NULL,
    announcement_date   TEXT,
    description         TEXT,
    affected_niches     TEXT,
    affected_personas   TEXT,
    severity            TEXT DEFAULT 'medium',
    penalty_info        TEXT,
    compliance_complexity TEXT,
    opportunity_potential TEXT,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
    source_url          TEXT,
    status              TEXT DEFAULT 'upcoming',
    discovered_at       TEXT DEFAULT (datetime('now'))
);
```

### Field Dictionary

| Field | Type | Description | Values / Examples |
|-------|------|-------------|-------------------|
| `jurisdiction` | TEXT | Where this regulation applies | "US-Federal", "US-CA", "EU", "UK" |
| `agency` | TEXT | Regulatory body | "FinCEN", "FTC", "FDA", "OSHA", "IRS" |
| `effective_date` | TEXT | When the rule takes effect | "2026-06-01" |
| `severity` | TEXT | Impact level on affected businesses | `low`, `medium`, `high`, `critical` |
| `penalty_info` | TEXT | Penalties for non-compliance | "$10,000 per violation, up to $50,000" |
| `compliance_complexity` | TEXT | How hard it is to comply | `simple`, `moderate`, `complex` |
| `opportunity_potential` | TEXT | How likely this generates a product opportunity | `low`, `medium`, `high`, `very_high` |
| `status` | TEXT | Current state of the regulation | `upcoming`, `active`, `passed`, `repealed` |

### Alerting Queries

```sql
-- Deadlines in next 90 days with high opportunity potential
SELECT * FROM regulatory_calendar
WHERE effective_date BETWEEN date('now') AND date('now', '+90 days')
  AND opportunity_potential IN ('high', 'very_high')
  AND status = 'upcoming'
ORDER BY effective_date ASC;

-- Overdue deadlines (already passed — urgent demand window)
SELECT * FROM regulatory_calendar
WHERE effective_date < date('now')
  AND effective_date > date('now', '-30 days')
  AND status = 'active'
ORDER BY effective_date ASC;
```

### Indexes

```sql
CREATE INDEX idx_calendar_date ON regulatory_calendar(effective_date);
CREATE INDEX idx_calendar_niche ON regulatory_calendar(affected_niches);
CREATE INDEX idx_calendar_status ON regulatory_calendar(status);
CREATE INDEX idx_calendar_potential ON regulatory_calendar(opportunity_potential);
```

---

## Table: `source_registry`

**Purpose:** Configuration table for the modular source plugin system. Tracks which sources are enabled, their priority, and authentication requirements.

**App mapping:** `GET /sources`, `PUT /sources/{name}`

### DDL

```sql
CREATE TABLE IF NOT EXISTS source_registry (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name         TEXT NOT NULL UNIQUE,
    display_name        TEXT,
    category            TEXT NOT NULL,
    tier                INTEGER NOT NULL,
    enabled             INTEGER DEFAULT 1,
    priority            INTEGER DEFAULT 5,
    auth_required       INTEGER DEFAULT 0,
    auth_configured     INTEGER DEFAULT 0,
    rate_limit_rpm      INTEGER DEFAULT 10,
    last_run_date       TEXT,
    last_run_status     TEXT,
    last_run_signals    INTEGER DEFAULT 0,
    config_json         TEXT,
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now'))
);
```

### Default Data

```sql
INSERT INTO source_registry (module_name, display_name, category, tier, priority) VALUES
('reddit', 'Reddit Communities', 'community_voice', 1, 1),
('google_trends', 'Google Trends', 'search_data', 1, 1),
('gov_regulatory', 'Government/Regulatory Sites', 'search_data', 1, 1),
('industry_news', 'Industry News', 'search_data', 1, 2),
('hackernews', 'HackerNews', 'community_voice', 1, 3),
('producthunt_g2', 'ProductHunt / G2 / Capterra', 'marketplace_proof', 1, 3),
('amazon_reviews', 'Amazon Reviews', 'marketplace_proof', 1, 2),
('quora', 'Quora', 'community_voice', 1, 3),
('upwork_fiverr', 'Upwork / Fiverr', 'marketplace_proof', 1, 2),
('exploding_topics', 'Exploding Topics', 'search_data', 1, 2),
('app_store', 'App Store / Play Store', 'marketplace_proof', 1, 3),
('x_twitter', 'X / Twitter', 'community_voice', 2, 2),
('youtube_comments', 'YouTube Comments', 'community_voice', 2, 4);
```

---

## Table: `source_quality_metrics`

**Purpose:** Tracks historical performance of each source module. Sources that consistently find high-scoring opportunities get priority in future runs.

**App mapping:** `GET /sources/{name}/quality`

### DDL

```sql
CREATE TABLE IF NOT EXISTS source_quality_metrics (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name             TEXT NOT NULL,
    run_id                  INTEGER REFERENCES discovery_runs(id),
    measurement_date        TEXT DEFAULT (datetime('now')),
    signals_produced        INTEGER DEFAULT 0,
    signals_triangulated    INTEGER DEFAULT 0,
    signals_scored_above_65 INTEGER DEFAULT 0,
    signals_validated       INTEGER DEFAULT 0,
    signals_launched        INTEGER DEFAULT 0,
    avg_weighted_score      REAL,
    avg_revenue_generated   REAL,
    hit_rate                REAL,
    quality_score           REAL,
    notes                   TEXT
);
```

### Quality Score Calculation

```sql
-- Quality score formula: weighted average of outcomes
-- hit_rate = signals_scored_above_65 / signals_produced
-- quality_score = (hit_rate × 40) + (avg_weighted_score × 30) + (signals_launched × 30)
-- Normalized to 0-100 scale

UPDATE source_quality_metrics
SET quality_score = (
    (CAST(signals_scored_above_65 AS REAL) / NULLIF(signals_produced, 0) * 40) +
    (COALESCE(avg_weighted_score, 0) / 100 * 30) +
    (MIN(signals_launched, 3) / 3.0 * 30)
)
WHERE id = ?;
```

---

## Common Cross-Table Queries

### Top Opportunities Pipeline

```sql
-- Full pipeline view: opportunities with lead count and evidence count
SELECT o.id, o.name, o.phase, o.weighted_score, o.maturity_stage,
       o.disclaimer_tier, o.passive_income_ratio,
       COUNT(DISTINCT wl.id) AS lead_count,
       COUNT(DISTINCT ec.id) AS evidence_count,
       SUM(CASE WHEN wl.lead_temperature = 'hot' THEN 1 ELSE 0 END) AS hot_leads
FROM opportunities o
LEFT JOIN warm_leads wl ON o.id = wl.opportunity_id
LEFT JOIN evidence_chains ec ON o.id = ec.opportunity_id
WHERE o.phase != 'killed'
GROUP BY o.id
ORDER BY o.weighted_score DESC;
```

### Launch Readiness Check

```sql
-- Opportunities ready for launch: blueprinted, good legal standing, warm leads
SELECT o.name, o.weighted_score, o.disclaimer_tier, o.precedent_scan_status,
       o.insurance_viable, o.ltv_cac_ratio,
       COUNT(DISTINCT wl.id) AS total_leads,
       SUM(CASE WHEN wl.lead_temperature = 'hot' THEN 1 ELSE 0 END) AS hot_leads,
       SUM(CASE WHEN wl.lead_temperature = 'warm' THEN 1 ELSE 0 END) AS warm_leads
FROM opportunities o
LEFT JOIN warm_leads wl ON o.id = wl.opportunity_id
WHERE o.phase = 'blueprinted'
  AND o.disclaimer_tier IN ('A', 'B')
  AND o.precedent_scan_status = 'clean'
GROUP BY o.id
ORDER BY hot_leads DESC, o.weighted_score DESC;
```

### Regulatory Urgency Dashboard

```sql
-- Upcoming deadlines with matched opportunities
SELECT rc.regulation_name, rc.effective_date, rc.severity, rc.agency,
       o.name AS opportunity_name, o.weighted_score, o.phase
FROM regulatory_calendar rc
LEFT JOIN opportunities o ON rc.opportunity_id = o.id
WHERE rc.effective_date > date('now')
ORDER BY rc.effective_date ASC;
```

---

## Migration: SQLite → PostgreSQL

When moving from agent SQLite to production PostgreSQL:

| SQLite | PostgreSQL | Notes |
|--------|-----------|-------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` | Auto-increment syntax |
| `TEXT` | `TEXT` or `VARCHAR(n)` | Add length constraints where appropriate |
| `REAL` | `DECIMAL(10,2)` or `FLOAT` | Use DECIMAL for money fields |
| `INTEGER` (boolean) | `BOOLEAN` | `insurance_viable`, `converted`, etc. |
| `TEXT` (JSON) | `JSONB` | `triangulation_categories`, `source_urls`, etc. — use native JSON |
| `datetime('now')` | `NOW()` | Default timestamps |

### Migration Script Header

```sql
-- PostgreSQL migration
-- Replace SQLite types with PostgreSQL equivalents
-- Add proper FOREIGN KEY constraints with ON DELETE behavior
-- Add JSONB columns for structured data
-- Add proper BOOLEAN types
-- Add created_at/updated_at triggers for automatic timestamp management
```

---

## Data Retention & Archival

| Data | Retention | Archival |
|------|-----------|---------|
| Active opportunities (not killed) | Indefinite | N/A |
| Killed opportunities | 12 months | Archive to `opportunities_archive` then delete |
| Warm leads (cold, no interaction) | 6 months | Delete — stale cold leads have no value |
| Warm leads (warm/hot) | Indefinite | Keep — these are marketing assets |
| Evidence chains | Tied to opportunity retention | Archive with opportunity |
| Competitor snapshots | 24 months | Keep recent 6 snapshots per competitor, archive older |
| Discovery runs | Indefinite | Compress delta_summary after 12 months |
| Launched outcomes | Indefinite | Core calibration data — never delete |
| Regulatory calendar (passed) | 12 months after effective date | Archive |
| Source quality metrics | Indefinite | Core calibration data |

---

*This document covers analytics and configuration tables. For core data tables (opportunities, leads, evidence, competitors, runs, outcomes), see [15a_database_schema_core.md](./15a_database_schema_core.md).*
