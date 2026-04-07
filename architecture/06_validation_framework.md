# 06 — Validation Framework

> Phase 3 deep research on the top 5-8 scored opportunities. Validates demand, competitive landscape, moats, legal standing, monetization viability, and distribution feasibility. Re-scores with validated data. Output: advance / conditional / kill verdict per opportunity.

---

## Validation Overview

```
Top 5-8 from Scoring (Doc 05a)
            │
            ▼
┌────────────────────────────────────────────────┐
│           VALIDATION ENGINE                     │
│                                                │
│  1. Demand Validation        (is the pain real and big enough?)
│  2. Competitive Landscape    (who else is solving this?)
│  3. Competitive Moat         (can you defend your position?)
│  4. Negative Signal Mining   (why DON'T people buy?)
│  5. Urgency & Timing         (is the window open?)
│  6. Audience & Distribution  (can you reach buyers cheaply?)
│  7. Product Feasibility      (can one person build this?)
│  8. CAC Estimation           (how much to acquire a customer?)
│  9. Monetization Architecture(what's the full revenue model?)
│  10. Post-Validation Re-Score                   │
│                                                │
└────────────┬───────────────────────────────────┘
             ▼
    Advance / Conditional / Kill
```

---

## 1. Demand Validation

Confirm that the pain discovered in Phase 1 represents real, sustained, monetizable demand.

### Search Volume Analysis

| Metric | How to Find | What It Means |
|--------|------------|---------------|
| Monthly search volume | Google Keyword Planner, Ahrefs free, Ubersuggest | Scale of demand — how many people search for solutions |
| Trend direction | Google Trends (12-month, 5-year) | Growing = good, declining = bad |
| Related searches | Google "People also ask", "Related searches" | Demand variations, adjacent problems |
| Long-tail queries | "[problem] template", "[problem] checklist", "[problem] tool" | Transactional intent — people looking to buy solutions |

### Community Frequency

| Signal | Interpretation |
|--------|---------------|
| Same problem posted 3+ times in 90 days in same community | Strong recurring demand |
| Same problem across 3+ communities | Cross-community validation |
| Posts getting 50+ upvotes consistently | Broad resonance |
| Posts getting replies like "same here" or "I have this problem too" | Social proof of widespread pain |

### Marketplace Demand Confirmation

| Evidence | Source | Why It Matters |
|---------|--------|---------------|
| Existing products with sales (even poor ones) | Amazon, Udemy, ClickBank, Gumroad | People are already paying — you need to be better, not first |
| Upwork/Fiverr gigs with repeat clients | Freelance platforms | Recurring professional spending = automatable |
| People asking where to buy solutions | Reddit, forums, Quora | Explicit buying intent |

### Demand Strength Rating

| Rating | Criteria |
|--------|---------|
| ✅ **Confirmed** | 1,000+ monthly searches + community frequency + marketplace evidence |
| ⚠️ **Probable** | 500-1,000 searches + some community mentions + limited marketplace |
| 🔴 **Unconfirmed** | < 500 searches + sporadic mentions + no marketplace evidence |

---

## 2. Competitive Landscape

Map every competitor and assess the opportunity gap.

### Competitor Research Template

```
COMPETITOR: [Name]
─────────────────
URL:              [url]
Product type:     [PDF / course / SaaS / templates / subscription]
Price:            [price]
Rating:           [stars] ([N] reviews)
Estimated sales:  [if available — ClickBank gravity, Amazon rank, etc.]

STRENGTHS:
- [what they do well — based on positive reviews]

WEAKNESSES (from 1-3 star reviews):
- [specific complaints]
- [missing features]
- [audience left behind]

YOUR DIFFERENTIATION:
- [what you'll do differently or better]
```

### Competitive Gap Matrix

