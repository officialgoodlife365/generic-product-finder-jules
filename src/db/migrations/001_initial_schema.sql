-- PostgreSQL migration
-- Replace SQLite types with PostgreSQL equivalents
-- Add proper FOREIGN KEY constraints with ON DELETE behavior
-- Add JSONB columns for structured data
-- Add proper BOOLEAN types
-- Add created_at/updated_at triggers for automatic timestamp management

CREATE TABLE IF NOT EXISTS opportunities (
    id                      SERIAL PRIMARY KEY,
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
    triangulation_categories JSONB,
    raw_score               DECIMAL(10,2),
    weighted_score          DECIMAL(10,2),
    validated_score         DECIMAL(10,2),
    score_delta             DECIMAL(10,2),
    confidence              TEXT DEFAULT 'low',
    revenue_velocity_score  DECIMAL(10,2),
    passive_income_ratio    DECIMAL(10,2),
    format_count            INTEGER DEFAULT 0,
    format_list             JSONB,
    professional_price_anchor DECIMAL(10,2),
    suggested_price         DECIMAL(10,2),
    disclaimer_tier         TEXT,
    insurance_viable        BOOLEAN,
    precedent_scan_status   TEXT DEFAULT 'pending',
    precedent_scan_result   TEXT,
    moat_score              DECIMAL(10,2),
    moat_strategy           TEXT,
    ltv_estimate            DECIMAL(10,2),
    cac_estimate            DECIMAL(10,2),
    ltv_cac_ratio           DECIMAL(10,2),
    primary_distribution    TEXT,
    kill_reason             TEXT,
    kill_date               TIMESTAMP,
    discovered_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_urls             JSONB,
    notes                   TEXT
);

