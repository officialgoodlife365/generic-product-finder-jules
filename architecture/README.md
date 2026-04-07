# Product 1: Generic Product Finder — README

> **What is this?** A complete AI-powered system that automatically discovers, scores, validates, and blueprints real-world problems a solo entrepreneur can monetize with digital products. You sell independently — via your own website, Gumroad, LemonSqueezy, Stripe, or any direct platform.

---

## How It Works (Simple Version)

```
1. AI scans Reddit, YouTube, forums, Google Trends → finds people with real pain
2. AI triangulates signals → same problem in 2+ independent sources = real demand
3. AI scores every problem → 15 weighted criteria optimized for solo-founder revenue
4. AI captures leads → every person expressing pain is a potential Day 1 customer
5. AI validates top opportunities → competitive analysis, legal risk, moat assessment
6. You smoke-test → quick landing page to prove real conversion interest
7. AI blueprints the winner → complete build plan with warm leads ready to contact
8. You launch → gated delivery, fraud protection, payment processing all documented
```

**Your role:** Make go/no-go decisions at 5 gates, run smoke tests, build and launch the winning product.
**AI's role:** Discovery, scoring, validation, blueprinting, lead capture, competitive analysis.

---

## File Guide

### 🔍 Discovery Layer — *"Finding problems worth solving"*

| File | What It Does |
|---|---|
| [01_system_overview.md](./01_system_overview.md) | Master index: system purpose, end-to-end flow, all 5 user gates, glossary |
| [02a_source_modules_community.md](./02a_source_modules_community.md) | Reddit, Hacker News, YouTube, Quora, niche forums — scanning for human pain signals |
| [02b_source_modules_data.md](./02b_source_modules_data.md) | Google Trends, Exploding Topics, G2/ProductHunt, Amazon/Udemy, regulatory calendars |
| [03_discovery_engine.md](./03_discovery_engine.md) | Triangulation logic, deep extraction, freshness weighting, maturity classification |
| [04_warm_lead_pipeline.md](./04_warm_lead_pipeline.md) | Lead capture CRM, temperature scoring (cold→warm→hot), outreach templates |

### 📊 Scoring & Validation Layer — *"Separating signal from noise"*

| File | What It Does |
|---|---|
| [05a_scoring_criteria.md](./05a_scoring_criteria.md) | 15 criteria with weights, 5 core at 2× weight, kill signals, buyer intent decomposition |
| [05b_scoring_evidence.md](./05b_scoring_evidence.md) | Evidence chains, calibration loop, maturity bonuses, freshness decay, re-scoring |
| [06_validation_framework.md](./06_validation_framework.md) | Deep competitive analysis, moat assessment, negative signal mining, CAC estimation |

### ⚖️ Legal & Compliance — *"Staying safe"*

| File | What It Does |
|---|---|
| [07a_legal_risk_engine.md](./07a_legal_risk_engine.md) | Legal risk scoring (1-5), precedent scanning, disclaimer tiers (A-D), auto-disqualify industries |
| [07b_legal_shields.md](./07b_legal_shields.md) | Product architecture as legal shield, gated delivery, safe vs banned copy, compliance checklist, insurance, attorney engagement |

### 💰 Revenue & Monetization — *"Making money"*

| File | What It Does |
|---|---|
| [08a_revenue_pricing.md](./08a_revenue_pricing.md) | Price anchoring, format multiplication, passive income ratio, revenue velocity |
| [08b_revenue_funnels.md](./08b_revenue_funnels.md) | Upsell/downsell framework, LTV modeling, order bumps, hybrid funnel architecture, stress testing |
| [09_smoke_testing.md](./09_smoke_testing.md) | Pre-build validation: landing page tests, concierge tests, pre-sale tests |
| [10_blueprint_generator.md](./10_blueprint_generator.md) | Complete launch blueprint: market, product, revenue, distribution, Day 1 plan |

### 📈 Intelligence — *"Getting smarter over time"*

| File | What It Does |
|---|---|
| [11_intelligence_dashboard.md](./11_intelligence_dashboard.md) | Run-over-run analytics, scoring calibration, competitive delta tracking |

### 🛡️ Delivery & Protection — *"Protecting your product"*

