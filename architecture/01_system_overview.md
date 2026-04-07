# 01 — System Overview

## Generic Product Finder — Solo Founder Opportunity Discovery & Validation System

> An AI-powered system that automatically discovers, scores, validates, and blueprints real-world problems a solo entrepreneur can monetize with digital products. You sell independently — via your own website, Gumroad, LemonSqueezy, Stripe, or any direct platform. Primary objective: **maximum revenue with minimum legal exposure.**

---

## Document Registry

| # | Document | Purpose | App Service |
|---|----------|---------|-------------|
| **01** | [System Overview](./01_system_overview.md) | This file — system purpose, principles, flow, glossary | Root |
| **02a** | [Source Modules: Community](./02a_source_modules_community.md) | Reddit, HN, YouTube, Quora, forum scanning | `services/sources/` |
| **02b** | [Source Modules: Data](./02b_source_modules_data.md) | Google Trends, Exploding Topics, G2, Amazon, regulatory | `services/sources/` |
| **03** | [Discovery Engine](./03_discovery_engine.md) | Phase 1A/1B scanning, triangulation, freshness weighting | `services/discovery/` |
| **04** | [Warm Lead Pipeline](./04_warm_lead_pipeline.md) | Lead capture, CRM, temperature scoring, outreach | `services/leads/` |
| **05a** | [Scoring: Criteria](./05a_scoring_criteria.md) | 15 criteria, weights, kill signals, buyer intent | `services/scoring/` |
| **05b** | [Scoring: Evidence](./05b_scoring_evidence.md) | Evidence chains, calibration, maturity, freshness | `services/scoring/` |
| **06** | [Validation Framework](./06_validation_framework.md) | Deep research, competitive analysis, moat, CAC | `services/validation/` |
| **07a** | [Legal Risk Engine](./07a_legal_risk_engine.md) | Risk scoring, precedent scanning, disclaimer tiers | `services/legal/` |
| **07b** | [Legal Shields](./07b_legal_shields.md) | Product architecture as shield, compliance checklist | `services/legal/` |
| **08a** | [Revenue: Pricing](./08a_revenue_pricing.md) | Price anchoring, format multiplication, velocity | `services/revenue/` |
| **08b** | [Revenue: Funnels](./08b_revenue_funnels.md) | Upsell/downsell math, LTV modeling, hybrid funnels | `services/revenue/` |
| **09** | [Smoke Testing](./09_smoke_testing.md) | Pre-build validation — landing page, concierge, pre-sale | `services/smoke-test/` |
| **10** | [Blueprint Generator](./10_blueprint_generator.md) | Complete launch blueprint with warm leads | `services/blueprint/` |
| **11** | [Intelligence Dashboard](./11_intelligence_dashboard.md) | Run-over-run analytics, calibration, competitive delta | `services/intelligence/` |
| **12** | [Delivery & Fraud Defense](./12_delivery_and_fraud_defense.md) | Gated access, drip, watermarking, revocation | `services/delivery/` |
| **13** | [Anti-Fraud Monitoring](./13_anti_fraud_monitoring.md) | Threshold monitoring, emergency protocols, blacklist | `services/monitoring/` |
| **14** | [Payment Infrastructure](./14_payment_infrastructure.md) | Stripe/LemonSqueezy/Paddle, webhooks, tax | `services/payment/` |
| **15a** | [Database: Core Tables](./15a_database_schema_core.md) | Opportunities, leads, evidence, competitors | `database/` |
| **15b** | [Database: Analytics](./15b_database_schema_analytics.md) | Runs, sources, calibration, queries, migrations | `database/` |
| **16** | [App Architecture](./16_app_architecture.md) | API design, frontend, deployment, multi-user | System architecture |

---

## System Purpose & Vision

### What This System Does

1. **Scans** the internet for real people expressing real pain — frustration, confusion, urgency, unmet needs
2. **Filters** noise from signal using triangulation (same problem must appear in 2+ independent source types)
3. **Scores** every surviving problem against 15 weighted criteria optimized for solo-founder revenue potential
4. **Captures leads** — every person expressing pain is recorded as a potential Day 1 customer
5. **Validates** the top opportunities with deep competitive, legal, timing, and monetization research
6. **Smoke-tests** the top 2-4 before any building happens — proving real conversion interest
7. **Blueprints** the winner(s) into a complete, actionable build plan with warm leads ready to contact
8. **Protects** your product with gated delivery, fraud detection, and automated revocation on refunds
9. **Learns** over time — tracking which criteria predict actual revenue, which sources produce winners

