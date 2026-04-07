# 02b — Source Modules: Data & Marketplace

> Data-driven scanning modules — quantitative demand signals, trend analysis, regulatory calendars, and marketplace proof that people are spending money on a problem.

---

## Data & Trend Modules

### Module: `google_trends`

| Property | Value |
|----------|-------|
| **Category** | search_data |
| **Tier** | 1 |
| **Signal strength** | HIGH |
| **Auth required** | No |

**Query construction:**
```
URL format: https://trends.google.com/trends/explore?date=[range]&geo=US&q=[query]
Date ranges: "today 12-m" (12 months), "today 3-m" (3 months), "today 5-y" (5 years)
```

**Trend interpretation:**

| Trend Shape | Signal | Action |
|-------------|--------|--------|
| Hockey stick (sharp recent rise) | Very strong — emerging or event-driven demand | Flag as high-priority, check regulatory calendar |
| Steady upward (gradual 12-month rise) | Strong — growing sustained demand | Good signal, verify with community voice |
| Flat/stable | Neutral — consistent but not growing | Lower priority unless other signals are strong |
| Declining | Negative — problem may be solving itself | Downweight, check if regulatory simplification is happening |
| Seasonal peaks | Context-dependent — annual opportunity if peaks are reliable | Check timing, map to regulatory calendar |

**Comparative analysis:**
- Compare problem query to competitor product query — if the problem is rising but competitor is flat, there's an unmet need
- Compare across synonyms — "AML compliance help" vs "AML reporting confusion" vs "FinCEN requirements"
- Compare US vs. other geographies for localization opportunities

**Output specifics:**
- `data_point`: "trend_direction"
- `data_value`: "rising" / "flat" / "declining" / "hockey_stick" / "seasonal"
- `engagement_score`: Relative search interest (0-100 from Google Trends)

---

### Module: `exploding_topics`

| Property | Value |
|----------|-------|
| **Category** | search_data |
| **Tier** | 1 |
| **Signal strength** | HIGH |
| **Auth required** | No |

**What to scan:** Pre-trend signals before Google Trends catches them — early mover advantage.

**URL:** explodingtopics.com — scan business, technology, and industry categories.

**Signal value:** Emerging topics growing 100%+ in last 3 months that relate to business pain points, compliance, or operational challenges.

**Best use:** Combine with Google Trends for confirmation. An Exploding Topics spike + matching Google Trends rise = very strong signal.

---

### Module: `gov_regulatory`

| Property | Value |
|----------|-------|
| **Category** | search_data |
| **Tier** | 1 |
| **Signal strength** | VERY HIGH |
| **Auth required** | No |

**Primary sources:**

| Source | URL Pattern | What to Scan |
|--------|-------------|-------------|
| **Federal Register** | federalregister.gov | Proposed rules, final rules with future effective dates |
| **FinCEN** | fincen.gov | AML/BSA rule updates, new reporting requirements |
| **FTC** | ftc.gov/enforcement | New enforcement actions, updated guidelines |
| **FDA** | fda.gov/regulatory-information | Labeling changes, new requirements |
| **IRS** | irs.gov/newsroom | New tax rules, reporting changes |
| **OSHA** | osha.gov/news | New safety requirements, enforcement initiatives |
| **State legislatures** | legiscan.com / state .gov sites | State-specific new laws |

**What to extract:**
- Regulation name and agency
- Effective date (critical — feeds `regulatory_calendar` table in Doc 15a)
- Who it affects (niche + persona)
- Penalty for non-compliance (urgency signal)
- Compliance complexity (opportunity sizing)
- Source URL

**Regulatory calendar feed:**
Every regulation with a future effective date is automatically inserted into `regulatory_calendar` with `opportunity_potential` assessed:
- `very_high`: Affects many small businesses + complex compliance + high penalties
- `high`: Affects specific niche + moderate compliance burden
- `medium`: Minor reporting change or narrow scope
- `low`: Primarily affects large enterprises (not solo-founder target)

---

### Module: `industry_news`

| Property | Value |
|----------|-------|
| **Category** | search_data |
| **Tier** | 1 |
| **Signal strength** | HIGH |
| **Auth required** | No |

**Search patterns:**
```
"new regulation" OR "new rule" OR "compliance deadline" [NICHE] 2026
"enforcement action" OR "company fined" OR "penalty" [NICHE]
"industry changes" OR "policy update" [NICHE] small business
```

**Priority publications by niche:**

| Niche | Key Publications |
|-------|-----------------|
| Tax | Journal of Accountancy, Accounting Today, Tax Foundation |
| Real estate | NAR publications, Inman News, Real Estate Express |
| E-commerce | eCommerce Bytes, Practical Ecommerce, Digital Commerce 360 |
| HR | SHRM, HR Dive, HR Morning |
| Healthcare | Modern Healthcare, Healthcare Dive, HHS.gov |
| Financial services | American Banker, FinExtra, Compliance Week |
| Food | FDA Food Policy & Response, Food Safety Magazine |

---

## Marketplace Proof Modules

### Module: `producthunt_g2`

