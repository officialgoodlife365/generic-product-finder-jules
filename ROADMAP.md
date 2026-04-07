# Master 10-Iteration Roadmap for Generic Product Finder

> **JULES: This is your construction plan. Each iteration builds on the previous one. Follow in strict order.**

---

## Iteration Breakdown

### Iteration 1: Backend Foundation & Database Schema
**Architecture Files:** `15a_database_schema_core.md`, `15b_database_schema_analytics.md`, `16_app_architecture.md`
**Deliverables:**
- [ ] Express.js server with health check endpoint
- [ ] PostgreSQL connection module using environment variables
- [ ] Core database tables: `opportunities`, `warm_leads`, `evidence_chains`, `competitor_snapshots`
- [ ] Analytics tables: `discovery_runs`, `source_registry`, `score_calibration`
- [ ] Database migration system
- [ ] Basic API routing structure matching `16_app_architecture.md`
- [ ] Jest test suite for DB connections and API routes

---

### Iteration 2: Source Module — Community Ingestion
**Architecture Files:** `02a_source_modules_community.md`
**Deliverables:**
- [ ] Reddit adapter module (API integration for pain signal extraction)
- [ ] Hacker News adapter module
- [ ] YouTube comment adapter module
- [ ] Quora adapter module
- [ ] Niche forum generic adapter (configurable URL + CSS selectors)
- [ ] Unified `SourceResult` data model
- [ ] Tests for each adapter with mocked API responses

---

### Iteration 3: Source Module — Data Ingestion
**Architecture Files:** `02b_source_modules_data.md`
**Deliverables:**
- [ ] Google Trends adapter
- [ ] Exploding Topics adapter
- [ ] G2/ProductHunt review adapter
- [ ] Amazon/Udemy review scraper
- [ ] Regulatory calendar monitor
- [ ] Data normalization pipeline (unified format with community sources)
- [ ] Tests for each data adapter

---

### Iteration 4: Discovery Engine & Triangulation
**Architecture Files:** `03_discovery_engine.md`
**Deliverables:**
- [ ] Triangulation logic: require signal in 2+ independent source categories
- [ ] Deep extraction pipeline (pain phrases, frequency, sentiment)
- [ ] Freshness weighting system (<30d = 1.2×, 1-3mo = 1.0×, 3-6mo = 0.8×)
- [ ] Maturity classification (Emerging, Growing, Mature, Declining)
- [ ] Signal velocity calculator (rate of growth across consecutive runs)
- [ ] Integration tests: end-to-end from source → triangulated opportunities

---

### 🛑 Iteration 5: QUALITY AUDIT (50% Checkpoint)
**Architecture Files:** ALL files in `/architecture/`
**Protocol:** Follow `QA_PROTOCOL.md` exactly.
**Deliverables:**
- [ ] Full code review against architecture specifications
- [ ] Identify and remove any hallucinated logic or unnecessary dependencies
- [ ] Ensure all existing tests pass
- [ ] Add missing test coverage for edge cases
- [ ] Refactor any code smells or duplicated patterns
- [ ] Produce `qa_reports/QA_REPORT_ITERATION_5.md`
- [ ] **NO NEW FEATURES ALLOWED**

---

### Iteration 6: Scoring Engine & Warm Lead Pipeline
**Architecture Files:** `04_warm_lead_pipeline.md`, `05a_scoring_criteria.md`, `05b_scoring_evidence.md`
**Deliverables:**
- [ ] 15-criteria scoring engine with configurable weights
- [ ] 5 core criteria at 2× weight implementation
- [ ] Kill signal detection (auto-disqualify)
- [ ] Buyer intent decomposition scoring
- [ ] Evidence chain linking (each score → URL/quote/data)
- [ ] Warm lead CRM: temperature scoring (cold→warm→hot)
- [ ] Lead capture from discovery results
- [ ] Outreach template system
- [ ] Tests for scoring math accuracy and lead classification

---

### Iteration 7: Validation Framework & Legal Risk Engine
**Architecture Files:** `06_validation_framework.md`, `07a_legal_risk_engine.md`, `07b_legal_shields.md`
**Deliverables:**
- [ ] Deep competitive analysis module
- [ ] Moat assessment calculator (brand + content depth + update frequency + distribution + niche)
- [ ] Negative signal mining
- [ ] CAC estimation per channel (target LTV:CAC ≥ 3:1)
- [ ] Legal risk scoring (1-5 scale)
- [ ] Precedent scanning module
- [ ] Disclaimer tier classification (A-D) with auto-disqualify for Tier D
- [ ] Product architecture as legal shield (gated delivery, safe copy patterns)
- [ ] Tests for competitive analysis, scoring boundaries, and legal classifications

---

### Iteration 8: Revenue Funnels & Payment Infrastructure
**Architecture Files:** `08a_revenue_pricing.md`, `08b_revenue_funnels.md`, `14_payment_infrastructure.md`
**Deliverables:**
- [ ] Price anchoring calculator (10-20% of professional alternative pricing)
- [ ] Format multiplication engine (one research → multiple product formats)
- [ ] Passive income ratio calculator
- [ ] Revenue velocity scoring
- [ ] Hybrid funnel architecture (Starter → Core → Subscription + Order Bumps + OTOs)
- [ ] LTV modeling module
- [ ] Stripe integration (webhooks, subscription dunning, chargeback management)
- [ ] LemonSqueezy / Paddle integration option
- [ ] Merchant of Record (MoR) tax handling
- [ ] Tests for pricing calculations, funnel logic, and payment webhook handling

---

### Iteration 9: Anti-Fraud, Delivery Defense & Blueprint Generator
**Architecture Files:** `09_smoke_testing.md`, `10_blueprint_generator.md`, `12_delivery_and_fraud_defense.md`, `13_anti_fraud_monitoring.md`
**Deliverables:**
- [ ] Smoke testing framework (landing page test, concierge test, pre-sale test)
- [ ] Blueprint generator: complete launch plan output (market, product, revenue, distribution, Day 1)
- [ ] Gated membership access system
- [ ] Content dripping scheduler
- [ ] Digital watermarking module (invisible buyer identity embedding)
- [ ] Refund revocation via Stripe/PayPal webhooks
- [ ] Serial refunder detection
- [ ] Chargeback threshold monitoring with emergency protocols
- [ ] Tests for blueprint output format, watermarking, and fraud detection thresholds

---

### 🛑 Iteration 10: FINAL QUALITY AUDIT (100% Checkpoint)
**Architecture Files:** ALL files in `/architecture/`
**Protocol:** Follow `QA_PROTOCOL.md` exactly.
**Deliverables:**
- [ ] Complete system-wide code audit against all 22 architecture files
- [ ] End-to-end integration test: source ingestion → discovery → scoring → validation → blueprint output
- [ ] Security review (env vars, API key handling, SQL injection prevention)
- [ ] Performance review (response times, database query optimization)
- [ ] Documentation review (README, inline comments, API docs)
- [ ] Remove all TODO comments, dead code, and unused dependencies
- [ ] Final `qa_reports/QA_REPORT_ITERATION_10.md`
- [ ] Update SYSTEM_STATE.md: Iteration 11, Phase COMPLETE
- [ ] **NO NEW FEATURES ALLOWED**
