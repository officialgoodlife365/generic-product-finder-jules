# 04 — Warm Lead Pipeline

> Systematic capture of every person expressing pain during discovery. Transforms discovery data into a marketing asset — a ready-made outreach list for Day 1 product launch.

---

## Pipeline Overview

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│     PHASE 1: DISCOVERY       │     │     PHASE 3: VALIDATION      │
│                              │     │                              │
│  For every signal with a     │     │  Smoke test respondents      │
│  person behind it:           │     │  Waitlist signups            │
│  → Create cold lead record   │     │  Community influencers       │
│  → Capture: username,        │     │  → Upgrade lead temperature  │
│    platform, community,      │     │  → Enrich with contact data  │
│    post URL, pain quote,     │     │                              │
│    engagement score          │     │                              │
└────────────┬─────────────────┘     └────────────┬─────────────────┘
             │                                    │
             ▼                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                     WARM LEADS DATABASE                          │
│                                                                  │
│  🔵 Cold    — Expressed pain, no interaction yet                 │
│  🟡 Warm    — Engaged, they responded                           │
│  🔴 Hot     — Signed up, pre-ordered, or asked to be notified   │
│  ✅ Converted — Purchased the product                           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                DAY 1 LAUNCH ACTIVATION                           │
│                                                                  │
│  1. Contact 🔴 Hot leads — they already want this               │
│  2. Outreach to 🟡 Warm leads with personalized messages        │
│  3. Post in communities where 🔵 Cold leads were found          │
│  4. Activate affiliate partnerships                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Lead Capture: Phase 1

### What to Capture Per Signal

Every time a source module returns a signal with an identifiable person, create a `warm_leads` record:

| Data Point | Source | Required | Example |
|-----------|--------|----------|---------|
| `username` | SignalResult.username | Yes | "u/frustrated_landlord" |
| `platform` | SignalResult.platform | Yes | "reddit" |
| `community` | SignalResult.community | If available | "r/smallbusiness" |
| `post_url` | SignalResult.source_url | Yes | Full URL |
| `pain_quote` | SignalResult.raw_quote | Yes | "I've wasted 3 days on this" |
| `engagement_score` | SignalResult.engagement_score | Yes | 127 |
| `opportunity_id` | Linked opportunity | After Phase 1B | FK to opportunities table |
| `lead_temperature` | Default | Auto | "cold" |

### Capture Rules

1. **One record per unique (username + platform) pair** — if the same user appears multiple times, update the existing record with latest data; don't create duplicates
2. **Multiple opportunities**: If the same person expresses pain about different problems, create one lead record per opportunity linkage but share the core user data
3. **Anonymous signals**: If a signal has no identifiable person (e.g., Google Trends data), skip lead creation — leads require a reachable human
4. **Engagement threshold**: Create lead records for ALL identifiable persons, but flag those with `engagement_score` < 5 as low-priority

### Auto-Population from Evidence Chains

When the Scoring Engine creates evidence chain entries with `username` fields (Doc 05a), the lead pipeline automatically checks for existing lead records and creates new ones if none exist. This ensures scoring and lead capture are integrated.

---

## Lead Capture: Phase 3 (Enrichment)

During Phase 3 Validation and Phase 3B Smoke Testing, leads are enriched:

### Validation Phase Enrichment

| Lead Type | How They're Found | Data to Add |
|-----------|-------------------|-------------|
| **Community moderators** | Moderator lists on subreddits/groups relevant to the opportunity | `influence_tier` = "moderator", potential affiliate/partner |
| **Niche influencers** | People with large followings discussing the problem space | `influence_tier` = "influencer", follower count, platform |
| **Professionals in the space** | Lawyers, CPAs, consultants who serve this audience | Potential affiliates or partners (separate relationship type) |
| **Competitor reviewers** | People who reviewed competing products negatively | Proven buyers with unmet needs — high conversion potential |

### Smoke Test Enrichment

| Interaction | Temperature Upgrade | Data to Add |
|-------------|-------------------|-------------|
| Signed up for waitlist | 🔵 Cold → 🔴 Hot | `email`, `conversion_type` = "waitlist_signup" |
| Pre-ordered the product | 🔵 Cold → 🔴 Hot | `email`, `conversion_type` = "pre_order", payment info |
| Responded to outreach | 🔵 Cold → 🟡 Warm | `response`, `response_sentiment`, `contacted_at` |
| Responded positively + asked to be notified | 🔵 Cold → 🔴 Hot | `response`, `conversion_type` = "notify_request" |
| Responded negatively | 🔵 Cold → stays Cold | `response`, `response_sentiment` = "negative", add to notes |
| Became a beta tester | Any → 🔴 Hot | `conversion_type` = "beta_tester" |

---

## Lead Temperature Model

### Definitions

| Temperature | Icon | Definition | Marketing Value |
|------------|------|-----------|----------------|
| **Cold** | 🔵 | Expressed pain publicly but no interaction with you yet | Know their pain, know where to find them |
| **Warm** | 🟡 | You've engaged (replied, provided value) AND they responded positively | Two-way relationship established |
| **Hot** | 🔴 | They signed up, pre-ordered, asked to be notified, or expressed direct buying intent | Ready to purchase — Day 1 priority |
| **Converted** | ✅ | They purchased the product | Customer — track for upsell, testimonial, referral |

