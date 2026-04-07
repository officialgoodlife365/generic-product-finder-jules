# 05a — Scoring Engine: Criteria & Rubrics

> Scores every discovered problem against 15 weighted criteria optimized for solo-founder revenue potential. Produces a ranked shortlist with automatic disqualification rules and anti-pattern kill signals.

---

## Scoring Overview

```
Phase 1B problems (30-50)
         │
         ▼
┌─────────────────────────────────┐
│      SCORING ENGINE             │
│                                 │
│  1. Score 15 criteria (0-5)     │
│  2. Buyer intent decomposition  │
│  3. Maturity stage bonus        │
│  4. Weighted calculation        │
│  5. Evidence chain storage      │  ← Doc 05b
│  6. Auto-disqualification       │
│  7. Anti-pattern kill check     │
│  8. Confidence rating           │  ← Doc 05b
│  9. Rank by weighted score      │
└────────────┬────────────────────┘
             ▼
     Top 5-8 opportunities
         (min score: 50)
```

---

## The 15 Scoring Criteria

### Criterion Reference Table

| # | Criterion | Weight | Category |
|---|-----------|--------|----------|
| 1 | Pain Intensity | ★ 2x | Revenue signal |
| 2 | Willingness to Pay | ★ 2x (decomposed) | Revenue signal |
| 3 | Urgency / Deadline | ★ 2x | Revenue signal |
| 4 | Solo Founder Feasibility | ★ 2x | Feasibility |
| 5 | Revenue Velocity | ★ 2x | Revenue signal |
| 6 | Market Size | 1x | Market |
| 7 | Recurring Need | 1x | Revenue model |
| 8 | Competition Quality | 1x | Market |
| 9 | Legal Risk | 1x | Safety |
| 10 | Audience Accessibility | 1x | Distribution |
| 11 | Price Tolerance | 1x | Revenue model |
| 12 | Upsell Path | 1x | Revenue model |
| 13 | Content Buildability | 1x | Feasibility |
| 14 | Passive Income Ratio | 1x | Revenue model |
| 15 | Format Multiplication | 1x | Revenue model |

★ = Core criteria — counted twice in weighted calculation.

---

### Detailed Rubrics

#### 1. Pain Intensity ★

| Score | Definition | Evidence Examples |
|-------|-----------|-------------------|
| 0 | No pain detected — hypothetical problem | No complaints found anywhere |
| 1 | Mild inconvenience — "would be nice to fix" | Occasional mentions, low engagement |
| 2 | Noticeable frustration — people complain but work around it | Reddit posts with 10-30 upvotes, generic complaints |
| 3 | Significant pain — disrupts workflow or causes real cost | Multiple Reddit threads (30-50 upvotes), repeated complaints across platforms |
| 4 | Severe pain — business-threatening, risk of fines or loss | 50+ upvote posts, emotional language ("nightmare", "desperate"), professional fees paid to resolve |
| 5 | Crisis-level — keeps people up at night, existential business threat | 100+ upvote threads, enforcement actions reported, panic in communities, "I might have to shut down" |

#### 2. Willingness to Pay ★ (Decomposed)

This criterion is scored as the **average of 4 sub-signals**, each scored 0-5:

##### Sub-signal 2A: Explicit Price Mentions

| Score | Definition |
|-------|-----------|
| 0 | No one mentions money at all |
| 1 | Vague "I'd pay for something" without numbers |
| 2 | Specific small amounts mentioned ($10-50 range) |
| 3 | Moderate amounts ($50-200) mentioned by multiple people |
| 4 | High amounts ($200-500+) mentioned, specific product requests with pricing expectations |
| 5 | People openly stating "shut up and take my money" with specific high prices ($500+) |

##### Sub-signal 2B: Active Spending

| Score | Definition |
|-------|-----------|
| 0 | No existing paid products in this space |
| 1 | Free tools/resources only, no paid alternatives |
| 2 | A few low-cost products exist ($10-30) with low sales |
| 3 | Multiple paid products ($30-100) with moderate sales evidence |
| 4 | Established market with products at $100-300, clear sales volume |
| 5 | Thriving market: multiple competitors at $200+, strong sales signals |

##### Sub-signal 2C: Professional Alternative Spending

