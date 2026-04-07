# 11 — Intelligence Dashboard

> Analytics engine that tracks trends across runs, calibrates scoring weights with real revenue data, monitors competitive changes, tracks regulatory deadlines, and measures source quality. Turns the system from one-shot to continuously improving.

---

## Dashboard Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE DASHBOARD                        │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  Run-Over-Run │ │  Signal      │ │  Problem Lifecycle       │ │
│  │  Delta Summary│ │  Velocity    │ │  Tracking                │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  Competitive  │ │  Regulatory  │ │  Source Quality          │ │
│  │  Delta        │ │  Calendar    │ │  Tracking                │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  Scoring      │ │  Lead Pool   │ │  Alerts                  │ │
│  │  Calibration  │ │  Metrics     │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Run-Over-Run Delta Summary

Generated after every discovery run, comparing to the previous run:

```
RUN DELTA SUMMARY
═════════════════
Run #[N] — [date] vs. Run #[N-1] — [date]

SIGNAL CHANGES:
  New problems discovered:          [N]
  Problems strengthened:            [N] (new evidence for existing)
  Problems weakened:                [N] (contradicting evidence)
  Problems killed since last run:   [N]
  Watch list → Triangulated:        [N] (signals that gained a second category)
  Velocity bonuses applied:         [N] (reappearing signals)

TOP MOVERS:
  ↑ Most strengthened: [name] — was [X] now [Y] because [reason]
  ↓ Most weakened:     [name] — was [X] now [Y] because [reason]
  🆕 Most promising new: [name] — score [X], confidence [level]

LEAD POOL CHANGES:
  New leads captured:               [N]
  Leads upgraded (cold→warm):       [N]
  Leads upgraded (warm→hot):        [N]
  Total lead pool:                  [N] (cold: [N], warm: [N], hot: [N])

SOURCE PERFORMANCE THIS RUN:
  Best source: [module] — [N] signals, [N] triangulated, avg score [X]
  Worst source: [module] — [N] signals, [N] triangulated, avg score [X]

REGULATORY CALENDAR UPDATES:
  New deadlines found:              [N]
  Approaching (< 90 days):         [list with dates]
```

### Trend Detection

After 3+ runs, identify patterns:

| Pattern | Detection | Action |
|---------|----------|--------|
| **Signal acceleration** | Same problem appearing in more sources each run | Promote priority — demand clearly growing |
| **Signal decay** | Problem appearing in fewer sources, lower engagement | Flag — may be solving itself or becoming mature/declining |
| **Source divergence** | Different source categories reporting conflicting signals | Deep-dive needed — conflicting data needs resolution |
| **Niche emergence** | New niche vertical with 3+ signals appearing for first time | Add niche to scan list, may need new vertical configuration |
| **Regulatory cluster** | Multiple regulations affecting same niche within 6 months | High-priority — compound urgency creates premium opportunity |

---

## 2. Signal Velocity Tracking

Track how signals change intensity over time:

```
SIGNAL VELOCITY REPORT
══════════════════════

Problem: [name]
First seen: Run #[N] on [date]

Run History:
  Run #1: [score], [N] sources, confidence [level]
  Run #2: [score], [N] sources, confidence [level], delta [±X]
  Run #3: [score], [N] sources, confidence [level], delta [±X]

Velocity: [Accelerating / Stable / Decelerating / Disappeared]

Promotion thresholds:
  3+ consecutive runs with increasing score → Flag as "Hot Signal"
  2+ consecutive runs with decreasing score → Flag as "Cooling"
  Disappeared for 2+ runs → Archive to watch list
```

---

## 3. Problem Lifecycle Tracking

Track maturity stage transitions:

```
LIFECYCLE STATUS: [date]
═════════════════════════

EMERGING (< 6 months old):
  [Problem A] — first seen [date], [N] runs, current score [X]
  [Problem B] — first seen [date], [N] runs, current score [X]

GROWING (6-18 months, rising signals):
  [Problem C] — growing for [N] months, [N] sources now, score [X] ↑
  [Problem D] — growing for [N] months, [N] sources now, score [X] ↑

MATURE (18+ months, stable signals):
  [Problem E] — stable for [N] months, strong competition
  [Problem F] — stable for [N] months, established products exist

DECLINING (falling signals):
  [Problem G] — declining for [N] months, regulatory simplification likely
```

### Transition Rules

