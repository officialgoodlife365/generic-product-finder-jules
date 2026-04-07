# 15a — Database Schema: Core Tables

> Core data layer specification for the Generic Product Finder. Tables for opportunities, warm leads, evidence chains, competitor snapshots, discovery runs, and launched outcomes. All DDL, field dictionaries, indexes, and key queries.

---

## Schema Overview

```
┌─────────────────────┐       ┌─────────────────────┐
│    opportunities     │──1:N──│    evidence_chains   │
│                     │──1:N──│    warm_leads         │
│                     │──1:N──│  competitor_snapshots  │
│                     │──0:1──│  launched_outcomes     │
└─────────┬───────────┘       └─────────────────────┘
          │ 1:N
          ▼
┌─────────────────────┐
│  regulatory_calendar │
└─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   discovery_runs     │       │   source_registry    │
└─────────────────────┘       └──────────┬──────────┘
                                         │ 1:N
                                         ▼
                              ┌─────────────────────┐
                              │ source_quality_metrics│
                              └─────────────────────┘
```

---

## Table: `opportunities`

**Purpose:** Core table tracking every discovered problem through its entire lifecycle, from initial discovery through scoring, validation, blueprinting, and launch.

**App mapping:** `GET /opportunities`, `POST /opportunities`, `PUT /opportunities/{id}`

### DDL

```sql
CREATE TABLE IF NOT EXISTS opportunities (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    name                    TEXT NOT NULL,
    one_line                TEXT,
    niche                   TEXT,
    sub_niche               TEXT,
    persona                 TEXT,
    persona_job_title       TEXT,
    persona_company_size    TEXT,
    phase                   TEXT DEFAULT 'discovery',
    maturity_stage          TEXT DEFAULT 'unknown',
    triangulation_status    TEXT DEFAULT 'unverified',
    triangulation_categories TEXT,
    raw_score               REAL,
    weighted_score          REAL,
    validated_score         REAL,
    score_delta             REAL,
    confidence              TEXT DEFAULT 'low',
    revenue_velocity_score  REAL,
    passive_income_ratio    REAL,
    format_count            INTEGER DEFAULT 0,
    format_list             TEXT,
    professional_price_anchor REAL,
    suggested_price         REAL,
    disclaimer_tier         TEXT,
    insurance_viable        INTEGER,
    precedent_scan_status   TEXT DEFAULT 'pending',
    precedent_scan_result   TEXT,
    moat_score              REAL,
    moat_strategy           TEXT,
    ltv_estimate            REAL,
    cac_estimate            REAL,
    ltv_cac_ratio           REAL,
    primary_distribution    TEXT,
    kill_reason             TEXT,
    kill_date               TEXT,
    discovered_at           TEXT DEFAULT (datetime('now')),
    updated_at              TEXT DEFAULT (datetime('now')),
    source_urls             TEXT,
    notes                   TEXT
);
```

