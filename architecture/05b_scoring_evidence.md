# 05b — Scoring Engine: Evidence & Calibration

> The audit trail that makes scoring trustworthy. Evidence chains link every score to specific data, the confidence system flags uncertainty, and the calibration loop improves accuracy over time.

---

## Structured Evidence Chains

Every score ≥ 3 **must** be backed by a structured evidence entry stored in the `evidence_chains` table (Doc 15a).

### Evidence Entry Schema

```json
{
  "opportunity_id": 1,
  "criterion": "pain_intensity",
  "score": 4,
  "evidence_type": "reddit_post",
  "source_url": "https://reddit.com/r/landlord/comments/abc123",
  "quote": "This FinCEN reporting is a complete nightmare. My CPA wants $3,000.",
  "data_point": null,
  "data_value": null,
  "username": "u/frustrated_landlord",
  "platform": "reddit",
  "date_observed": "2026-02-15",
  "freshness_weight": 1.2,
  "confidence": "high"
}
```

### Evidence Requirements by Score Level

| Score | Minimum Evidence Required |
|-------|--------------------------|
| 0-2 | No formal evidence required (default zone) |
| 3 | At least 1 evidence entry from any source |
| 4 | At least 2 evidence entries from 2+ different sources |
| 5 | At least 3 evidence entries from 2+ different source categories, with at least 1 quantitative data point |

### Lead Auto-Population

Any evidence entry with a `username` field **automatically generates a corresponding record** in the `warm_leads` table (Doc 04) with:
- `username` → `warm_leads.username`
- `platform` → `warm_leads.platform`
- `source_url` → `warm_leads.post_url`
- `quote` → `warm_leads.pain_quote`
- `lead_temperature` → "cold"
- `opportunity_id` → linked

This ensures that scoring and lead capture are a single integrated process.

---

## Confidence Rating

Assign alongside the weighted score — a high score with low confidence is very different from one with high confidence.

| Confidence | Definition | Flag in Report |
|-----------|------------|----------------|
| **High** | 3+ independent sources corroborate. Multiple evidence entries with specific data. Multiple signal types (frustration + demand + urgency). Triangulated across all 3 source categories. | Standard — no flag |
| **Medium** | 1-2 sources. Some evidence entries but gaps. Scores of 4-5 based on partial evidence. Triangulated across 2 categories. | ⚠️ "Medium confidence — validate gaps in Phase 3" |
| **Low** | Single source. Multiple criteria at default 2 (no data). Strong assumptions. Not fully triangulated. | 🔴 "Low confidence — high risk of score inflation" |

---

## Scoring Calibration Feedback Loop

After 3+ products have been launched and tracked in `launched_outcomes` (Doc 15b):

### Calibration Process

1. **Pull data:** For each launched product, retrieve its original criterion scores from `evidence_chains` and actual revenue from `launched_outcomes`
2. **Correlate:** Calculate correlation coefficient between each criterion score and actual 90-day revenue
3. **Identify:** Which criteria best predicted revenue? Which were poor predictors?
4. **Adjust:** Modify weighting:
   - Criteria with correlation > 0.7 → increase weight (promote to core ★ if not already)
   - Criteria with correlation 0.3-0.7 → maintain current weight
   - Criteria with correlation < 0.3 → decrease weight (demote from core ★ if applicable)
5. **Log:** Record weight changes with justification in `discovery_runs.scoring_weight_changes`
6. **Apply:** Updated weights take effect on next scoring run

### Minimum Data Requirement

- **3 launched products:** Initial calibration (low confidence)
- **5 launched products:** Moderate calibration (medium confidence)
- **10+ launched products:** Strong calibration (high confidence — weights are now data-driven)

### Calibration Report Format

```
SCORING CALIBRATION REPORT
──────────────────────────
Date: [date]
Products with outcome data: [N]
Data confidence: [low / medium / high]

CRITERION PERFORMANCE:
  Criterion              Correlation    Current Weight    Recommended
  ─────────────────────  ──────────     ──────────────    ──────────
  Pain Intensity         0.82           ★ 2x              Keep ★ 2x
  Willingness to Pay     0.76           ★ 2x              Keep ★ 2x
  Urgency/Deadline       0.71           ★ 2x              Keep ★ 2x
  Solo Feasibility       0.45           ★ 2x              Review — may not predict revenue
  Revenue Velocity       0.68           ★ 2x              Keep ★ 2x
  Market Size            0.39           1x                 Keep 1x
  Recurring Need         0.22           1x                 Reduce → 0.5x
  Competition Quality    0.65           1x                 Promote → ★ 2x
  Legal Risk             0.33           1x                 Keep 1x
  Audience Accessibility 0.58           1x                 Keep 1x
  ...

WEIGHT CHANGES APPLIED:
  [List any changes with justification]

NOTES:
  [Observations about what drives real revenue vs. theoretical scoring]
```

---

## Re-Scoring Protocol

Opportunities should be re-scored when new evidence becomes available:

### When to Re-Score

| Trigger | Action |
|---------|--------|
| Phase 3 Validation completes | Re-score with validated data (replaces estimated scores with concrete numbers) |
| Smoke test results arrive | Re-score Revenue Velocity and Willingness to Pay based on actual conversion data |
| New discovery run finds additional evidence | Add evidence entries, re-calculate if new evidence changes any score by ≥ 1 |
| Regulatory calendar update | Re-score Urgency if deadlines shift |
| Competitor exits or enters | Re-score Competition Quality |

### Re-Score Diff Format

```
RE-SCORE: [Opportunity Name]
─────────────────────────────
Trigger: [what caused the re-score]
Date: [date]

Changed Criteria:
  Criterion              Before    After     Reason
  ─────────────────────  ──────    ─────     ──────────────────────
  Competition Quality    3         4         Competitor shut down (source: [URL])
  Willingness to Pay     3.5       4.0       Smoke test: 12% conversion at $97

Previous Weighted Score: 67 (Strong)
New Weighted Score:      72 (Strong)
Score Delta: +5

Confidence: HIGH → HIGH (additional evidence)
```

---

## Gate 2 Specification

### What to Present

| Element | Content |
|---------|---------|
| **Ranked table** | All scored opportunities sorted by weighted score |
| **Score breakdown** | Per-criterion scores visible for each opportunity |
| **Maturity badges** | Emerging / Growing / Mature icons |
| **Confidence badges** | High / Medium / Low indicators |
| **Lead count** | Warm leads captured per opportunity |
| **Format count** | Number of product formats possible |
| **Revenue velocity** | Estimated time-to-first-dollar |
| **Auto-disqualified** | List of killed opportunities with reasons |
| **Watch list** | Single-source signals awaiting future triangulation |

### User Actions at Gate 2

- Select which opportunities to advance to Phase 3 (Deep Validation, Doc 06)
- Inject their own opportunities for scoring
- Override kill decisions with justification
- Adjust niche focus for future runs

---

*This document defines evidence chains, confidence, calibration, and re-scoring. For the 15 criteria rubrics and disqualification rules, see [05a_scoring_criteria.md](./05a_scoring_criteria.md). For the validation that follows scoring, see [06_validation_framework.md](./06_validation_framework.md).*