### Transition Rules

```
                  ┌─────────────────────────────┐
                  │                             │
    ┌─────────┐   │ You engage + they respond   │  ┌─────────┐
    │  COLD   │───┤ positively                  ├──│  WARM   │
    │  🔵     │   │                             │  │  🟡     │
    └────┬────┘   └─────────────────────────────┘  └────┬────┘
         │                                              │
         │  Direct buy signal                           │  Buy signal
         │  (signup, pre-order,                         │  (signup, pre-order)
         │   notify request)                            │
         │                                              │
         ▼                                              ▼
    ┌─────────┐                                    ┌─────────┐
    │   HOT   │────── Purchase ───────────────────│   HOT   │
    │  🔴     │                                    │  🔴     │
    └────┬────┘                                    └─────────┘
         │
         │  Purchases product
         ▼
    ┌──────────┐
    │ CONVERTED│
    │    ✅    │
    └──────────┘
```

**No downgrade path:** Temperatures only go up. A warm lead doesn't become cold again — if they go silent, they stay warm (they already responded once).

---

## Influence Tier Classification

Classify every lead's influence level to prioritize outreach:

| Tier | Definition | Platform-Specific Criteria | Marketing Value |
|------|-----------|---------------------------|----------------|
| **normal** | Regular user expressing pain | < 500 karma/followers, standard account | Standard outreach candidate |
| **active** | Frequent contributor in niche communities | 500-5,000 karma/followers, regular posting history, helpful reputation | High-value — their endorsement carries weight |
| **influencer** | Recognized voice in the niche | 5,000+ followers, creates content about this topic, has audience | Potential affiliate partner — their promotion reaches many |
| **moderator** | Community leader / moderator | Mod of relevant subreddit/group/forum | Strategic — relationship could unlock community access for marketing |

---

## Lead Scoring Algorithm

Composite score to prioritize outreach:

```
Lead Score = (Engagement Score × 0.3)
           + (Influence Multiplier × 0.3)
           + (Recency Score × 0.2)
           + (Pain Intensity × 0.2)

Where:
  Engagement Score = min(engagement_score / 100, 1.0) × 100
  Influence Multiplier = normal:25 / active:50 / influencer:75 / moderator:100
  Recency Score = (1 - days_since_post/365) × 100 (0 if > 365 days)
  Pain Intensity = linked opportunity's pain_intensity score × 20

Max Lead Score = 100
```

### Outreach Priority

| Lead Score | Priority | Action |
|-----------|----------|--------|
| **80-100** | 🟢 High | Reach out within 24 hours of product launch |
| **60-79** | 🟡 Medium | Reach out within 48 hours |
| **40-59** | 🟠 Standard | Include in community posting (not individual outreach) |
| **Below 40** | 🔵 Low | Include in broadcast only (email list, community post) |

---

## Contact Methods by Platform

| Platform | Contact Method | Approach | Do's | Don'ts |
|----------|---------------|----------|------|--------|
| **Reddit** | Reply to their post, or DM if allowed | Provide value first — share a relevant insight or resource BEFORE mentioning your product | Reference their specific pain. Be genuinely helpful. | Don't spam. Don't DM unsolicited in subreddits that prohibit it. Don't be salesy. |
| **HackerNews** | Reply to comment | Technical, value-first, link to relevant resource | Be substantive. Show you understand the problem. | Don't be promotional. HN community will destroy you. |
| **X/Twitter** | Reply to tweet, or DM | Engage in conversation, add value, then mention solution | Be conversational. Reference their exact words. | Don't auto-DM. Don't mass-reply. |
| **Quora** | Answer their question thoroughly | Provide comprehensive answer. Mention your product as ONE option among several. | Be the best answer. Build authority. | Don't answer only to promote. |
| **Upwork/Fiverr** | N/A — these are service providers, not leads | N/A | N/A — capture pricing data only, not as leads | Don't contact freelancers as leads |
| **App Store reviews** | N/A — no direct contact | Note the reviewer's pain for product positioning | Use their language in your marketing copy | Don't try to reach review authors |
| **Email (if provided)** | Direct email | Personalized, reference their pain quote | Keep it short. One clear CTA. Make it easy to buy or learn more. | Don't add to email list without consent. |

---

## Outreach Templates

### Template 1: Cold → Warm (Reddit/Community)

**Context:** Replying to their post that expressed the pain your product addresses.

```
Hey [username], I saw your post about [specific problem from their quote].
I've been working on a [product type] for [persona] that specifically addresses
[the exact issue they described]. It's [key benefit — e.g., "a step-by-step
guide that covers every state's requirements"].

Would it be helpful if I shared [a preview / the checklist / the key steps]?
No charge — genuinely trying to help folks dealing with [this problem].
```

**Why this works:** Leads with value, references their specific pain, no hard sell, opens dialogue.