| Factor | Competitor A | Competitor B | Competitor C | Your Opportunity |
|--------|-------------|-------------|-------------|-----------------|
| Price | $297 | $97 | Free (limited) | $127 (sweet spot) |
| Coverage | Generic, US only | CA only | Basic | All 50 states |
| Format | PDF only | Video course | Blog posts | PDF + templates + video |
| Update frequency | Last updated 2023 | Monthly | Sporadic | Annual (with subscription) |
| Support | None | Email | None | Self-service + FAQ |
| Rating | 3.2★ | 4.1★ | N/A | Target: 4.5+★ |

---

## 3. Competitive Moat Assessment

Rate defensibility across 5 dimensions:

| Dimension | 0 (None) | 1 (Basic) | 2 (Moderate) | 3 (Strong) |
|-----------|----------|-----------|-------------|-----------|
| **Brand authority** | Nobody knows you | One channel presence | Multi-channel, some followers | Recognized name in niche |
| **Content depth** | Surface-level content anyone can make | Some original research or analysis | Deep research + proprietary data | Comprehensive definitive resource |
| **Update cadence** | One-time product, never updated | Occasional updates | Annual updates on schedule | Continuous updates (subscription-worthy) |
| **Distribution advantage** | No distribution channels | One channel (e.g., SEO only) | Multi-channel (SEO + affiliate) | Owned audience + affiliate network |
| **Niche specificity** | Broad market product | Industry-focused | Sub-niche focused | Hyper-specific persona |

**Moat Score = Sum of all 5 dimensions (max 15)**

| Moat Score | Verdict | Implication |
|-----------|---------|-------------|
| **12-15** | Defensible | Strong — worth building a business around |
| **8-11** | Moderate | Good — focus on deepening 2-3 weak dimensions |
| **4-7** | Fragile | Risky — competitors can easily replicate |
| **0-3** | Commodity | Kill unless speed-to-market gives temporary advantage |

---

## 4. Negative Signal Mining

**Mandatory step.** Actively search for reasons people DON'T buy or DON'T succeed with existing solutions.

### Search Queries

```
"[product/niche] not worth it" OR "waste of money"
"[product/niche] refund" OR "got refunded"
"[product/niche] scam" OR "ripoff"
"[product/niche] didn't work" OR "didn't help"
"[product/niche] lawsuit" OR "got sued"
"[competitor name] review" negative
"[competitor name] complaint"
```

### Interpretation Rules

| Negative Signal Found | Impact on Scoring |
|----------------------|-------------------|
| "Product didn't cover my situation" | Opportunity for more specific product — may improve differentiation |
| "It was too generic" | Confirms niche-specific approach is the right strategy |
| "I tried it and it was wrong / inaccurate" | Legal risk warning — accuracy matters in this space. Increase Legal Risk attention |
| "Got refunded — wasn't what I expected" | Positioning risk — must be very clear about what the product IS and ISN'T |
| "I got sued / fined even after using a similar product" | 🔴 Major legal red flag — re-evaluate Legal Risk score, may require kill |
| "Market is saturated, too many options" | Competition Quality score may need downgrade |
| "Free alternatives work fine" | Willingness to Pay sub-score (2B) may need downgrade |

**If negative signals are found that reduce WTP sub-scores below the auto-disqualification threshold, the opportunity is killed.**

---

## 5. Urgency & Timing Validation

Confirm the timing window is real and favorable.

| Check | How | Interpret |
|-------|-----|-----------|
| **Regulatory deadline** | Cross-reference `regulatory_calendar` table | Hard deadline = urgency premium. Calculate "build by" date (deadline minus 30-60 days) |
| **Seasonal pattern** | Google Trends 5-year view for seasonal cycles | If seasonal, time product launch 4-6 weeks before peak |
| **News cycle** | Recent articles, enforcement actions | Current news = accelerated demand, but may be temporary |
| **Trend trajectory** | Google Trends 12-month direction | Rising = great. Flat = acceptable. Declining = flag |
| **Legislative calendar** | Track bills in committee, proposed rules | Bills near passage = opportunity coming in 6-18 months |

---

## 6. Audience & Distribution Validation

Can you actually reach buyers cost-effectively?

### Persona Refinement

From Phase 1 broad persona, narrow to specific buyer:

```
VALIDATED PERSONA
──────────────────
Job title:          [specific role]
Industry:           [niche]
Company size:       [range]
Annual revenue:     [range]
Location:           [geography]
Pain frequency:     [how often they face this problem]
Current solution:   [what they do now — nothing / DIY / hire pro / competitor product]
Budget authority:   [can they buy without approval?]
Typical price point:[what they're used to paying for tools/resources]
Discovery channels: [where they find solutions — Google / Reddit / peers / conferences]
```

### Congregation Point Mapping

| Channel | Verification | Estimated Reach |
|---------|-------------|----------------|
| **Reddit** | Check subscriber count, post frequency, engagement in relevant subreddits | r/[subreddit] — [N]k members, [N] posts/week |
| **Facebook Groups** | Search for niche groups, check member count and activity | "[niche] group" — [N]k members |
| **LinkedIn** | Search for niche hashtags, company pages, professional groups | [N]k followers on #[hashtag] |
| **Email lists** | Check if niche newsletters exist (potential affiliate/ad partners) | e.g., "Morning Brew for [niche]" |
| **YouTube** | Search for tutorial channels in niche | Channels with [N]k subscribers |
| **Conferences/events** | Check if annual/semi-annual events exist for this niche | [Event name] — [N] attendees |

### Affiliate Ecosystem Check

| Question | Why It Matters |
|----------|---------------|
| Are there ClickBank/JVZoo products in this niche? | Proves affiliate channel works for this audience |
| Are there bloggers/YouTubers reviewing products in this space? | Potential affiliate partners |
| Do existing competitors have affiliate programs? | Proves the model works |
| What commission rates are standard in this niche? | Informs your affiliate structure |

---

## 7. Product Feasibility

Can one person realistically build this?