### Field Dictionary

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `id` | INTEGER PK | Auto-incrementing unique identifier | 1, 2, 3 |
| `name` | TEXT NOT NULL | Short name of the opportunity | "FinCEN AML Compliance Kit" |
| `one_line` | TEXT | One-sentence description of the pain being solved | "Small real estate businesses confused by new FinCEN reporting deadline" |
| `niche` | TEXT | Primary niche vertical | "Real estate", "E-commerce", "Tax & accounting" |
| `sub_niche` | TEXT | Specific sub-niche within the vertical | "Residential landlords", "Amazon FBA sellers" |
| `persona` | TEXT | Full buyer persona description | "Small landlord with 2-10 properties, no compliance staff" |
| `persona_job_title` | TEXT | Buyer's job title or role | "Property manager", "Small business owner" |
| `persona_company_size` | TEXT | Buyer's organization size | "Solo", "2-10 employees", "11-50 employees" |
| `phase` | TEXT | Current lifecycle phase | `discovery`, `scored`, `validated`, `smoke_tested`, `blueprinted`, `killed`, `launched` |
| `maturity_stage` | TEXT | Problem lifecycle classification | `emerging`, `growing`, `mature`, `declining`, `unknown` |
| `triangulation_status` | TEXT | Whether signal passed triangulation | `unverified`, `triangulated`, `watch_list`, `corroborated` |
| `triangulation_categories` | TEXT (JSON) | Which source categories confirmed the signal | `["community_voice", "search_data"]` |
| `raw_score` | REAL | Sum of all 15 criteria (max 75) | 52.0 |
| `weighted_score` | REAL | Raw + core criteria doubled (max 100) | 71.0 |
| `validated_score` | REAL | Re-scored after Phase 3 validation | 74.0 |
| `score_delta` | REAL | validated_score - weighted_score | +3.0 |
| `confidence` | TEXT | Data confidence level | `low`, `medium`, `high` |
| `revenue_velocity_score` | REAL | Speed-to-first-dollar score (0-5) | 4.0 |
| `passive_income_ratio` | REAL | Percentage of passive revenue (0-100) | 85.0 |
| `format_count` | INTEGER | Number of product formats possible | 4 |
| `format_list` | TEXT (JSON) | List of applicable formats | `["pdf_guide", "template_pack", "video_course", "subscription"]` |
| `professional_price_anchor` | REAL | What professionals charge for equivalent service | 2000.00 |
| `suggested_price` | REAL | Recommended price (10-20% of anchor) | 197.00 |
| `disclaimer_tier` | TEXT | Legal protection tier | `A`, `B`, `C`, `D` |
| `insurance_viable` | INTEGER | Can E&O insurance cover this? | 1 (yes), 0 (no), NULL (unknown) |
| `precedent_scan_status` | TEXT | Status of lawsuit/FTC search | `pending`, `clean`, `flagged`, `kill` |
| `precedent_scan_result` | TEXT | Details of any legal precedents found | "FTC action against similar product in 2024..." |
| `moat_score` | REAL | Defensibility score (0-15) | 9.0 |
| `moat_strategy` | TEXT | Primary moat approach | "Content depth + niche specificity" |
| `ltv_estimate` | REAL | Estimated customer lifetime value | 450.00 |
| `cac_estimate` | REAL | Estimated customer acquisition cost | 50.00 |
| `ltv_cac_ratio` | REAL | LTV / CAC (target ≥ 3.0) | 9.0 |
| `primary_distribution` | TEXT | Best distribution channel | "Affiliate + SEO" |
| `kill_reason` | TEXT | Why opportunity was killed (if killed) | "Disclaimer tier D — advisory territory" |
| `kill_date` | TEXT | When it was killed | "2026-03-15T10:30:00Z" |
| `discovered_at` | TEXT | First discovery timestamp | Auto-set |
| `updated_at` | TEXT | Last modification timestamp | Auto-set |
| `source_urls` | TEXT (JSON) | All source URLs evidence came from | `["https://reddit.com/...", "https://..."]` |
| `notes` | TEXT | Free-form notes | Any text |

### Indexes

```sql
CREATE INDEX idx_opportunities_phase ON opportunities(phase);
CREATE INDEX idx_opportunities_niche ON opportunities(niche);
CREATE INDEX idx_opportunities_weighted_score ON opportunities(weighted_score DESC);
CREATE INDEX idx_opportunities_maturity ON opportunities(maturity_stage);
CREATE INDEX idx_opportunities_disclaimer ON opportunities(disclaimer_tier);
```

---

## Table: `warm_leads`

**Purpose:** CRM seed table. Captures every person expressing pain during discovery. Becomes the Day 1 outreach list when a product launches.

**App mapping:** `GET /leads`, `GET /leads?opportunity_id={id}&temperature=hot`, `PUT /leads/{id}`

### DDL