### Template 2: Warm → Hot (Follow-up)

```
Hey [username], following up on our conversation about [problem].
I've put together the [product name] — it covers [key features].

I'm offering early access at [discount]% off for the first [N] people
who helped shape this with their feedback. Here's the link: [URL]

Happy to answer any questions. And if it's not a fit, no worries at all.
```

### Template 3: Hot Lead — Launch Notification

```
Hi [name], you signed up to hear about [product name] — it's live!

[One-sentence value prop]. Since you were one of the first people
to express interest, you get [early access / special pricing / bonus].

[CTA button/link]

Thanks for helping make this happen. Your [Reddit post / feedback / etc.]
is literally what inspired this product.
```

---

## Marketing Activation: Day 1 Launch Plan

### Step 1: Hot Leads (Immediate)

- Contact ALL 🔴 Hot leads individually
- Reference their specific pain quote or signup
- Offer early-access pricing or bonus
- **Expected conversion rate: 15-30%** (they already expressed intent)

### Step 2: Warm Leads (Within 48 hours)

- Personalized messages referencing your previous interaction
- Share the product with context about how it addresses their specific pain
- Ask for feedback even if they don't buy — builds relationship for future products
- **Expected conversion rate: 5-15%**

### Step 3: Community Posting (Within 72 hours)

- Post in every community where 🔵 Cold leads were found
- Provide genuine value (free tip, checklist, insight) + mention the product
- Follow each community's rules — read rules first, contribute before promoting
- **Expected conversion rate: 1-3% of viewers**

### Step 4: Affiliate Activation (Week 1)

- Contact identified influencers/moderators who matched `influence_tier` = "influencer" or "moderator"
- Offer affiliate partnership (65-75% front-end commission)
- Provide them with sample product, swipe copy, and tracking links

---

## Privacy & Ethics

### Rules

1. **Public data only** — Only capture information already publicly posted (usernames, public posts, public profiles)
2. **No scraping of private/protected data** — Never access private messages, private groups, or data behind login walls
3. **Platform ToS compliance** — Respect each platform's terms of service regarding data collection
4. **No deception** — When reaching out, be honest about who you are and what you're offering
5. **Opt-out respect** — If anyone asks not to be contacted, immediately remove from outreach and note in lead record
6. **No automated mass messaging** — All outreach should be personalized and manual (or at minimum, appear personal)
7. **Email consent** — Never add someone to an email list without their explicit opt-in
8. **GDPR / privacy law compliance** — If operating in EU or collecting EU resident data, implement GDPR protections (data deletion on request, data export, clear consent mechanisms)

### Data Security

- Store lead data securely (encrypted at rest in production app)
- Access controls — only the founder/authorized users can view lead data
- Data retention — respect the retention policy in Doc 15a (cold leads no interaction: 6 months)
- No sharing — lead data is never sold or shared with third parties

---

## CRM Dashboard Concept

For future app implementation, the lead pipeline powers a CRM dashboard:

### Dashboard Sections

| Section | Content | Key Metrics |
|---------|---------|-------------|
| **Lead Pool Overview** | Total leads by temperature | Cold: N, Warm: N, Hot: N, Converted: N |
| **Pipeline by Opportunity** | Leads grouped by opportunity | Per-opportunity breakdown with lead scores |
| **Outreach Queue** | Leads sorted by lead score | Priority, platform, contact method, last action |
| **Activity Feed** | Recent outreach actions and responses | Contacted → Responded → Converted timeline |
| **Conversion Funnel** | Cold → Warm → Hot → Converted rates | Conversion % at each stage |
| **Platform Breakdown** | Leads by source platform | Which platforms produce best leads |

### Filters

- By opportunity
- By temperature (cold / warm / hot / converted)
- By platform
- By influence tier
- By lead score range
- By date range (discovered, contacted)
- By response sentiment

---

## Metrics & Reporting

### Per-Opportunity Lead Metrics

```
LEAD REPORT: [Opportunity Name]
──────────────────────────────
Total leads:        [N]
  🔵 Cold:          [N] ([%])
  🟡 Warm:          [N] ([%])
  🔴 Hot:           [N] ([%])
  ✅ Converted:     [N] ([%])

Top platforms:      [ranked list]
Avg lead score:     [X]/100
Top 5 leads:        [list with scores]

Outreach status:
  Contacted:        [N] ([%] of total)
  Response rate:    [%]
  Positive response: [%]
  Conversion rate:  [%] (of contacted)

Platform effectiveness:
  [platform] → [N] leads → [%] conversion
  [platform] → [N] leads → [%] conversion
```

### Cross-Opportunity Lead Sharing

When multiple opportunities serve the same audience (identified in Portfolio View, Doc 10):
- Leads captured for Opportunity A may also be relevant to Opportunity B
- Tag shared leads with multiple `opportunity_id` values
- Prioritize cross-sell outreach to converted leads from related products

---

*This document defines the warm lead pipeline. For how leads feed into the launch plan, see [10_blueprint_generator.md](./10_blueprint_generator.md). For the data model, see [15a_database_schema_core.md](./15a_database_schema_core.md).*
