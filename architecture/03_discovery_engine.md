# 03 — Discovery Engine

> The core scanning logic that drives Phase 1A (Broad Sweep) and Phase 1B (Deep Extraction). Orchestrates source modules, applies triangulation and freshness weighting, classifies problem maturity, and feeds results into the Scoring Engine and Warm Lead Pipeline.

---

## Phase 1A: Broad Sweep

### Objective
Fast sweep across all enabled source modules to generate 80-120 raw signals. Speed over depth — capture the signal name, source, emotional intensity, and lead data. Deep analysis comes in Phase 1B.

### Execution Flow

```
1. Load enabled source modules from source_registry (sorted by priority)
2. Load niche configuration (verticals + keywords)
3. For each Tier 1 module:
   a. Call module.scan(niches, keywords, date_range)
   b. Collect SignalResult[] responses
   c. Handle errors (partial results accepted)
4. If total signals < 80, run Tier 2 modules
5. Merge all results into unified signal pool
6. Deduplicate by problem_fingerprint
7. Tag each signal with source_category
8. Store raw signals → phase1a_raw_signals.json
9. Create warm_lead records for every signal with username
```

### Niche Configuration

The system scans these verticals by default. Users can customize the niche list via configuration.

#### 15 Default Verticals

| # | Niche | Sub-Niches | Key Regulatory Bodies (US) |
|---|-------|-----------|---------------------------|
| 1 | **Regulatory compliance** | Environmental, data privacy, industry-specific | EPA, OSHA, state agencies |
| 2 | **Tax & accounting** | Income tax, sales tax, payroll tax, international | IRS, state departments of revenue |
| 3 | **Real estate** | Residential, commercial, property management, HOA | FinCEN, state real estate commissions |
| 4 | **E-commerce** | Marketplace sellers, D2C, dropship, international | FTC, state sales tax authorities |
| 5 | **Healthcare/wellness** | Telehealth, supplements, devices, mental health | FDA, HHS, state medical boards |
| 6 | **HR/employment** | Hiring, payroll, classification, multi-state | DOL, EEOC, state labor boards |
| 7 | **Financial services** | Lending, payments, crypto, investment | FinCEN, SEC, CFPB, state regulators |
| 8 | **Food & beverage** | Restaurants, packaged food, cottage food, alcohol | FDA, USDA, state health departments |
| 9 | **Construction/trades** | General contracting, electrical, plumbing, HVAC | OSHA, state licensing boards |
| 10 | **Professional services** | Legal, accounting, engineering, healthcare | State licensing boards |
| 11 | **Nonprofits** | Formation, fundraising, grants, reporting | IRS (501c3), state AG offices |
| 12 | **SaaS/software** | Privacy, accessibility, security, compliance | FTC, state AGs (CCPA), EU (GDPR) |
| 13 | **Supplements/nutraceuticals** | Labeling, claims, manufacturing, Amazon | FDA, FTC, Amazon compliance |
| 14 | **Education** | K-12, higher ed, online courses, EdTech | DOE, state departments of education |
| 15 | **Marketing/advertising** | Influencer, email, testimonials, ads | FTC, CAN-SPAM, TCPA |

#### Niche-Specific Search Keyword Sets

Each niche has tailored keywords combined with the universal frustration/demand/urgency/gap signals from Doc 02a/02b.

**Example — Real Estate niche keywords:**
```json
{
  "niche_keywords": [
    "landlord compliance", "rental property rules", "HOA regulations",
    "property management reporting", "FinCEN real estate",
    "lead paint disclosure", "fair housing requirements",
    "rental license", "property tax appeal", "eviction process",
    "real estate continuing education", "disclosure requirements"
  ],
  "regulatory_keywords": [
    "FinCEN", "fair housing act", "lead paint rule",
    "security deposit law", "tenant screening law",
    "beneficial ownership reporting"
  ]
}
```

### Deduplication

Two signals are considered duplicates if:
1. Same `problem_fingerprint` (niche + problem name hash)
2. OR same `source_url`
3. OR cosine similarity > 0.85 between one-line descriptions

When merging duplicates:
- Keep the signal with highest `engagement_score`
- Merge `source_urls` into array
- Add all unique `source_categories` to the triangulation field
- Keep both lead records (different people can express the same pain)

---

## Phase 1B: Deep Extraction

### Objective
For the top 40-50 signals from Phase 1A, do focused research to collect full problem data. Prioritize signals that already show triangulation (2+ source categories).

### Selection Criteria (from 1A → 1B)

| Priority | Selection Rule |
|----------|---------------|
| 1 | Signals already triangulated (2+ source categories) |
| 2 | Signals from Tier 1 sources with engagement_score > 50 |
| 3 | Signals matching regulatory calendar entries (upcoming deadlines) |
| 4 | Signals with "desperate" or "severe" emotional intensity |
| 5 | Remaining signals sorted by engagement_score descending |