| Score | Definition |
|-------|-----------|
| 0 | No professional services for this problem |
| 1 | Professionals address this as part of larger engagements (not separately priced) |
| 2 | Freelancers on Upwork/Fiverr charge $50-200 for this |
| 3 | Professional services specifically for this problem at $200-500 |
| 4 | Accountants/lawyers/consultants charge $500-2,000 specifically for this |
| 5 | Professional alternative costs $2,000+ — massive price anchoring opportunity |

##### Sub-signal 2D: Transactional Search Intent

| Score | Definition |
|-------|-----------|
| 0 | All search queries are purely informational ("what is [topic]") |
| 1 | Mostly informational with rare "how to" queries |
| 2 | "How to [solve problem]" queries present but low volume |
| 3 | "Template", "checklist", "tool" queries present alongside informational |
| 4 | Strong transactional intent: "buy", "best [product] for", "hire [professional] for" |
| 5 | High-volume transactional queries: "[product type] template", "affordable [professional service]" |

**Final WTP Score = Average of (2A + 2B + 2C + 2D)**, rounded to nearest 0.5.

#### 3. Urgency / Deadline ★

| Score | Definition | Evidence Examples |
|-------|-----------|-------------------|
| 0 | No urgency — "nice to have", infinite timeline | No deadlines, no penalties, lifestyle improvement |
| 1 | Mild urgency — "should do eventually" | Recommended best practice but no enforcement |
| 2 | Moderate — seasonal or periodic pressure | Annual filing, tax season, quarterly reporting |
| 3 | Strong — meaningful financial risk for delay | Late fees, audit risk, competitive disadvantage from delay |
| 4 | High — regulatory deadline within 6 months, significant penalties | Upcoming rule effective date, fines for non-compliance, enforcement ramp-up |
| 5 | Extreme — hard deadline approaching, non-compliance = business shutdown | FinCEN-style mandate with criminal penalties, license revocation, platform suspension |

#### 4. Solo Founder Feasibility ★

| Score | Definition |
|-------|-----------|
| 0 | Requires: funded team, proprietary technology, licenses, or $50k+ investment |
| 1 | Requires: specialized team (engineers + domain expert), $10-50k, 6+ months |
| 2 | Requires: 1-2 people, $5-10k, 3-6 months, moderate technical skills |
| 3 | One person can build with moderate effort: $1-5k, 1-3 months, some technical skills |
| 4 | One person, minimal budget ($0-1k), 2-4 weeks, AI-assistable throughout |
| 5 | One person, zero budget, 1-2 weeks, almost entirely AI-assistable, established delivery platforms |

#### 5. Revenue Velocity ★

| Score | Definition | Benchmark |
|-------|-----------|-----------|
| 0 | 12+ months to first dollar — R&D heavy, complex product | Custom SaaS platform |
| 1 | 6-12 months — significant build + slow distribution | Specialized course + community |
| 2 | 3-6 months — moderate build + distribution ramp-up | Comprehensive course + launch |
| 3 | 1-3 months — quick build, distribution exists | Template pack + community launch |
| 4 | 2-4 weeks — very quick build, immediate distribution available | Compliance checklist + Reddit community |
| 5 | Days to 2 weeks — minimal build, can sell immediately | Urgent compliance one-pager for imminent deadline |

#### 6. Market Size

| Score | Definition |
|-------|-----------|
| 0 | Fewer than 500 potential buyers |
| 1 | 500-1,000 potential buyers |
| 2 | 1,000-10,000 potential buyers |
| 3 | 10,000-50,000 potential buyers |
| 4 | 50,000-100,000 potential buyers |
| 5 | 100,000+ potential buyers |

#### 7. Recurring Need

| Score | Definition |
|-------|-----------|
| 0 | Complete one-time solution — never return (e.g., LLC formation) |
| 1 | Rare recurrence — once every few years (e.g., trademark renewal) |
| 2 | Annual need (e.g., annual tax filings, annual compliance reports) |
| 3 | Quarterly need (e.g., quarterly tax estimates, quarterly audits) |
| 4 | Monthly need (e.g., bookkeeping, monthly compliance reporting) |
| 5 | Daily/weekly operational need (e.g., ongoing compliance monitoring, regular reporting) |

#### 8. Competition Quality

| Score | Definition |
|-------|-----------|
| 0 | Market dominated by well-funded, high-quality incumbents — winner-takes-all dynamics |
| 1 | Strong competitors but some gaps — entry would be uphill battle |
| 2 | Several moderate competitors — clear room but differentiation needed |
| 3 | Few competitors, mixed quality — obvious gaps exist |
| 4 | Weak/overpriced/outdated competitors — clear differentiation opportunity |
| 5 | No meaningful competition — green field, first real solution |

