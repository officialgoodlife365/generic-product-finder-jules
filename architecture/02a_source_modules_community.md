# 02a — Source Modules: Community Voice

> Plugin-based architecture for scanning community data sources — places where real humans express pain in their own words. Each source is a self-contained module with a standardized interface.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     DISCOVERY ENGINE (Doc 03)                     │
│                                                                  │
│  1. Read source_registry → get enabled modules by priority       │
│  2. For each module: call scan(niche, keywords)                  │
│  3. Collect standardized results from all modules                │
│  4. Merge, deduplicate, tag with source category                 │
│  5. Pass to Phase 1B for triangulation check                     │
└──────────┬───────────┬───────────┬───────────┬──────────────────┘
           │           │           │           │
     ┌─────▼───┐ ┌─────▼───┐ ┌─────▼───┐ ┌─────▼───┐
     │ Reddit  │ │  HN     │ │X/Twitter│ │YouTube  │
     │ Module  │ │ Module  │ │ Module  │ │Comments │
     └─────────┘ └─────────┘ └─────────┘ └─────────┘
         ▲                                    ▲
         │      This document covers these    │
         └────────────────────────────────────┘
```

### Execution Flow

1. **Engine reads `source_registry` table** (Doc 15a) — gets all modules where `enabled = 1`, sorted by `priority` ASC
2. **Groups modules by tier** — Tier 1 runs first, then Tier 2 if signal count is below target
3. **Calls each module's scan function** with the current niche list and keyword set
4. **Each module returns an array of `SignalResult` objects** in standardized format
5. **Engine merges results**, deduplicates by problem fingerprint, and tags each with its source category
6. **Updates `source_registry`** with `last_run_date`, `last_run_status`, `last_run_signals`
7. **Passes merged results** to Phase 1B (Doc 03) for triangulation and deep extraction

### Parallel Execution Strategy

- **Subagent approach (agent mode):** One subagent per source cluster (e.g., Reddit+HN+Quora as one cluster)
- **App approach:** Async workers per module with a shared result queue
- **Rate limit respect:** Each module manages its own rate limiting internally

---

## Source Module Contract

Every source module **must** implement this standardized interface:

### Module Configuration Schema

```json
{
  "module_name": "reddit",
  "display_name": "Reddit Communities",
  "description": "Scans Reddit for pain signals in subreddits related to target niches",
  "version": "1.0.0",
  "category": "community_voice",
  "tier": 1,
  "auth_required": false,
  "auth_type": null,
  "rate_limit": {
    "requests_per_minute": 10,
    "max_concurrent": 3,
    "backoff_strategy": "exponential"
  },
  "capabilities": {
    "supports_date_filter": true,
    "supports_engagement_metrics": true,
    "supports_user_extraction": true,
    "supports_pagination": true,
    "max_results_per_query": 100
  },
  "default_config": {
    "min_upvotes": 10,
    "max_post_age_days": 365,
    "subreddits": []
  }
}
```

### Input Schema

```json
{
  "niches": ["real_estate", "ecommerce"],
  "keywords": {
    "frustration": ["nightmare", "wasted hours", "can't believe"],
    "demand": ["looking for", "is there a tool", "I'd pay for"],
    "urgency": ["deadline", "new regulation", "enforcement"],
    "competitive_gap": ["better alternative", "overpriced", "outdated"]
  },
  "date_range": {
    "from": "2025-09-04",
    "to": "2026-03-04"
  },
  "max_results": 50,
  "config_overrides": {}
}
```

### Output Schema: `SignalResult`

Every module returns an array of these objects:

```json
{
  "signal_id": "reddit_abc123",
  "source_module": "reddit",
  "source_category": "community_voice",
  "source_url": "https://reddit.com/r/smallbusiness/comments/...",
  "problem_name": "FinCEN AML reporting confusion for small landlords",
  "problem_fingerprint": "fincen_aml_real_estate_confusion",
  "signal_type": "frustration",
  "emotional_intensity": "severe",
  "raw_quote": "I just got a letter about FinCEN reporting and I have NO idea what to do. My CPA wants $3,000 to handle it.",
  "username": "u/frustrated_landlord",
  "platform": "reddit",
  "community": "r/smallbusiness",
  "engagement_metrics": {
    "upvotes": 127,
    "comments": 43,
    "shares": 0
  },
  "engagement_score": 170,
  "date_posted": "2026-02-15",
  "freshness_weight": 1.2,
  "money_signals": ["CPA wants $3,000"],
  "existing_solutions_mentioned": ["CPA", "but too expensive"],
  "niche": "real_estate",
  "sub_niche": "residential_landlords",
  "metadata": {}
}
```

### Error Handling

```json
{
  "module_name": "reddit",
  "status": "error",
  "error_type": "rate_limited",
  "error_message": "Reddit API rate limit exceeded. Retry after 60s.",
  "signals_before_error": 12,
  "partial_results": []
}
```

Modules must handle errors gracefully:
- **Rate limited:** Back off exponentially, retry up to 3 times, return partial results
- **Auth expired:** Flag `auth_configured = 0` in registry, skip module
- **Source unavailable:** Log error, skip module, do not block other modules
- **Timeout:** Return partial results after 30 seconds

---

## Source Categories

Categories power the **triangulation requirement** (Doc 03) — a problem must appear in 2+ categories to advance.

| Category | Code | What It Represents | Examples |
|----------|------|---------------------|----------|
| **Community Voice** | `community_voice` | Real people expressing pain in their own words | Reddit, HN, Quora, X/Twitter, forums, Discord |
| **Search/Data** | `search_data` | Quantitative demand signals and trend data | Google Trends, Exploding Topics, regulatory filings, news |
| **Marketplace Proof** | `marketplace_proof` | Evidence of money being spent on solving a problem | Upwork/Fiverr gigs, Amazon products, G2 reviews, App Store |

### Triangulation Matrix

| Scenario | Categories Hit | Signal Status | Action |
|----------|---------------|---------------|--------|
| Reddit complaint only | community_voice: 1 | `watch_list` | Hold for future runs |
| Reddit + Google Trends rising | community_voice + search_data: 2 | `triangulated` | Advance to Phase 1B |
| Reddit + Upwork gigs + Google Trends | All 3 | `corroborated` | Advance with high confidence |
| Only Google Trends rising | search_data: 1 | `watch_list` | Hold — no human voice confirming |
| Only Upwork gigs exist | marketplace_proof: 1 | `watch_list` | Hold — need corroborating complaint or trend |

---

## Community Voice Modules

### Module: `reddit`

| Property | Value |
|----------|-------|
| **Category** | community_voice |
| **Tier** | 1 |
| **Signal strength** | HIGH |
| **Auth required** | No (uses web search fallback) |

**Target subreddits by niche:**

| Niche | Subreddits |
|-------|-----------|
| Regulatory compliance | r/smallbusiness, r/legaladvice, r/compliance |
| Tax & accounting | r/tax, r/accounting, r/bookkeeping, r/taxpros |
| Real estate | r/realestate, r/landlord, r/realestateinvesting, r/commercialrealestate |
| E-commerce | r/ecommerce, r/FulfillmentByAmazon, r/Etsy, r/shopify |
| HR/employment | r/humanresources, r/AskHR, r/antiwork |
| Financial services | r/fintech, r/banking, r/personalfinance |
| Food & beverage | r/restaurateur, r/foodindustry, r/foodsafety |
| Construction | r/Construction, r/electricians, r/Plumbing, r/HVAC |
| Nonprofits | r/nonprofit, r/CharitableOrganization |
| SaaS/software | r/SaaS, r/startups, r/webdev |
| Supplements | r/Supplements, r/FDAregulation |
| Marketing | r/marketing, r/PPC, r/SEO, r/emailmarketing |

**Search query patterns:**
```
site:reddit.com "[NICHE] nightmare OR frustrated OR confused" after:2025-09
site:reddit.com r/[SUBREDDIT] "how do I" OR "does anyone know" [TASK]
site:reddit.com "[NICHE] got fined OR penalized OR violation"
site:reddit.com "[NICHE] overpriced OR ripoff OR too expensive"
site:reddit.com "[NICHE] template OR checklist OR guide"
site:reddit.com "[NICHE] I'd pay for OR shut up and take my money"
```

**Signal extraction rules:**
- **Minimum engagement:** 10+ upvotes for frustration posts, 5+ for demand posts
- **High-value signal:** 50+ upvotes OR 20+ comments
- **Seasonal check:** Compare post date to time of year — some pain is seasonal
- **Lead capture:** Always extract username, subreddit, post URL, exact quote

**Anti-spam filter:** Skip posts from known bot accounts, promotional posts, and posts from very new accounts (<30 days).

---

### Module: `hackernews`

| Property | Value |
|----------|-------|
| **Category** | community_voice |
| **Tier** | 1 |
| **Signal strength** | MEDIUM |
| **Auth required** | No |

**Search patterns:**
```
site:news.ycombinator.com "Ask HN" compliance OR regulation OR tax
site:news.ycombinator.com "frustrated" OR "nightmare" business operations
site:news.ycombinator.com "is there a tool" OR "I'd pay for"
```

**Signal quality notes:**
- HN audience skews technical — pain points tend to be about developer-facing business operations (SOC 2, GDPR, accessibility, DevOps compliance)
- Lower signal strength because audience is smaller and more technical than general business population
- **High value when cross-referenced with Reddit** — same complaint on both platforms = strong triangulation

---

### Module: `x_twitter`

| Property | Value |
|----------|-------|
| **Category** | community_voice |
| **Tier** | 2 |
| **Signal strength** | HIGH |
| **Auth required** | Yes (full), No (fallback search) |

**Fallback search patterns (without auth):**
```
site:twitter.com "[NICHE] nightmare" OR "compliance hell" OR "just got fined"
site:twitter.com "[NICHE] anyone know" OR "looking for" OR "need help with"
site:x.com "[NICHE]" "I wish there was" OR "why isn't there"
```

**With auth (user-provided connection):**
- Search X API for niche keywords
- Analyze thread engagement (replies, retweets, quotes)
- Extract user handles for lead capture
- Track influential accounts in niche (potential partners)

---

### Module: `youtube_comments`

| Property | Value |
|----------|-------|
| **Category** | community_voice |
| **Tier** | 2 |
| **Signal strength** | MEDIUM |
| **Auth required** | No (limited scraping) |

**What to scan:** Comments on tutorial/how-to videos in niche verticals — especially comments saying "but what about...", "this doesn't work for...", "what if you have..."

**Search patterns:**
```
site:youtube.com [NICHE] tutorial OR "how to" [TASK]
→ Then extract top comments from the video pages
```

**Signal extraction:**
- Comment text expressing unmet need or frustration
- Number of likes on comment (engagement proxy)
- Video title and channel (context for the pain)
- Commenter handle (lead capture)

**Limitations:** Comment loading may be incomplete. Best effort — focus on top comments with highest engagement.

---

## Adding a New Community Module

### Step 1: Create Module Configuration
Define the module's configuration JSON following the Module Configuration Schema. Specify: name, category (`community_voice`), tier, auth requirements, rate limits, capabilities.

### Step 2: Implement Scan Function
Build the scanning logic. It must:
- Accept the standard Input Schema (niches, keywords, date_range, config)
- Return an array of `SignalResult` objects
- Handle errors gracefully (return partial results on failure)
- Respect rate limits
- Extract usernames for warm lead capture when possible

### Step 3: Register in Source Registry
```sql
INSERT INTO source_registry (module_name, display_name, category, tier, priority)
VALUES ('new_source', 'New Source Name', 'community_voice', 2, 3);
```

### Step 4: Test & Enable
- Run the module standalone with a known niche
- Verify output conforms to `SignalResult` schema
- Verify error handling with rate limit simulation
- Set `enabled = 1` in registry — discovery engine automatically includes it

### Future Community Source Ideas

| Source | Potential Signal Strength |
|--------|--------------------------|
| LinkedIn comments/posts | HIGH (professional pain) |
| TikTok comments | MEDIUM (broader audience) |
| Substack newsletter comments | HIGH (expert opinions) |
| Industry-specific forums (BiggerPockets, etc.) | VERY HIGH (concentrated niche) |
| Podcast transcript analysis | MEDIUM (expert discussions) |
| Discord servers | HIGH (real-time community pain) |

---

## Source Quality Tracking

The system automatically tracks which modules produce the best results over time.

### Quality Metrics (per module, per run)

| Metric | Definition |
|--------|-----------|
| `signals_produced` | Total signals returned by this module in this run |
| `signals_triangulated` | How many survived triangulation (appeared in 2+ categories) |
| `signals_scored_above_65` | How many scored ≥65 (Strong or Exceptional) |
| `signals_validated` | How many passed Phase 3 validation |
| `signals_launched` | How many led to a launched product |
| `avg_weighted_score` | Average weighted score of this module's signals |
| `hit_rate` | signals_scored_above_65 / signals_produced |
| `quality_score` | Composite score (0-100) combining all metrics |

### Auto-Priority Adjustment

After 5+ runs, adjust module priority based on quality score:
- **Quality ≥ 75:** Decrease priority number (= higher priority)
- **Quality 50-74:** Keep current priority
- **Quality 25-49:** Increase priority number (= lower priority)
- **Quality < 25:** Flag for review — module may need reconfiguration or disabling

This creates a **self-improving** scanning system that focuses effort on the most productive community sources.

---

*This document covers community voice modules. For data and marketplace modules, see [02b_source_modules_data.md](./02b_source_modules_data.md). For how the Discovery Engine uses these modules, see [03_discovery_engine.md](./03_discovery_engine.md).*