```sql
CREATE TABLE IF NOT EXISTS warm_leads (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
    username            TEXT,
    display_name        TEXT,
    platform            TEXT NOT NULL,
    community           TEXT,
    post_url            TEXT,
    pain_quote          TEXT,
    engagement_score    INTEGER DEFAULT 0,
    influence_tier      TEXT DEFAULT 'normal',
    lead_temperature    TEXT DEFAULT 'cold',
    lead_score          REAL,
    contact_method      TEXT,
    contacted_at        TEXT,
    contact_message     TEXT,
    response            TEXT,
    response_sentiment  TEXT,
    converted           INTEGER DEFAULT 0,
    conversion_type     TEXT,
    email               TEXT,
    discovered_at       TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now')),
    notes               TEXT
);
```

### Field Dictionary

| Field | Type | Description | Values / Examples |
|-------|------|-------------|-------------------|
| `id` | INTEGER PK | Unique lead identifier | Auto |
| `opportunity_id` | INTEGER FK | Links to the opportunity this lead relates to | FK → opportunities.id |
| `username` | TEXT | Their handle on the platform | "u/frustrated_landlord", "@taxnightmare" |
| `display_name` | TEXT | Real name if available | "John Smith" |
| `platform` | TEXT NOT NULL | Where they were found | "reddit", "hn", "x", "quora", "upwork", "producthunt" |
| `community` | TEXT | Specific group/subreddit/forum | "r/smallbusiness", "Etsy Sellers Group" |
| `post_url` | TEXT | Direct link to their pain expression | Full URL |
| `pain_quote` | TEXT | Their exact words | "I've wasted 3 days trying to figure this out" |
| `engagement_score` | INTEGER | Upvotes + replies as influence proxy | 127 |
| `influence_tier` | TEXT | Influence classification | `normal`, `active`, `influencer`, `moderator` |
| `lead_temperature` | TEXT | How warm the lead is | `cold`, `warm`, `hot` |
| `lead_score` | REAL | Composite score (engagement × influence × recency) | 85.5 |
| `contact_method` | TEXT | How to reach them | "reddit_dm", "twitter_reply", "email", "community_post" |
| `contacted_at` | TEXT | When you first reached out | Timestamp |
| `contact_message` | TEXT | What you sent them | "Hey, I saw your post about..." |
| `response` | TEXT | What they replied | "Yes, I'd love to try that!" |
| `response_sentiment` | TEXT | Tone of response | `positive`, `neutral`, `negative`, `no_response` |
| `converted` | INTEGER | Did they become a customer? | 0 (no), 1 (yes) |
| `conversion_type` | TEXT | How they converted | "waitlist_signup", "pre_order", "purchase", "beta_tester" |
| `email` | TEXT | Email if they provided it | "user@example.com" |
| `discovered_at` | TEXT | When the lead was first captured | Auto-set |
| `updated_at` | TEXT | Last update timestamp | Auto-set |
| `notes` | TEXT | Free-form | Any text |

### Lead Temperature Transition Rules

```
COLD → WARM: You engaged with their post (replied, provided value) AND they responded
COLD → HOT:  They signed up for waitlist, pre-ordered, or asked to be notified
WARM → HOT:  They expressed buying intent, signed up, or pre-ordered
HOT → CONVERTED: They purchased the product
```

### Indexes

```sql
CREATE INDEX idx_leads_opportunity ON warm_leads(opportunity_id);
CREATE INDEX idx_leads_temperature ON warm_leads(lead_temperature);
CREATE INDEX idx_leads_platform ON warm_leads(platform);
CREATE INDEX idx_leads_influence ON warm_leads(influence_tier);
CREATE INDEX idx_leads_score ON warm_leads(lead_score DESC);
```

---

## Table: `evidence_chains`

**Purpose:** Auditable link between every scoring criterion and the specific evidence supporting it. Enables drill-down UI and scoring calibration.

**App mapping:** `GET /opportunities/{id}/evidence`, `POST /evidence`