#### 9. Legal Risk

| Score | Definition |
|-------|-----------|
| 0 | Directly provides medical, legal, or financial ADVICE — extreme liability |
| 1 | Product output could be relied upon as professional guidance — high liability |
| 2 | Adjacent to regulated space but careful framing needed — moderate liability |
| 3 | Educational content about regulated topics — acceptable with disclaimers |
| 4 | Tools and templates — low liability with standard disclaimers |
| 5 | Purely organizational/productivity — near-zero liability (e.g., Canva templates for wedding planners) |

#### 10. Audience Accessibility

| Score | Definition |
|-------|-----------|
| 0 | No known concentration point — audience is diffuse and anonymous |
| 1 | Audience exists but behind paywalls or private groups only |
| 2 | On public platforms but hard to target (broad subreddits, no niche communities) |
| 3 | Dedicated subreddits, forums, or groups with 5k-50k members |
| 4 | Active niche communities + influencers serving this audience |
| 5 | Concentrated, easily reachable audience with proven responsiveness to offers |

#### 11. Price Tolerance

| Score | Definition |
|-------|-----------|
| 0 | Under $10 — not worth selling |
| 1 | $10-30 — micro-product territory |
| 2 | $30-70 — low-end digital product |
| 3 | $70-150 — standard digital product |
| 4 | $150-300 — premium product |
| 5 | $300+ front-end, or $100+/month recurring |

#### 12. Upsell Path

| Score | Definition |
|-------|-----------|
| 0 | Dead end — this is the only conceivable product |
| 1 | One possible add-on but it's a stretch |
| 2 | One natural upsell (e.g., starter → premium version) |
| 3 | Two-step ladder (starter → premium → advanced) |
| 4 | Natural three-step funnel (starter → premium → subscription) |
| 5 | Full ecosystem potential: starter → premium → subscription → community → services referral |

#### 13. Content Buildability

| Score | Definition |
|-------|-----------|
| 0 | Requires licensed professional to create (lawyer must draft, doctor must review) |
| 1 | Requires deep domain expertise the founder must personally possess |
| 2 | Requires significant research + domain expert review |
| 3 | Research-intensive but AI-assistable with expert review recommended |
| 4 | Mostly AI-assistable — templates, guides, checklists from public information |
| 5 | Fully AI-assistable — organizational tools, calculators, formatting, aggregation |

#### 14. Passive Income Ratio

| Score | Definition |
|-------|-----------|
| 0 | 0% passive — every dollar requires active founder time (consulting, live coaching) |
| 1 | 10-25% passive — mostly service-based with some content |
| 2 | 25-50% passive — mix of pre-built content + active support needed |
| 3 | 50-75% passive — mostly automated delivery with periodic updates |
| 4 | 75-90% passive — digital delivery, minimal support, annual updates |
| 5 | 90-100% passive — fully automated: templates, downloads, self-service portal |

#### 15. Format Multiplication

| Score | Definition |
|-------|-----------|
| 0 | Only one format possible (e.g., custom consulting — not productizable) |
| 1 | Two formats from same research |
| 2 | Three formats (e.g., PDF guide + template pack + checklist) |
| 3 | Four formats (e.g., + video walkthrough) |
| 4 | Five formats (e.g., + online course or membership) |
| 5 | Six+ formats including SaaS/tool potential (e.g., + calculator + subscription + community) |

---

## Weighted Scoring Calculation

### Formula

```
Raw Score = Sum of all 15 criteria scores
            Max = 15 × 5 = 75

Core Bonus = Pain + WTP + Urgency + Feasibility + Revenue Velocity
             Max = 5 × 5 = 25

Maturity Bonus = +3 (growing) | +1 (emerging) | +0 (mature) | KILL (declining)

Weighted Score = Raw Score + Core Bonus + Maturity Bonus
                 Max = 75 + 25 + 3 = 103 (theoretical)
                 Practical max ≈ 95-100
```

### Worked Example