### Who It's For

Solo entrepreneurs who want to find and validate profitable digital product opportunities without guessing. The system does the scouting (wide, repetitive, data-heavy); the founder does the judgment (go/no-go decisions at each gate). You sell products independently through your own website, payment processor, and marketing — not through affiliate networks.

### What It Optimizes For

| Priority | Principle |
|----------|-----------|
| **1** | Revenue generation — finding problems people will pay to solve |
| **2** | Legal safety — avoiding regulated advice, liability traps, uninsurable products |
| **3** | Speed — time-to-first-dollar matters more than theoretical market size |
| **4** | Passivity — revenue should continue with minimal ongoing founder time |
| **5** | Scalability — starter products should ladder into subscriptions and recurring revenue |

---

## Operating Principles

These govern every decision the system makes:

### Revenue Principles

| # | Principle | Explanation |
|---|-----------|-------------|
| 1 | **Pain over novelty** | Seek existing suffering, not clever ideas. Best opportunities are problems people are already complaining about and spending money on inadequate solutions. |
| 2 | **Urgency multiplies value** | Problems with deadlines (regulatory, seasonal) command higher prices and faster purchase decisions. |
| 3 | **Willingness to pay > market size** | A small desperate group beats a massive mildly-annoyed audience. |
| 4 | **Revenue velocity** | Time-to-first-dollar matters. Prefer opportunities generating revenue in weeks, not months. |
| 5 | **Recurring revenue bias** | Prefer subscriptions, memberships, and repeat purchases over one-time sales. |
| 6 | **Passive income prioritization** | Favor high passive-income ratios. Templates and automated tools beat consulting. |
| 7 | **Format multiplication** | One research effort should yield multiple product formats (guide, templates, course, SaaS). |
| 8 | **Proactive timing** | Don't just react to pain — predict it by tracking upcoming regulatory deadlines. Build before demand spikes. |

### Quality Principles

| # | Principle | Explanation |
|---|-----------|-------------|
| 9 | **Evidence over enthusiasm** | Scores of 4-5 must cite specific evidence. No evidence = insufficient signal. |
| 10 | **Distribution before product** | A brilliant product nobody discovers is worthless. Every opportunity needs a clear, low-cost path to buyers. |
| 11 | **Solo founder reality check** | Every opportunity must pass: can one person, with minimal budget, build and deliver this in 2-4 weeks? |
| 12 | **Leads are an asset** | Every person expressing pain during discovery is a potential customer. Capture them systematically. |

### Safety Principles

| # | Principle | Explanation |
|---|-----------|-------------|
| 13 | **Legal risk awareness** | High pain = high profit, but also potential liability. Always assess. For regulated niches, always recommend professional legal review before launch. |
| 14 | **Disclaimer tier compliance** | Only advance opportunities where standard disclaimers provide meaningful protection (Tier A-B). |
| 15 | **Insurance viability** | If no E&O insurance company would cover this product type, it's a kill signal. |

### Protection Principles

| # | Principle | Explanation |
|---|-----------|-------------|
| 16 | **Gated delivery** | Never deliver digital products as plain downloads. Use membership portals with login-based access. |
| 17 | **Drip over dump** | Release content gradually to reduce refund abuse and increase perceived value. |
| 18 | **Automate revocation** | When a refund or chargeback occurs, access must be revoked within 60 seconds via webhooks. |
| 19 | **Monitor continuously** | Track refund rates, chargeback rates, and buyer behavior patterns daily. Escalate on threshold breach. |

---

## End-to-End System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PERIODIC TRIGGER (weekly/biweekly)                │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1A: BROAD SWEEP                            [Doc 02a, 02b]   │
│  Run all enabled source modules → 80-120 raw signals                │
│  Capture leads alongside every signal                   [Doc 04]    │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1B: DEEP EXTRACTION                              [Doc 03]   │
│  Triangulate top signals (need 2/3 source categories)               │
│  Apply freshness weighting, classify maturity stage                  │
│  → 30-50 validated problems                                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
                    ┌──── GATE 1: User Review ────┐
                    │  Present summary + leads     │
                    └──────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: SCORING                                   [Doc 05a, 05b] │