### DDL

```sql
CREATE TABLE IF NOT EXISTS evidence_chains (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    criterion           TEXT NOT NULL,
    score               INTEGER NOT NULL,
    evidence_type       TEXT NOT NULL,
    source_url          TEXT,
    quote               TEXT,
    data_point          TEXT,
    data_value          TEXT,
    username            TEXT,
    platform            TEXT,
    date_observed       TEXT,
    freshness_weight    REAL DEFAULT 1.0,
    confidence          TEXT DEFAULT 'medium',
    created_at          TEXT DEFAULT (datetime('now'))
);
```

### Field Dictionary

| Field | Type | Description | Values / Examples |
|-------|------|-------------|-------------------|
| `criterion` | TEXT | Which scoring criterion this evidence supports | "pain_intensity", "willingness_to_pay", "urgency_deadline" |
| `score` | INTEGER | The score given based on this evidence | 0-5 |
| `evidence_type` | TEXT | Category of evidence | "reddit_post", "google_trends", "competitor_product", "upwork_gig", "regulatory_filing", "review", "news_article" |
| `source_url` | TEXT | URL of the evidence source | Full URL |
| `quote` | TEXT | Direct quote from the source | "I can't believe I have to deal with this..." |
| `data_point` | TEXT | Type of quantitative data | "search_volume", "trend_direction", "price", "rating", "review_count" |
| `data_value` | TEXT | Value of the data point | "rising", "$2,000", "3.2 stars", "1,500/month" |
| `username` | TEXT | Person behind the evidence (auto-feeds warm_leads) | "u/small_biz_owner" |
| `platform` | TEXT | Platform where evidence was found | "reddit", "google_trends", "upwork" |
| `date_observed` | TEXT | When the evidence was created/posted | "2026-02-15" |
| `freshness_weight` | REAL | Time-decay weight applied | 1.2 (<30d), 1.0 (1-3mo), 0.8 (3-6mo), 0.6 (6-12mo) |
| `confidence` | TEXT | How reliable this evidence is | `low`, `medium`, `high` |

### Indexes

```sql
CREATE INDEX idx_evidence_opportunity ON evidence_chains(opportunity_id);
CREATE INDEX idx_evidence_criterion ON evidence_chains(criterion);
CREATE INDEX idx_evidence_type ON evidence_chains(evidence_type);
```

---

## Table: `competitor_snapshots`

**Purpose:** Point-in-time snapshots of competitors. Enables delta tracking across runs — detecting pricing changes, new entrants, and exits.

**App mapping:** `GET /competitors?opportunity_id={id}`, `GET /competitors/{id}/history`

### DDL

```sql
CREATE TABLE IF NOT EXISTS competitor_snapshots (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    competitor_name     TEXT NOT NULL,
    competitor_url      TEXT,
    product_name        TEXT,
    product_format      TEXT,
    snapshot_date       TEXT DEFAULT (datetime('now')),
    price               TEXT,
    price_numeric       REAL,
    currency            TEXT DEFAULT 'USD',
    rating              REAL,
    review_count        INTEGER,
    review_sentiment    TEXT,
    estimated_sales     TEXT,
    traffic_estimate    TEXT,
    strengths           TEXT,
    weaknesses          TEXT,
    notable_changes     TEXT,
    status              TEXT DEFAULT 'active'
);
```

### Field Dictionary