CREATE INDEX IF NOT EXISTS idx_opportunities_phase ON opportunities(phase);
CREATE INDEX IF NOT EXISTS idx_opportunities_niche ON opportunities(niche);
CREATE INDEX IF NOT EXISTS idx_opportunities_weighted_score ON opportunities(weighted_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_maturity ON opportunities(maturity_stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_disclaimer ON opportunities(disclaimer_tier);

CREATE TABLE IF NOT EXISTS warm_leads (
    id                  SERIAL PRIMARY KEY,
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
    lead_score          DECIMAL(10,2),
    contact_method      TEXT,
    contacted_at        TIMESTAMP,
    contact_message     TEXT,
    response            TEXT,
    response_sentiment  TEXT,
    converted           BOOLEAN DEFAULT FALSE,
    conversion_type     TEXT,
    email               TEXT,
    discovered_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes               TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_opportunity ON warm_leads(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON warm_leads(lead_temperature);
CREATE INDEX IF NOT EXISTS idx_leads_platform ON warm_leads(platform);
CREATE INDEX IF NOT EXISTS idx_leads_influence ON warm_leads(influence_tier);
CREATE INDEX IF NOT EXISTS idx_leads_score ON warm_leads(lead_score DESC);

CREATE TABLE IF NOT EXISTS evidence_chains (
    id                  SERIAL PRIMARY KEY,
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
    date_observed       TIMESTAMP,
    freshness_weight    DECIMAL(10,2) DEFAULT 1.0,
    confidence          TEXT DEFAULT 'medium',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_opportunity ON evidence_chains(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_criterion ON evidence_chains(criterion);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence_chains(evidence_type);

CREATE TABLE IF NOT EXISTS competitor_snapshots (
    id                  SERIAL PRIMARY KEY,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    competitor_name     TEXT NOT NULL,
    competitor_url      TEXT,
    product_name        TEXT,
    product_format      TEXT,
    snapshot_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price               TEXT,
    price_numeric       DECIMAL(10,2),
    currency            TEXT DEFAULT 'USD',
    rating              DECIMAL(10,2),
    review_count        INTEGER,
    review_sentiment    TEXT,
    estimated_sales     TEXT,
    traffic_estimate    TEXT,
    strengths           TEXT,
    weaknesses          TEXT,
    notable_changes     TEXT,
    status              TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_competitor_opportunity ON competitor_snapshots(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_competitor_name ON competitor_snapshots(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitor_date ON competitor_snapshots(snapshot_date);

CREATE TABLE IF NOT EXISTS discovery_runs (
    id                      SERIAL PRIMARY KEY,
    run_date                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    run_type                TEXT DEFAULT 'scheduled',
    run_duration_seconds    INTEGER,
    niches_searched         JSONB,
    sources_searched        JSONB,
    source_modules_used     JSONB,
    total_signals_found     INTEGER DEFAULT 0,
    triangulated_count      INTEGER DEFAULT 0,
    watch_list_count        INTEGER DEFAULT 0,
    problems_advanced       INTEGER DEFAULT 0,
    problems_killed         INTEGER DEFAULT 0,
    problems_strengthened   INTEGER DEFAULT 0,
    problems_weakened       INTEGER DEFAULT 0,
    leads_captured          INTEGER DEFAULT 0,
    leads_by_temperature    JSONB,
    regulatory_deadlines_found INTEGER DEFAULT 0,
    top_rising_signals      JSONB,
    competitive_changes     JSONB,
    delta_summary           TEXT,
    scoring_weight_changes  JSONB,
    source_quality_updates  JSONB,
    notes                   TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_date ON discovery_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_runs_type ON discovery_runs(run_type);

CREATE TABLE IF NOT EXISTS launched_outcomes (
    id                  SERIAL PRIMARY KEY,
    opportunity_id      INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    launched_at         TIMESTAMP NOT NULL,
    product_url         TEXT,
    product_format      TEXT,
    actual_price        DECIMAL(10,2),
    revenue_7d          DECIMAL(10,2),
    revenue_30d         DECIMAL(10,2),
    revenue_90d         DECIMAL(10,2),
    revenue_365d        DECIMAL(10,2),
    customers_7d        INTEGER,
    customers_30d       INTEGER,
    customers_90d       INTEGER,
    actual_cac          DECIMAL(10,2),
    actual_ltv          DECIMAL(10,2),
    actual_ltv_cac      DECIMAL(10,2),
    primary_channel     TEXT,
    conversion_rate     DECIMAL(10,2),
    refund_rate         DECIMAL(10,2),
    warm_leads_contacted INTEGER,
    warm_leads_converted INTEGER,
    warm_lead_conversion_rate DECIMAL(10,2),
    lessons_learned     TEXT,
    would_do_differently TEXT,
    notes               TEXT
);

CREATE TABLE IF NOT EXISTS regulatory_calendar (
    id                  SERIAL PRIMARY KEY,
    regulation_name     TEXT NOT NULL,
    jurisdiction        TEXT DEFAULT 'US-Federal',
    agency              TEXT,
    effective_date      TIMESTAMP NOT NULL,
    announcement_date   TIMESTAMP,
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
    discovered_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_date ON regulatory_calendar(effective_date);
CREATE INDEX IF NOT EXISTS idx_calendar_niche ON regulatory_calendar(affected_niches);
CREATE INDEX IF NOT EXISTS idx_calendar_status ON regulatory_calendar(status);
CREATE INDEX IF NOT EXISTS idx_calendar_potential ON regulatory_calendar(opportunity_potential);

CREATE TABLE IF NOT EXISTS source_registry (
    id                  SERIAL PRIMARY KEY,
    module_name         TEXT NOT NULL UNIQUE,
    display_name        TEXT,
    category            TEXT NOT NULL,
    tier                INTEGER NOT NULL,
    enabled             BOOLEAN DEFAULT TRUE,
    priority            INTEGER DEFAULT 5,
    auth_required       BOOLEAN DEFAULT FALSE,
    auth_configured     BOOLEAN DEFAULT FALSE,
    rate_limit_rpm      INTEGER DEFAULT 10,
    last_run_date       TIMESTAMP,
    last_run_status     TEXT,
    last_run_signals    INTEGER DEFAULT 0,
    config_json         JSONB,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
('youtube_comments', 'YouTube Comments', 'community_voice', 2, 4)
ON CONFLICT (module_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS source_quality_metrics (
    id                      SERIAL PRIMARY KEY,
    source_name             TEXT NOT NULL,
    run_id                  INTEGER REFERENCES discovery_runs(id),
    measurement_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signals_produced        INTEGER DEFAULT 0,
    signals_triangulated    INTEGER DEFAULT 0,
    signals_scored_above_65 INTEGER DEFAULT 0,
    signals_validated       INTEGER DEFAULT 0,
    signals_launched        INTEGER DEFAULT 0,
    avg_weighted_score      DECIMAL(10,2),
    avg_revenue_generated   DECIMAL(10,2),
    hit_rate                DECIMAL(10,2),
    quality_score           DECIMAL(10,2),
    notes                   TEXT
);