| Property | Value |
|----------|-------|
| **Category** | marketplace_proof |
| **Tier** | 1 |
| **Signal strength** | MEDIUM |
| **Auth required** | No |

**What to scan:**
- G2/Capterra: Software categories with average ratings 3.0-3.5 stars — indicates underserved market
- ProductHunt: Recent launches in compliance/business tools — look at comment sentiment
- Focus on **review complaints**: "missing feature X", "too expensive for small business", "doesn't support my use case"

**Search patterns:**
```
site:g2.com [NICHE] software reviews "missing" OR "wish it had" OR "doesn't support"
site:capterra.com [NICHE] reviews "too expensive" OR "not worth it"
site:producthunt.com [NICHE] compliance OR template OR tool
```

---

### Module: `amazon_reviews`

| Property | Value |
|----------|-------|
| **Category** | marketplace_proof |
| **Tier** | 1 |
| **Signal strength** | HIGH |
| **Auth required** | No |

**What to scan:** Books and courses in niche verticals — focus on 1-3 star reviews.

**Search patterns:**
```
site:amazon.com [NICHE] book reviews "didn't help" OR "too generic" OR "outdated"
site:amazon.com [NICHE] guide "not worth" OR "useless" OR "waste of money"
site:amazon.com [NICHE] course "disappointed" OR "incomplete"
```

**Signal extraction:**
- Review quote expressing unmet need
- Star rating (1-3 stars = pain signal)
- Number of people who found the review helpful (engagement proxy)
- Product price (price anchor data)
- Reviewer profile if visible (lead capture)

---

### Module: `upwork_fiverr`

| Property | Value |
|----------|-------|
| **Category** | marketplace_proof |
| **Tier** | 1 |
| **Signal strength** | HIGH |
| **Auth required** | No |

**What to scan:** Services pricing $500+ that people hire repeatedly — indicates ongoing pain worth automating.

**Search patterns:**
```
site:upwork.com [NICHE] compliance OR filing OR setup
site:fiverr.com [NICHE] template OR checklist OR audit
```

**Key data points:**
- Service category and description
- Price range (becomes professional price anchor — Doc 08a)
- Number of reviews / jobs completed (volume indicator)
- Freelancer specialization (validates niche demand)
- Client comments mentioning pain ("I couldn't figure this out myself")

---

### Module: `app_store`

| Property | Value |
|----------|-------|
| **Category** | marketplace_proof |
| **Tier** | 1 |
| **Signal strength** | MEDIUM |
| **Auth required** | No |

**What to scan:** Apps in business/productivity/compliance categories with poor ratings (1-3 stars) + reviews expressing unmet needs.

**Search patterns:**
```
site:play.google.com [NICHE] app reviews
site:apps.apple.com [NICHE] compliance OR template
```

**Signal extraction:**
- App name and category
- Average rating (low = opportunity)
- Specific complaints from reviews
- How many downloads/installs (market size indicator)

---

### Module: `udemy_course_reviews`

| Property | Value |
|----------|-------|
| **Category** | marketplace_proof |
| **Tier** | 2 |
| **Signal strength** | MEDIUM |
| **Auth required** | No |

**What to scan:** Course reviews expressing "too basic", "didn't cover [specific topic]", "outdated", "not practical enough"

**Search patterns:**
```
site:udemy.com [NICHE] compliance OR [TASK] reviews
site:skillshare.com [NICHE] course reviews
```

**Signal value:** When course buyers complain that existing education is too generic, there's room for a niche-specific, actionable product (templates + guide bundle).

---

## Integration Points

| This Document | Connects To | How |
|---|---|---|
| All module outputs | Doc 03 (Discovery Engine) | Standardized `SignalResult` objects merged and triangulated |
| Source quality metrics | Doc 11 (Intelligence Dashboard) | Quality scores feed into run-over-run analytics |
| Regulatory calendar data | Doc 15a (Database Schema) | `regulatory_calendar` table populated by gov_regulatory module |
| Price anchor data (Upwork, Amazon) | Doc 08a (Revenue Pricing) | Professional pricing feeds into price anchor methodology |
| Lead capture (usernames) | Doc 04 (Warm Lead Pipeline) | Every username extracted becomes a warm lead record |

---

## Future Data Source Ideas

| Source | Category | Potential Signal Strength |
|--------|----------|--------------------------|
| Patent filing monitors | search_data | MEDIUM (new patents → new compliance) |
| Job posting analysis (Indeed, LinkedIn) | search_data | HIGH (hiring for X = struggling with X) |
| Government contract postings | marketplace_proof | MEDIUM (spending signals) |
| Wikipedia recent changes (regulation pages) | search_data | LOW (supplementary signal) |
| Gumroad/LemonSqueezy product listings | marketplace_proof | HIGH (direct competitor products) |
| StackOverflow / technical forums | marketplace_proof | MEDIUM (developer pain) |

---

*This document covers data and marketplace modules. For community voice modules, see [02a_source_modules_community.md](./02a_source_modules_community.md). For how the Discovery Engine uses these modules, see [03_discovery_engine.md](./03_discovery_engine.md).*