### Deep Research Per Problem

For each selected signal, conduct focused research:

#### Step 1: Cross-Source Verification
Search for the same problem in different source categories:
- If original source was `community_voice` → search `search_data` and `marketplace_proof`
- If original was `search_data` → search `community_voice` and `marketplace_proof`
- If original was `marketplace_proof` → search `community_voice` and `search_data`

#### Step 2: Frequency Assessment
- Count related posts/mentions in last 90 days
- Classify: one-off / recurring theme / constant flood
- Calculate signal velocity if this problem appeared in previous runs

#### Step 3: Existing Solution Scan
- What are people currently doing? Nothing / DIY / hiring professionals / buying products
- List specific products/services with pricing (feeds price anchor calculation)
- Assess quality of existing solutions

#### Step 4: Money Signal Collection
- Professional service pricing for this problem (lawyers, CPAs, consultants)
- Existing product pricing (courses, templates, tools)
- Specific quotes mentioning money ("my CPA wants $3,000")
- Upwork/Fiverr gig pricing for this task

#### Step 5: Maturity Classification

| Stage | Detection Criteria |
|-------|-------------------|
| **Emerging** | Problem signals < 6 months old, < 500 monthly search volume, < 3 existing products, no dedicated subreddits/communities |
| **Growing** | 6-18 months of signals, 500-5,000 monthly search volume, rising Google Trends, 3-10 products appearing, dedicated subreddits with growing membership |
| **Mature** | 18+ months of signals, 5,000+ stable monthly search volume, flat Google Trends, 10+ established competitors, well-known in the niche |
| **Declining** | Falling search volume over 6+ months, competitors shutting down, regulatory simplification announced, community discussion decreasing |

#### Step 6: Freshness Weight Application

Apply time-decay weights to all signals:

| Signal Age | Weight | Rule |
|-----------|--------|------|
| < 30 days | 1.2× | Premium — very current signal |
| 1-3 months | 1.0× | Standard — within normal window |
| 3-6 months | 0.8× | Aging — still relevant but check for updates |
| 6-12 months | 0.6× | Old — only advance if corroborated by newer signals |
| > 12 months | Discard | Unless it's a documented recurring annual pattern |

**Velocity bonus:** If this problem appeared in a previous discovery run AND appears again this run, add +2 to Pain Intensity — recurring problems are the strongest signals.

---

## Regulatory Change Calendar (Proactive Discovery)

In addition to reactive pain hunting, **actively scan for upcoming regulatory changes** that will create future demand.

### Scanning Strategy

| Source | Scan Method | Frequency |
|--------|------------|-----------|
| Federal Register | Search for "proposed rule" and "final rule" with future effective dates | Every run |
| FinCEN.gov | Check for new advisories, rule amendments, upcoming deadlines | Every run |
| FTC.gov | New enforcement guidelines, updated FTC Act interpretations | Every run |
| IRS.gov/newsroom | New tax forms, reporting requirement changes, compliance deadlines | Every run |
| OSHA.gov | New safety standards, enforcement initiatives | Every run |
| State legislatures (LegiScan) | New state laws affecting small businesses | Monthly |

### Opportunity Assessment Per Deadline

For each upcoming regulatory deadline, assess:

```
REGULATORY OPPORTUNITY ASSESSMENT
──────────────────────────────────
Regulation: [name]
Agency: [FinCEN / FTC / FDA / etc.]
Effective Date: [date]
Days Until Effective: [N]

Who It Affects:
- Niche: [which vertical(s)]
- Personas: [which specific businesses/roles]
- Estimated # affected: [count]

Compliance Burden:
- Complexity: [simple / moderate / complex]
- Professional cost if done via lawyer/CPA: $[X]
- Time to DIY with proper guidance: [hours]

Opportunity Potential: [low / medium / high / very_high]
- DIY product viable? [yes/no — why]
- Urgency premium applicable? [yes/no]
- Recurring? [one-time / annual / ongoing]

Product Window:
- Build by: [date — ideally 30-60 days before effective date]
- Peak demand: [date range — 2-4 weeks before deadline]
- Shelf life: [one-time event / recurring annually / ongoing]
```

### Auto-Feed to Discovery Pipeline

High-potential regulatory deadlines (potential = `high` or `very_high`) automatically generate opportunity entries in the `opportunities` table with:
- `phase` = "discovery"
- `maturity_stage` = "emerging"
- `source_urls` = link to regulatory source
- Regulatory calendar ID linked

---

## Subagent Strategy

For parallel execution during Phase 1:

### Source Clusters