```
Opportunity: "FinCEN AML Compliance Kit for Small Landlords"

 1. Pain Intensity:        4 (severe — 100+ upvote threads, "nightmare" language)
 2. Willingness to Pay:    4 (2A:3 + 2B:4 + 2C:5 + 2D:4 = avg 4.0)
 3. Urgency/Deadline:      5 (March 2026 hard deadline, criminal penalties)
 4. Solo Feasibility:      4 (one person, 2 weeks, AI-assistable)
 5. Revenue Velocity:      5 (urgent deadline = immediate sales)
 6. Market Size:           3 (est. ~25,000 small landlords affected)
 7. Recurring Need:        2 (annual filing)
 8. Competition Quality:   4 (one overpriced competitor, no good DIY option)
 9. Legal Risk:            3 (educational, needs disclaimers, Tier B)
10. Audience Accessibility:4 (r/landlord, r/realestateinvesting, BiggerPockets)
11. Price Tolerance:       3 ($97-197 range based on CPA pricing of $2,000)
12. Upsell Path:           3 (starter → premium with state guides → annual update sub)
13. Content Buildability:  4 (public FinCEN rules, AI-assistable)
14. Passive Income Ratio:  4 (PDF + template delivery, annual update only)
15. Format Multiplication: 4 (PDF guide, template pack, video walkthrough, checklist, subscription)

Raw Score:     4+4+5+4+5+3+2+4+3+4+3+3+4+4+4 = 56/75
Core Bonus:    4+4+5+4+5 = 22
Maturity Bonus: +3 (growing — new regulation, rising demand)
Weighted Score: 56 + 22 + 3 = 81/~103

Rating: 🟢 Exceptional
Confidence: HIGH (3+ sources, specific data, multiple signal types)
```

---

## Calibration Benchmarks

| Weighted Score Range | Rating | Interpretation | Action |
|---------------------|--------|----------------|--------|
| **80-103** | 🟢 Exceptional | Every signal is strong. Rare. | Validate immediately, prioritize above all others |
| **65-79** | 🟡 Strong | Good opportunity with solid evidence | Deep validation — likely to advance |
| **50-64** | 🟠 Moderate | Mixed signals, some gaps | Only validate if pipeline is thin |
| **Below 50** | 🔴 Weak | Insufficient evidence | Do NOT advance — archive or kill |

---

## Automatic Disqualification Rules

If **ANY** of these conditions is met, the opportunity is immediately killed:

| Criterion | Kill Threshold | Rationale |
|-----------|---------------|-----------|
| Legal Risk | ≤ 1 | Unacceptable liability for solo founder |
| Solo Founder Feasibility | ≤ 1 | Cannot be built by one person |
| Content Buildability | ≤ 1 | Requires licensed professional creation |
| Willingness to Pay | = 0 | Zero evidence of payment behavior |
| Market Size | ≤ 1 | Fewer than ~1,000 potential buyers |
| Competition Quality | = 0 | Winner-takes-all, dominant incumbents |
| Audience Accessibility | ≤ 1 | Cannot reach buyers cost-effectively |
| Passive Income Ratio | ≤ 1 | Near-100% active time — doesn't scale |
| Maturity Stage | = declining | Shrinking market |

When killing, record `kill_reason` and `kill_date` in the `opportunities` table (Doc 15a).

---

## Anti-Patterns: Kill Signals

Beyond score thresholds, these patterns are immediate kill or flag signals:

| Anti-Pattern | Why It Kills | Detection Method |
|-------------|-------------|-----------------|
| **Winner-takes-all / network effects** | Value scales with user count — solo founder can't compete | Check if existing solutions benefit from more users (marketplaces, social platforms) |
| **Requires trust/credentials** | Buyers won't trust unknown solo founder for stakes decisions | Check if buyers would ask "who are you?" before purchasing |
| **Real-time data feed dependency** | Maintenance burden unsustainable; API costs compound | Check if product value depends on live/current data |
| **Single-platform dependency** | One policy change kills the business | Check if product only works on/for one platform |
| **Ongoing human-expert content** | Can't be AI-assisted; scales linearly with time | Check if each update requires personal expertise vs. systematic research |
| **High customer support burden** | Each customer requires significant hand-holding | Check if product requires onboarding, customization, or troubleshooting |
| **Trend-dependent without durability** | Opportunity evaporates with news cycle | Check if demand persists beyond the initial news buzz (>3 months) |
| **Regulatory simplification imminent** | Government actively simplifying the problem | Check for legislation aimed at reducing the exact complexity you'd monetize |

---

*This document defines the scoring criteria, rubrics, and disqualification rules. For evidence chains, calibration, and confidence ratings, see [05b_scoring_evidence.md](./05b_scoring_evidence.md).*