│  Score all problems on 15 criteria (5 core at 2x weight)            │
│  Buyer intent decomposition, maturity bonus, evidence chains        │
│  Auto-disqualify on kill signals                                    │
│  → Ranked shortlist of top 5-8                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
                    ┌──── GATE 2: User Review ────┐
                    │  Ranked table + scores       │
                    └──────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: DEEP VALIDATION                    [Doc 06, 07a, 07b, 08a]│
│  Demand validation, competitive landscape, moat assessment          │
│  Negative signal mining, lawsuit precedent scan                     │
│  Disclaimer tier classification, insurance viability                │
│  CAC estimation, monetization architecture, price anchoring         │
│  Re-score with validated data → advance / conditional / kill        │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
                    ┌──── GATE 3: User Review ────┐
                    │  Validation reports           │
                    └──────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3B: SMOKE TEST                                    [Doc 09]  │
│  Landing page test / concierge test / pre-sale test                 │
│  Upgrade lead temperatures (cold → warm → hot)                      │
│  → Conversion data + qualitative feedback                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
                    ┌──── GATE 3B: User Review ───┐
                    │  Smoke test results           │
                    └──────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 4: BLUEPRINT                                      [Doc 10]  │
│  Complete blueprint: market, product, revenue, distribution, legal  │
│  Revenue stress testing (3-scenario sensitivity analysis)  [Doc 08b]│
│  Day 1 launch plan using warm leads                                 │
│  Format multiplication roadmap                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
                    ┌──── GATE 4: User Review ────┐
                    │  Blueprints + launch plan     │
                    └──────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 5: LAUNCH & PROTECT                    [Doc 12, 13, 14]     │
│  Set up gated delivery portal, payment processing                   │
│  Configure webhook-based access revocation                          │
│  Activate fraud monitoring dashboard                                │
│  → Product live with full protection stack                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE UPDATE                                     [Doc 11]  │
│  Run-over-run delta summary                                         │
│  Score calibration (after 3+ launched products)                     │
│  Competitive delta tracking                                         │
│  Source quality update                                               │
│  Regulatory calendar refresh                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## User Interaction Gates

The system **pauses and presents findings at 5 gates** before proceeding:

| Gate | After | Presents | User Decides |
|------|-------|----------|-------------|
| **Gate 1** | Phase 1B | Problem count, triangulated vs. watch list, lead count, top themes, regulatory calendar hits | Review, inject ideas, approve to scoring |
| **Gate 2** | Phase 2 | Ranked table with scores, maturity stages, velocity scores, format counts, lead counts | Select which opportunities to validate |
| **Gate 3** | Phase 3 | Validation reports including precedent scans, disclaimer tiers, moat scores, CAC | Select 2-4 to smoke-test |
| **Gate 3B** | Phase 3B | Smoke test results: conversion rates, qualitative feedback, lead temperature upgrades | Confirm go/no-go for blueprinting |
| **Gate 4** | Phase 4 | Full blueprints with stress testing, format roadmap, Day 1 launch plan, warm lead counts | Select ONE to execute first |

**Autonomous mode:** When running via scheduled trigger, skip gates — save all outputs, notify user with summary and links.

---

## Time-Boxing Guidance

| Phase | Target | Stop Condition |
|-------|--------|----------------|
| Phase 1A | 80-120 raw signals | Diminishing returns across source modules |
| Phase 1B | 30-50 deep problems | Prioritize triangulated signals |
| Phase 2 | All Phase 1B results | Score every problem — no shortcuts |
| Phase 3 | Top 5-8 | ~15-20 searches per opportunity; early-kill on disqualification |
| Phase 3B | Top 2-4 | 1-2 weeks for smoke test results (user-driven) |
| Phase 4 | Top 2-3 | Thorough — this is the actionable deliverable |
| Phase 5 | Final 1 | Select one to execute first |

---

## Cross-Document Data Flow