| Cluster | Modules | Subagent Scope |
|---------|---------|---------------|
| **Community** | Reddit, HN, Quora, X/Twitter | One subagent scans all community_voice sources |
| **Data & Trends** | Google Trends, Exploding Topics, Gov/Regulatory, Industry News | One subagent scans all search_data sources |
| **Marketplace** | Amazon reviews, Upwork/Fiverr, App Store, ProductHunt/G2, JVZoo/ClickBank | One subagent scans all marketplace_proof sources |

### Merge Protocol

1. Each subagent writes results to a shared location (JSON file or database)
2. Parent agent merges results, deduplicates by problem_fingerprint
3. Parent tags each signal with its source_category
4. Parent runs triangulation check
5. Parent selects top 40-50 for Phase 1B

---

## Output Format

### Phase 1B Full Problem Record

```
PROBLEM #[N]
───────────────────────────────────
Name: [Short problem name]
One-line: [What is the pain?]

PERSONA:
- Who: [Job title, role]
- Industry: [Niche / sub-niche]
- Company size: [Solo / 2-10 / 11-50 / larger]

SIGNAL DATA:
- Sources: [URLs — list all]
- Triangulation: [categories hit] → Status: [triangulated / watch_list / corroborated]
- Signal type: [frustration / demand / urgency / competitive_gap]
- Emotional intensity: [mild / moderate / severe / desperate]
- Frequency: [one-off / recurring / flood]
- Freshness: [newest signal age] → Weight: [1.2 / 1.0 / 0.8 / 0.6]
- Velocity: [new / reappearing — if reappearing, +2 Pain bonus]

MARKET DATA:
- Maturity stage: [emerging / growing / mature / declining]
- Existing solutions: [what they're doing now — nothing / DIY / pros / products]
- Professional price anchor: $[X] — [who charges this]
- Product price range: $[X-Y] — [existing products]
- Estimated market size: [count of potential buyers]

MONEY SIGNALS:
- [Specific evidence of willingness to pay, with quotes and sources]

REGULATORY CALENDAR:
- Related deadline: [if any, from regulatory_calendar]
- Days until deadline: [N]
- Urgency premium: [yes / no]

LEADS CAPTURED: [N] warm lead records created
- Platforms: [breakdown by platform]
- Top lead: [highest engagement username + quote]

DATA CONFIDENCE: [low / medium / high]
```

### Run Summary

After Phase 1A+1B completes, generate:

```
DISCOVERY RUN SUMMARY
─────────────────────
Date: [run date]
Duration: [X minutes]
Niches scanned: [list]
Source modules used: [list with Tier]

RESULTS:
  Raw signals (Phase 1A):     [N]
  Deep problems (Phase 1B):   [N]
  Triangulated:               [N] (2+ categories)
  Corroborated:               [N] (all 3 categories)
  Watch list (single-source): [N]

LEADS CAPTURED:
  Total: [N]
  By platform: [breakdown]
  
REGULATORY CALENDAR:
  New deadlines found: [N]
  Upcoming (next 90 days): [list]

COMPARISON TO PREVIOUS RUN:
  New problems:              [N]
  Problems strengthened:     [N] (new evidence for existing)
  Problems weakened:         [N] (contradicting evidence)
  Velocity bonuses applied:  [N] (reappearing signals)
```

---

## Geographic Scope

**Default: US market.** All regulatory sources, niche verticals, and search queries default to the United States.

### Localization Guide

To adapt for other markets, the user specifies target geography. The engine then:

| Component | US Default | EU Equivalent | UK Equivalent | India Equivalent |
|-----------|-----------|---------------|---------------|-----------------|
| **Regulatory sources** | Federal Register, FinCEN, FTC, FDA | EU Official Journal, EBA, ESMA, GDPR authorities | Companies House, HMRC, FCA | MCA, GST portal, SEBI, FSSAI |
| **Tax niche** | IRS, state sales tax | VAT Directive, country-specific tax authorities | HMRC, MTD | GST, Income Tax Dept |
| **E-commerce niche** | FTC, state nexus | Consumer Rights Directive, DSA | CMA, ASA | Consumer Protection Act, BIS |
| **Payment platforms** | Stripe, PayPal | Stripe, Mollie, PayPal | Stripe, GoCardless | Razorpay, Paytm |
| **Affiliate platforms** | JVZoo, ClickBank | VigLink, Awin | Awin, ShareASale | vCommission, Cuelinks |

---

*This document defines the discovery engine. For source module specs see [02a_source_modules_community.md](./02a_source_modules_community.md) and [02b_source_modules_data.md](./02b_source_modules_data.md). For lead capture details see [04_warm_lead_pipeline.md](./04_warm_lead_pipeline.md). For scoring see [05a_scoring_criteria.md](./05a_scoring_criteria.md).*