| From → To | Detection | Trigger |
|-----------|----------|---------|
| Emerging → Growing | Signals persist 6+ months AND are increasing | Auto-transition + score bonus (+3) |
| Growing → Mature | Signals stable 18+ months, competition established | Auto-transition, remove bonus |
| Mature → Declining | Falling search volume, fewer community mentions | Auto-transition, flag for potential kill |
| Any → Killed | Regulatory simplification, problem solved by free tool | Manual or auto-kill with reason |

---

## 4. Competitive Delta Tracking

Track changes in competitor landscape between runs:

```
COMPETITIVE CHANGES SINCE LAST RUN
═══════════════════════════════════

PRICE CHANGES:
  [Competitor A]: $97 → $147 (+51%) for [product] in [niche]
  → Implication: Room to undercut OR market signals higher value

NEW ENTRANTS:
  [New Competitor]: Launched [product] at $[X] in [niche]
  → Implication: Validates market, need faster execution

EXITS / DISAPPEARANCES:
  [Former Competitor]: Product page 404'd / discontinued
  → Implication: Market too small? Or they pivoted — investigate

RATING CHANGES:
  [Competitor B]: Rating dropped 4.1★ → 3.5★ (from [N] new reviews)
  → Implication: Dissatisfied customers — opportunity to capture

FEATURE ADDITIONS:
  [Competitor C]: Added [feature] to their [product]
  → Implication: Update differentiation analysis
```

### Alerting Rules

| Change | Alert Level | Action |
|--------|------------|--------|
| Competitor price increase > 20% | 🟡 Medium | Opportunity — undercut possible |
| New competitor with strong launch | 🔴 High | Re-evaluate competitive gap |
| Competitor rating drop > 0.5 stars | 🟡 Medium | Target their dissatisfied customers |
| Competitor disappears | 🟡 Medium | Investigate why — market issue or internal? |
| 3+ new competitors in same space | 🔴 High | Market may be getting crowded — accelerate or reconsider |

---

## 5. Regulatory Calendar Dashboard

```
REGULATORY CALENDAR: [date]
═══════════════════════════

⏰ URGENT (< 30 days):
  [Rule A] — effective [date] — [agency] — [niche]
    Opportunity: [linked] — Status: [phase]
    Product needed by: [date] ← ACTION REQUIRED

📅 UPCOMING (30-90 days):
  [Rule B] — effective [date] — [agency] — [niche]
    Opportunity potential: [high/very_high]
    Opportunity: [linked or "Not yet created"]

🔭 HORIZON (90-365 days):
  [Rule C] — effective [date] — [agency] — [niche]
    Opportunity potential: [medium/high]
    Action: Monitor — begin planning at 90-day mark

📋 RECENTLY PASSED (last 30 days):
  [Rule D] — effective [date] — [agency] — [niche]
    Still generating demand? [yes/no]
    Opportunity: [linked — may still be viable for post-deadline compliance help]
```

---

## 6. Source Quality Tracking

```
SOURCE QUALITY REPORT
═════════════════════

Module           | Signals | Triangulated | Score>65 | Hit Rate | Quality | Trend
─────────────────┼─────────┼──────────────┼──────────┼──────────┼─────────┼───────
reddit           |  45     |  28          |  12      |  27%     |  78     |  ↑
google_trends    |  22     |  18          |   9      |  41%     |  85     |  →
gov_regulatory   |  15     |  12          |   8      |  53%     |  91     |  ↑
upwork_fiverr    |  18     |  10          |   5      |  28%     |  72     |  →
amazon_reviews   |  30     |   8          |   3      |  10%     |  45     |  ↓
hackernews       |  12     |   5          |   2      |  17%     |  52     |  →
x_twitter        |   8     |   3          |   1      |  13%     |  38     |  ↓

ADJUSTMENTS MADE:
  gov_regulatory: Priority 1 → 1 (maintained — highest quality)
  amazon_reviews: Priority 2 → 3 (demoted — low hit rate)
  x_twitter: Under review — 2 more runs before potential disable
```

---

## 7. Scoring Calibration Feedback Loop

After 3+ products launched and tracked:

```
CALIBRATION REPORT
══════════════════

Products tracked: [N] (minimum 3 for initial calibration)
Average 90-day revenue: $[X]

CRITERION CORRELATION WITH REVENUE:
                           Correlation | Current Weight | Recommended
─────────────────────────────────────────────────────────────────────
Pain Intensity              0.82        ★ 2x            ★ 2x (maintain)
Willingness to Pay          0.78        ★ 2x            ★ 2x (maintain)
Urgency/Deadline            0.71        ★ 2x            ★ 2x (maintain)
Revenue Velocity            0.68        ★ 2x            ★ 2x (maintain)
Audience Accessibility      0.65        1x              ★ 2x (PROMOTE)
Solo Feasibility            0.42        ★ 2x            ★ 2x (maintain)
Recurring Need              0.39        1x              1x (maintain)
Format Multiplication       0.35        1x              1x (maintain)
Competition Quality         0.31        1x              1x (maintain)
Price Tolerance             0.28        1x              1x (maintain)
Market Size                 0.22        1x              0.5x (DEMOTE)
Passive Income Ratio        0.20        1x              1x (maintain)
Upsell Path                 0.18        1x              0.5x (DEMOTE)
Content Buildability        0.15        1x              0.5x (DEMOTE)
Legal Risk                  n/a         1x              1x (maintain — safety)

ACTIONS TAKEN:
  Audience Accessibility promoted to core ★ (high correlation with revenue)
  Market Size demoted to 0.5x (low correlation — small markets can be very profitable)
  Upsell Path demoted to 0.5x (upsell promise rarely materialized in practice)
  Content Buildability demoted to 0.5x (AI assistance made this less differentiating)

CONFIDENCE: [Low (3-4 products) / Medium (5-9) / High (10+)]
Next calibration: After [N] more launched products
```

---

## 8. Lead Pool Metrics

```
LEAD POOL DASHBOARD
═══════════════════

TOTAL LEADS: [N]
  🔵 Cold:       [N] ([%])
  🟡 Warm:       [N] ([%])
  🔴 Hot:        [N] ([%])
  ✅ Converted:   [N] ([%])

GROWTH TREND:
  Run #1: [N] total → Run #2: [N] → Run #3: [N]
  Growth rate: [N] new leads per run average

PLATFORM EFFECTIVENESS:
  reddit:        [N] leads → [N] converted → [%] conversion
  hackernews:    [N] leads → [N] converted → [%] conversion
  x_twitter:     [N] leads → [N] converted → [%] conversion
  smoke_test:    [N] leads → [N] converted → [%] conversion

TOP CONVERTING LEAD CHARACTERISTICS:
  Avg engagement score of converted leads: [X]
  Most common influence tier: [tier]
  Most common platform: [platform]
  Avg time from discovery to conversion: [N] days
```

---

## 9. Alert System

Automated alerts between runs:

| Trigger | Alert Level | Notification |
|---------|------------|-------------|
| Regulatory deadline < 30 days with no product | 🔴 Critical | "Deadline [X] in [N] days — no product in pipeline" |
| Competitor price change > 20% | 🟡 Medium | "Competitor [X] changed price from $Y to $Z" |
| New competitor launched | 🟡 Medium | "New competitor [X] launched in [niche]" |
| Signal velocity spike (3x normal) | 🟡 Medium | "Problem [X] signals spiking — investigate" |
| Source module quality < 25 for 3 runs | 🟡 Low | "Source [X] underperforming — review configuration" |
| Hot lead responded | 🟢 Low | "Lead [X] responded to outreach — follow up" |

---

## Dashboard UI Concept (For App)

### Main Dashboard View

```
┌──────────────────────────────────────────────────────────┐
│  OPPORTUNITY PIPELINE                          [Run Now] │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Disc │→│ Score│→│Valid │→│Smoke │→│Build │           │
│  │ [12] │ │  [8] │ │  [5] │ │  [3] │ │  [1] │           │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
├──────────────────────────────────────────────────────────┤
│  🔴 ALERTS (2)                                          │
│  • Deadline: FinCEN BOI in 25 days — no product         │
│  • New competitor: TaxEasy launched in tax niche         │
├──────────────────────────────────────────────────────────┤
│  📊 KEY METRICS           │  👥 LEAD POOL               │
│  Active opportunities: 12 │  Total: 234                  │
│  Avg score: 72            │  🔵 Cold: 189                │
│  Best source: gov_reg     │  🟡 Warm: 38                 │
│  Last run: 3 days ago     │  🔴 Hot: 7                   │
├──────────────────────────────────────────────────────────┤
│  📅 REGULATORY CALENDAR   │  📈 SIGNAL TRENDS            │
│  ⏰ 2 urgent (< 30d)      │  ↑ 3 accelerating            │
│  📅 5 upcoming (30-90d)   │  → 15 stable                 │
│  🔭 8 on horizon          │  ↓ 2 cooling                 │
└──────────────────────────────────────────────────────────┘
```

---

*This document defines the intelligence dashboard. For data underlying these dashboards, see [15a_database_schema_core.md](./15a_database_schema_core.md). For how calibration affects scoring, see [05a_scoring_criteria.md](./05a_scoring_criteria.md).*