| File | What It Does |
|---|---|
| [12_delivery_and_fraud_defense.md](./12_delivery_and_fraud_defense.md) | Gated membership access, content dripping, watermarking, refund revocation via Stripe/PayPal |
| [13_anti_fraud_monitoring.md](./13_anti_fraud_monitoring.md) | Refund/chargeback thresholds, emergency protocols, serial refunder detection |
| [14_payment_infrastructure.md](./14_payment_infrastructure.md) | Stripe vs LemonSqueezy vs Paddle, webhook flows, subscription dunning, MoR tax handling |

### 🏗️ Technical Architecture — *"Building the app"*

| File | What It Does |
|---|---|
| [15a_database_schema_core.md](./15a_database_schema_core.md) | Core tables: opportunities, warm_leads, evidence_chains, competitor_snapshots |
| [15b_database_schema_analytics.md](./15b_database_schema_analytics.md) | Analytics tables: discovery_runs, source_registry, score_calibration, migrations |
| [16_app_architecture.md](./16_app_architecture.md) | API design, frontend spec, deployment, multi-user support |

---

## How the Files Chain Together

```
  ┌────────────┐     ┌──────────────┐     ┌──────────────┐
  │ 02a + 02b  │────►│ 03 Discovery │────►│ 04 Warm Leads│
  │ Source      │     │ Engine       │     │ Pipeline     │
  │ Modules    │     └──────┬───────┘     └──────────────┘
  └────────────┘            │
                            ▼
  ┌────────────┐     ┌──────────────┐     ┌──────────────┐
  │ 07a + 07b  │────►│ 05a+05b      │────►│ 06 Validation│
  │ Legal Risk │     │ Scoring      │     │ Framework    │
  └────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
              ┌──────────────┐                    ▼
              │ 08a+08b      │◄──── ┌──────────────────┐
              │ Revenue      │      │ 09 Smoke Testing  │
              └──────┬───────┘      └──────┬───────────┘
                     │                     │
                     ▼                     ▼
              ┌──────────────┐     ┌──────────────┐
              │ 10 Blueprint │     │ 11 Dashboard │
              │ Generator    │     │ Intelligence │
              └──────┬───────┘     └──────────────┘
                     │
                     ▼
  ┌────────────┬──────────────┬──────────────┐
  │ 12 Delivery│ 13 Anti-Fraud│ 14 Payment   │
  │ Defense    │ Monitoring   │ Infra        │
  └────────────┴──────────────┴──────────────┘
```

---

## Quick Start: Read These 3 Files First

1. **[01 — System Overview](./01_system_overview.md)** — Understand the full pipeline from scanning to launch
2. **[05a — Scoring Criteria](./05a_scoring_criteria.md)** — See how opportunities are ranked
3. **[10 — Blueprint Generator](./10_blueprint_generator.md)** — See the final output: a complete launch plan

---

## Glossary

| Term | Meaning |
|---|---|
| **Triangulation** | Requiring a signal to appear in 2+ independent source categories before advancing |
| **Signal velocity** | Rate at which a pain signal is growing across consecutive runs |
| **Freshness weight** | Time-decay multiplier (<30d = 1.2×, 1-3mo = 1.0×, 3-6mo = 0.8×) |
| **Price anchor** | What professionals charge for solving the same problem — your product prices at 10-20% of this |
| **Disclaimer tier** | Legal protection classification: A (tools), B (educational), C (calculators), D (advisory = kill) |
| **Maturity stage** | Problem lifecycle: Emerging, Growing (+3 bonus), Mature, Declining (auto-kill) |
| **Revenue velocity** | Speed to first dollar — scored 0-5 as a core criterion at 2× weight |
| **Format multiplication** | Creating multiple product formats from one research effort |
| **Passive income ratio** | % of revenue requiring zero ongoing founder time post-launch |
| **Warm lead** | Person captured during discovery expressing the exact pain the product solves |
| **Evidence chain** | Link from each score → specific evidence (URL, quote, data) making scores auditable |
| **Moat score** | Defensibility: brand + content depth + update frequency + distribution + niche specificity |
| **Kill signal** | Anti-pattern that immediately disqualifies (winner-takes-all, platform dependency, etc.) |
| **LTV** | Lifetime Value — front-end + upsells + (subscription × retention months) |
| **CAC** | Customer Acquisition Cost — estimated per channel, target LTV:CAC ≥ 3:1 |
| **MoR** | Merchant of Record — company legally processing payment (handles taxes, chargebacks) |
| **Drip content** | Releasing content gradually over time instead of all at once |
| **Watermarking** | Embedding invisible buyer identity data in digital files for piracy detection |

---

*This is a standalone product. All documentation needed is contained within this folder.*