| Factor | Assessment |
|--------|-----------|
| **Primary format** | [PDF / templates / video / SaaS / hybrid] |
| **Build time estimate** | [hours] — broken down by component |
| **AI-assistability** | [%] — what percentage can AI help create? |
| **Domain expertise needed** | [none / moderate / expert — specify what's needed] |
| **Expert review needed** | [yes / no] — if yes, estimated cost: $[X] |
| **Maintenance burden** | [none / annual update / quarterly / ongoing] — hours per update |
| **Delivery platform** | [Gumroad / Teachable / Systeme.io / WordPress / custom] — cost: $[X]/month |
| **Tools needed** | [list tools and their costs] |

---

## 8. CAC Estimation

Estimate customer acquisition cost per channel:

| Channel | Estimated CAC | Assumptions |
|---------|--------------|-------------|
| **SEO (organic)** | $0-5 | After 3-6 months of content, ongoing traffic is nearly free |
| **Reddit organic** | $0-2 | Value-posting in communities, time cost only |
| **Affiliate** | 65-75% of sale price | Standard digital product commission. CAC = commission per conversion |
| **Paid ads (Google)** | $15-50 per conversion | Depends on niche CPC and conversion rate |
| **Paid ads (Facebook)** | $10-30 per conversion | Depends on audience targeting quality |
| **Email list (rented/sponsored)** | $1-5 per conversion | Newsletter sponsorship to niche audience |
| **Warm lead outreach** | $0 | Time cost only — leads already captured |

### Viability Check

```
LTV:CAC Ratio = Estimated LTV / Average Weighted CAC

Target: LTV:CAC ≥ 3:1
Warning: LTV:CAC 2:1 to 3:1 (thin margins)
Kill zone: LTV:CAC < 2:1 (cannot profitably acquire customers)
```

---

## 9. Monetization Architecture Validation

Validate the full revenue model, not just front-end pricing:

### Price Anchor Verification

```
Professional alternative price: $[X]
Product price target (10-20%):  $[Y] to $[Z]
Competitor pricing range:        $[X] to $[Y]
Selected price:                  $[final price]
Pricing justification:           [why this price makes sense given the anchors]
```

### Full Revenue Model

```
REVENUE MODEL
─────────────
Front-end product:  $[price] × [est. monthly sales] = $[monthly]
Order bump:         $[price] × [% who buy] = $[monthly]
Upsell:             $[price] × [% who buy] = $[monthly]
Subscription:       $[price/mo] × [subscribers] × [retention months] = $[monthly]
Affiliate rev:      $[est. affiliate-driven sales] × [your net %] = $[monthly]

Total monthly (conservative): $[X]
Total monthly (base case):    $[Y]
Total monthly (optimistic):   $[Z]
```

---

## 10. Post-Validation Re-Scoring

After all validation research, re-score the opportunity:

### Process

1. Return to the 15 criteria in Doc 05a
2. Update scores based on validated data (demand confirmed, competitors mapped, legal checked)
3. Calculate new validated_score
4. Calculate score_delta (validated_score - original weighted_score)
5. Update `opportunities` table

### Verdict Rules

| Score Delta | Validated Score | Verdict |
|------------|----------------|---------|
| Any | ≥ 65 | ✅ **Advance** to Smoke Testing (Phase 3B) |
| ≥ -5 | 55-64 | ⚠️ **Conditional** — user decides. List the gaps clearly. |
| < -5 | 55-64 | 🔴 **Kill** — validation revealed significant problems |
| Any | < 55 | 🔴 **Kill** — doesn't meet threshold |
| Any | Any + Legal Risk ≤ 1 | 🔴 **Kill** — unacceptable legal exposure |
| Any | Any + Disclaimer Tier D | 🔴 **Kill** — cannot disclaim adequately |

---

## Validation Report Template

```
VALIDATION REPORT: [Opportunity Name]
══════════════════════════════════════

EXECUTIVE SUMMARY:
Verdict: [ADVANCE / CONDITIONAL / KILL]
Original Score: [X] → Validated Score: [Y] (delta: [±Z])
Key finding: [one sentence]

1. DEMAND: [Confirmed / Probable / Unconfirmed]
   Search volume: [N]/month, trend: [rising/flat/declining]
   Community frequency: [N] posts in 90 days across [N] communities
   Marketplace evidence: [summary]

2. COMPETITION: [N] competitors identified
   Strongest: [name] — [strength]
   Weakest point across all: [the gap you'll exploit]
   Differentiation strategy: [your angle]

3. MOAT: [X]/15
   Strongest dimension: [which]
   Strategy: [how to build moat]

4. NEGATIVE SIGNALS: [N] found
   Most concerning: [description]
   Mitigation: [how to address]

5. TIMING: [Favorable / Neutral / Unfavorable]
   Regulatory deadline: [if any — date]
   Build-by date: [date]
   Peak demand window: [date range]

6. AUDIENCE: [Reachable / Challenging]
   Primary channel: [where they are]
   Affiliate ecosystem: [exists / doesn't exist]
   Estimated total addressable: [N]

7. FEASIBILITY: [Feasible / Stretch / Infeasible]
   Build time: [N] hours / [N] weeks
   AI-assistability: [%]
   Expert review needed: [yes/no — cost]

8. ECONOMICS:
   Price: $[X]
   Estimated CAC: $[Y]
   Estimated LTV: $[Z]
   LTV:CAC: [ratio] [✅ / ⚠️ / 🔴]

9. LEGAL: (summary — full detail in Doc 07a assessment)
   Legal Risk score: [X]/5
   Disclaimer tier: [A/B/C/D]
   Precedent scan: [clean / flagged]

10. RE-SCORE SUMMARY:
    [table of all 15 criteria: original → validated → delta]

WARM LEADS: [N] total ([N] cold, [N] warm, [N] hot)

RECOMMENDATION: [advance to smoke test / conditional — gaps listed / kill — reason]
```

---

*This document defines the validation framework. For legal deep-dive see [07a_legal_risk_engine.md](./07a_legal_risk_engine.md). For revenue modeling see [08a_revenue_pricing.md](./08a_revenue_pricing.md). For smoke testing see [09_smoke_testing.md](./09_smoke_testing.md).*