| Field | Type | Description | Values / Examples |
|-------|------|-------------|-------------------|
| `competitor_name` | TEXT | Company or creator name | "TaxTemplates Inc" |
| `competitor_url` | TEXT | Product page URL | Full URL |
| `product_name` | TEXT | Specific product being tracked | "Ultimate Tax Compliance Kit" |
| `product_format` | TEXT | Product type | "pdf", "saas", "course", "templates", "subscription" |
| `price` | TEXT | Displayed price | "$197", "$49/month", "Free tier + $99 pro" |
| `price_numeric` | REAL | Numeric price for comparison | 197.00 |
| `rating` | REAL | Average rating | 3.8 |
| `review_count` | INTEGER | Number of reviews | 245 |
| `review_sentiment` | TEXT | Overall sentiment | `positive`, `mixed`, `negative` |
| `estimated_sales` | TEXT | Estimated sales volume if available | "~500/month", "High gravity on ClickBank" |
| `traffic_estimate` | TEXT | SimilarWeb or similar estimate | "~15,000 monthly visits" |
| `strengths` | TEXT | What they do well | "Comprehensive content, strong SEO" |
| `weaknesses` | TEXT | Where they fall short (from reviews) | "Outdated for 2026 rules, no state-specific guidance" |
| `notable_changes` | TEXT | Changes since last snapshot | "Price increased from $97 to $197" |
| `status` | TEXT | Whether competitor is still active | `active`, `inactive`, `new_entrant` |

### Delta Detection Queries

```sql
-- Find price changes between snapshots
SELECT c1.competitor_name, c1.price AS old_price, c2.price AS new_price,
       c1.snapshot_date AS old_date, c2.snapshot_date AS new_date
FROM competitor_snapshots c1
JOIN competitor_snapshots c2 ON c1.competitor_name = c2.competitor_name
  AND c1.opportunity_id = c2.opportunity_id
  AND c2.snapshot_date > c1.snapshot_date
WHERE c1.price_numeric != c2.price_numeric
ORDER BY c2.snapshot_date DESC;

-- Find new entrants (competitors not in previous snapshot)
SELECT cs.competitor_name, cs.snapshot_date, cs.price, cs.product_format
FROM competitor_snapshots cs
WHERE cs.status = 'new_entrant'
ORDER BY cs.snapshot_date DESC;

-- Find disappeared competitors
SELECT cs.competitor_name, MAX(cs.snapshot_date) AS last_seen
FROM competitor_snapshots cs
WHERE cs.status = 'inactive'
GROUP BY cs.competitor_name;
```

### Indexes

```sql
CREATE INDEX idx_competitor_opportunity ON competitor_snapshots(opportunity_id);
CREATE INDEX idx_competitor_name ON competitor_snapshots(competitor_name);
CREATE INDEX idx_competitor_date ON competitor_snapshots(snapshot_date);
```

---

## Table: `discovery_runs`

**Purpose:** Historical record of each discovery run. Powers run-over-run intelligence dashboard and trend tracking.

**App mapping:** `GET /runs`, `GET /runs/{id}`, `POST /runs`

### DDL

```sql
CREATE TABLE IF NOT EXISTS discovery_runs (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    run_date                TEXT DEFAULT (datetime('now')),
    run_type                TEXT DEFAULT 'scheduled',
    run_duration_seconds    INTEGER,
    niches_searched         TEXT,
    sources_searched        TEXT,
    source_modules_used     TEXT,
    total_signals_found     INTEGER DEFAULT 0,
    triangulated_count      INTEGER DEFAULT 0,
    watch_list_count        INTEGER DEFAULT 0,
    problems_advanced       INTEGER DEFAULT 0,
    problems_killed         INTEGER DEFAULT 0,
    problems_strengthened   INTEGER DEFAULT 0,
    problems_weakened       INTEGER DEFAULT 0,
    leads_captured          INTEGER DEFAULT 0,
    leads_by_temperature    TEXT,
    regulatory_deadlines_found INTEGER DEFAULT 0,
    top_rising_signals      TEXT,
    competitive_changes     TEXT,
    delta_summary           TEXT,
    scoring_weight_changes  TEXT,
    source_quality_updates  TEXT,
    notes                   TEXT
);
```

### Field Dictionary