| Document | Produces | Consumed By |
|----------|----------|-------------|
| **02a+02b Source Modules** | Raw signals with standardized schema | 03 Discovery Engine |
| **03 Discovery Engine** | Triangulated problems, freshness scores, maturity stages | 05a Scoring, 04 Warm Leads |
| **04 Warm Leads** | Lead records (cold/warm/hot) | 10 Blueprint (Day 1 plan), 11 Intelligence |
| **05a+05b Scoring Engine** | Weighted scores, evidence chains, disqualifications | 06 Validation |
| **06 Validation** | Validated scores, competitive analysis, CAC estimates | 07a Legal, 08a Revenue, 09 Smoke Test |
| **07a+07b Legal Risk** | Disclaimer tier, precedent results, insurance viability | 10 Blueprint |
| **08a+08b Revenue** | Price anchor, format roadmap, stress test, LTV model | 10 Blueprint |
| **09 Smoke Testing** | Conversion data, lead temperature upgrades | 10 Blueprint |
| **10 Blueprint** | Complete blueprints, Day 1 launch plan, final recommendation | User action |
| **11 Intelligence** | Run deltas, calibration updates, competitive changes | 02a+02b Source quality, 05a Scoring weights |
| **12 Delivery Defense** | Gated access, drip schedules, watermarking | Launch execution |
| **13 Monitoring** | Threshold alerts, emergency protocols | Ongoing operations |
| **14 Payment** | Webhook flows, subscription management | Launch execution |
| **15a+15b Database** | Tables, queries, migrations | All services |
| **16 App Architecture** | API endpoints, frontend spec | Development team |

---

## Glossary

| Term | Definition |
|------|------------|
| **Triangulation** | Requiring a problem signal to appear in 2+ independent source categories (community_voice, search_data, marketplace_proof) before advancing |
| **Signal velocity** | Rate at which a pain signal is growing across runs — recurring/intensifying signals get a scoring bonus |
| **Freshness weight** | Time-decay multiplier applied to signals based on age (<30d = 1.2×, 1-3mo = 1.0×, 3-6mo = 0.8×, 6-12mo = 0.6×) |
| **Price anchor** | The price professionals (lawyers, accountants, consultants) charge for solving the same problem — used to position DIY product at 10-20% of this |
| **Disclaimer tier** | Legal protection strength classification: A (very strong — tools/templates), B (strong — educational), C (moderate — calculators), D (weak — advisory = kill) |
| **Maturity stage** | Problem lifecycle: Emerging (<6mo), Growing (6-18mo, +3 bonus), Mature (18mo+, +0), Declining (auto-kill) |
| **Revenue velocity** | Speed to first dollar — scored 0-5 as a core criterion (2x weight) |
| **Format multiplication** | Creating multiple product formats (PDF, templates, video, course, SaaS, community) from a single research effort |
| **Passive income ratio** | Percentage of revenue requiring zero ongoing founder time post-launch (templates = 95%, coaching = 0%) |
| **Warm lead** | A person captured during discovery who expressed the exact pain the product solves — categorized as cold/warm/hot |
| **Evidence chain** | Structured link from each scoring criterion → specific evidence (URL, quote, data) making scores auditable |
| **Moat score** | Defensibility assessment (0-15): brand + content depth + update frequency + distribution + niche specificity |
| **Watch list** | Problems with signals in only 1 source category — held for future runs to see if they triangulate |
| **Run delta** | Summary of changes between consecutive discovery runs — new problems, strengthened/weakened/killed signals |
| **Scoring calibration** | After 3+ launched products, correlating original scores with actual revenue to adjust criterion weights |
| **Kill signal** | Anti-pattern that immediately disqualifies an opportunity (winner-takes-all, platform dependency, high support burden, etc.) |
| **CAC** | Customer Acquisition Cost — estimated per channel, compared to LTV for viability (target: LTV:CAC ≥ 3:1) |
| **LTV** | Lifetime Value — front-end + upsells + (subscription × retention months) |
| **Regulatory calendar** | Database of upcoming regulation effective dates — used for proactive product timing |
| **Source module** | A self-contained plugin that scans one data source (Reddit, Google Trends, etc.) using a standardized interface |
| **MoR** | Merchant of Record — the company legally processing the payment (handles sales tax, chargebacks) |
| **Gated delivery** | Delivering digital products through login-protected membership portals instead of plain downloads |
| **Drip content** | Releasing product content gradually over time to increase perceived value and reduce refund abuse |
| **Webhook** | Automated HTTP notification sent by payment processor when a sale, refund, or chargeback occurs |

---

*This is the master document. For detailed specifications, follow the document links in the registry above.*