| Field | Type | Description |
|-------|------|-------------|
| `run_type` | TEXT | How the run was triggered — `scheduled`, `manual`, `focused` (niche-specific) |
| `run_duration_seconds` | INTEGER | Total execution time |
| `niches_searched` | TEXT (JSON) | `["real_estate", "ecommerce", "tax"]` |
| `sources_searched` | TEXT (JSON) | `["reddit", "google_trends", "gov_regulatory"]` |
| `source_modules_used` | TEXT (JSON) | Which modules were enabled and ran |
| `total_signals_found` | INTEGER | Raw signal count from Phase 1A |
| `triangulated_count` | INTEGER | Signals passing triangulation requirement |
| `watch_list_count` | INTEGER | Signals held for future triangulation |
| `problems_advanced` | INTEGER | Problems that advanced to scoring |
| `problems_killed` | INTEGER | Previously tracked problems killed this run |
| `problems_strengthened` | INTEGER | Existing problems with new corroborating evidence |
| `problems_weakened` | INTEGER | Existing problems with contradicting evidence |
| `leads_captured` | INTEGER | New warm lead records created |
| `leads_by_temperature` | TEXT (JSON) | `{"cold": 45, "warm": 8, "hot": 2}` |
| `regulatory_deadlines_found` | INTEGER | New regulatory calendar entries |
| `top_rising_signals` | TEXT (JSON) | Top 3-5 signals by velocity |
| `competitive_changes` | TEXT (JSON) | Price changes, new entrants, exits |
| `delta_summary` | TEXT | Human-readable run summary |
| `scoring_weight_changes` | TEXT (JSON) | If calibration adjusted weights this run |
| `source_quality_updates` | TEXT (JSON) | Per-module quality score changes |

### Indexes

```sql
CREATE INDEX idx_runs_date ON discovery_runs(run_date);
CREATE INDEX idx_runs_type ON discovery_runs(run_type);
```

---

## Table: `launched_outcomes`

**Purpose:** Post-launch tracking for scoring calibration. After 3+ entries, enables correlation analysis between original scores and actual revenue to adjust criterion weights.

**App mapping:** `GET /outcomes`, `POST /outcomes`, `PUT /outcomes/{id}`

### DDL

```sql
CREATE TABLE IF NOT EXISTS launched_outcomes (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    launched_at         TEXT NOT NULL,
    product_url         TEXT,
    product_format      TEXT,
    actual_price        REAL,
    revenue_7d          REAL,
    revenue_30d         REAL,
    revenue_90d         REAL,
    revenue_365d        REAL,
    customers_7d        INTEGER,
    customers_30d       INTEGER,
    customers_90d       INTEGER,
    actual_cac          REAL,
    actual_ltv          REAL,
    actual_ltv_cac      REAL,
    primary_channel     TEXT,
    conversion_rate     REAL,
    refund_rate         REAL,
    warm_leads_contacted INTEGER,
    warm_leads_converted INTEGER,
    warm_lead_conversion_rate REAL,
    lessons_learned     TEXT,
    would_do_differently TEXT,
    notes               TEXT
);
```

### Calibration Queries

```sql
-- Correlation: which criteria predicted revenue?
SELECT ec.criterion, AVG(ec.score) AS avg_score,
       AVG(lo.revenue_90d) AS avg_revenue
FROM evidence_chains ec
JOIN launched_outcomes lo ON ec.opportunity_id = lo.opportunity_id
GROUP BY ec.criterion
ORDER BY avg_revenue DESC;

-- Warm lead effectiveness
SELECT lo.opportunity_id, o.name,
       lo.warm_leads_contacted, lo.warm_leads_converted,
       lo.warm_lead_conversion_rate
FROM launched_outcomes lo
JOIN opportunities o ON lo.opportunity_id = o.id
ORDER BY lo.warm_lead_conversion_rate DESC;
```

---

*This document covers core data tables. For analytics tables (regulatory calendar, source registry, source quality), cross-table queries, migration guidance, and data retention, see [15b_database_schema_analytics.md](./15b_database_schema_analytics.md).*
