# 07a — Legal Risk Engine

> Proactive legal risk assessment that scans for precedents, classifies disclaimer strength, checks insurance viability, and scores legal exposure. Goal: minimize founder liability while maximizing revenue.

---

## Legal Risk Assessment Process

```
For each opportunity passing validation:
    │
    ├── 1. Legal Risk Scoring (refined from Phase 2)
    ├── 2. Lawsuit Precedent Scanning
    ├── 3. FTC Enforcement Scanning
    ├── 4. Disclaimer Tier Classification
    └── 5. Insurance Viability Check
            │
            ▼
    Legal risk score: feeds into Legal Shield design (Doc 07b)
```

---

## 1. Legal Risk Scoring (Refined)

Refine the initial Legal Risk score from Doc 04 with specific validation research:

| Score | Definition | Product Type | Action |
|-------|-----------|-------------|--------|
| **5** | Near-zero liability | Canva templates, wedding planners, organizational tools | ✅ Proceed freely |
| **4** | Low liability, standard disclaimers sufficient | Business templates, checklists, scheduling tools | ✅ Proceed with Tier A disclaimers |
| **3** | Moderate liability, educational framing critical | Educational content about regulated topics (tax guides, compliance summaries) | ⚠️ Proceed with Tier B disclaimers + careful framing |
| **2** | Elevated liability, professional review recommended | Calculators/estimators for regulated topics, industry-specific templates | ⚠️ Conditional — attorney review recommended before launch |
| **1** | High liability, product output could be relied upon as professional guidance | Tools that generate specific numbers/outputs people rely on for regulated decisions | 🔴 Kill unless product architecture fundamentally redesigns delivery |
| **0** | Extreme liability, directly providing professional advice | Medical diagnosis, legal opinions, tax filing, investment recommendations | 🔴 Absolute kill — no mitigation possible |

---

## 2. Lawsuit Precedent Scanning

Actively search for legal actions taken against similar products.

### Search Queries

```
"[product type]" lawsuit OR "legal action" OR "class action"
"[product type]" FTC OR "cease and desist" OR "enforcement"
"[competitor name]" sued OR lawsuit OR settlement
"[niche] template" OR "guide" liability OR "held liable"
"[niche] course" OR "program" "false claims" OR "deceptive"
site:ftc.gov "[niche]" enforcement
site:law.cornell.edu "[niche]" consumer protection
```

### Precedent Analysis Template

```
PRECEDENT SCAN: [Opportunity Name]
───────────────────────────────────
Search conducted: [date]
Queries run: [N]

CASES FOUND: [N]

CASE 1:
  Type: [lawsuit / FTC action / state AG action / class action]
  Year: [year]
  What happened: [brief description]
  Product type involved: [what was the product]
  Legal theory: [why they were liable — false claims, deceptive practices,
                 unauthorized practice of [profession], negligence, etc.]
  Outcome: [fine amount, settlement, injunction, dismissal]
  Relevance to our opportunity: [HIGH / MEDIUM / LOW]
  
  SAME VECTOR? [Yes / No]
  If yes: Does our product have the same liability vector?
  
  MITIGATABLE? [Yes / No]
  If yes: How — [specific product design changes to avoid this vector]
  If no: [explain why mitigation is not possible → potential kill signal]

[Repeat for each case]

OVERALL VERDICT:
[CLEAN — no relevant precedents found]
[FLAGGED — precedents found but mitigatable with product design changes]
[KILL — same-vector precedent with no clear mitigation path]
```

### Decision Tree After Precedent Scan

```
Precedent found?
├── No → CLEAN → Proceed normally
└── Yes →
    Same liability vector as our product?
    ├── No → CLEAN — different product type/context
    └── Yes →
        Can we redesign product to avoid this vector?
        ├── Yes → FLAGGED — document required changes, proceed with modifications
        └── No → KILL — unmitigable legal risk
```

---

## 3. FTC Enforcement Scanning

### What to Check

| Area | Search Scope | Red Flags |
|------|-------------|-----------|
| **Testimonials/earnings claims** | FTC guidelines on endorsements | Any product implying specific outcomes needs disclaimers |
| **Health claims** | FTC/FDA enforcement actions | Supplement/health products making specific efficacy claims |
| **Financial claims** | FTC enforcement + state AG actions | Products implying specific financial returns |
| **"Free" claims** | FTC dot-com disclosures | Misleading pricing structures |
| **Automatic renewals** | FTC/state laws (ROSCA) | Subscription products need clear cancellation |
| **Native advertising** | FTC native ad guidelines | Educational content that's actually selling requires disclosure |

### FTC-Safe Practices

| Practice | Implementation |
|----------|---------------|
| Clear pricing | No hidden fees, clear total at checkout |
| Honest testimonials | Only use real results, include typical results disclaimer |
| No guaranteed outcomes | Never state "you will" — use "this is designed to help" |
| Clear cancellation | Subscriptions must have easy, prominent cancellation |
| Material disclosures | Affiliate relationships, sponsorships clearly disclosed |
| Refund policy | Clear, accessible refund policy (digital products: 30-day standard) |

---

## 4. Disclaimer Effectiveness Tiers

Classify every opportunity by the strength of legal disclaimer available:

### Tier Definitions

| Tier | Name | Description | Product Types | Advance? |
|------|------|-------------|--------------|----------|
| **A** | Very Strong | Product is a tool/template — doesn't give advice. Disclaimer: "This is a tool to organize information. Consult a professional for advice." | Templates, checklists, organizational tools, calculators with explicit "estimate only" labels | ✅ Yes — standard commerce |
| **B** | Strong | Product is educational — teaches concepts but doesn't prescribe action. Disclaimer: "For educational purposes only. Not professional advice." | Courses, guides, how-to content, explainer videos, informational PDFs | ✅ Yes — with educational framing |
| **C** | Moderate | Product output is relied upon for decisions. Disclaimer exists but may not hold up if product is wrong. | Compliance calculators, filing tools, industry-specific templates that people submit to authorities | ⚠️ Conditional — attorney review required. Significant product architecture changes likely needed. |
| **D** | Weak | Product is essentially providing the advice that professionals charge for. Disclaimer unlikely to protect. | Personalized tax advice, legal document review, medical recommendations, investment guidance | 🔴 Kill — disclaimer won't save you if it goes wrong |

### Tier Assignment Logic

```
Does the product tell users what to DO (specific to their situation)?
├── Yes → Tier D — KILL
└── No →
    Does the product generate specific numbers/outputs that users submit to authorities?
    ├── Yes → Tier C — CONDITIONAL (needs redesign)
    └── No →
        Does the product explain concepts and teach principles?
        ├── Yes → Tier B — ADVANCE with educational framing
        └── No →
            Does the product provide tools/templates users fill in themselves?
            ├── Yes → Tier A — ADVANCE freely
            └── No → Investigate further — cannot classify
```

---

## 5. Insurance Viability Check

Can you get Errors & Omissions (E&O) insurance for this product type?

### Assessment Guide

| Product Category | E&O Available? | Typical Annual Cost | Notes |
|-----------------|---------------|--------------------|----|
| **Business templates & tools** | Yes — easy | $500-1,500/year | Standard technology E&O |
| **Educational courses** | Yes — easy | $500-2,000/year | Professional liability for educators |
| **Tax-related educational content** | Yes — moderate | $1,000-3,000/year | Tax preparer E&O policies |
| **Compliance checklists (general)** | Yes — moderate | $1,000-3,000/year | Professional services E&O |
| **Health/wellness educational** | Difficult | $2,000-5,000/year | Limited carriers, many exclusions |
| **Financial planning tools** | Limited | $3,000-10,000/year | High premiums, many exclusions |
| **Legal document templates** | Very difficult | Rarely available | Most carriers exclude |
| **Medical advice/tools** | Not available | N/A | 🔴 Uninsurable for non-professionals |
| **Investment advice** | Not available | N/A | 🔴 Requires securities registration |

### Insurance Viability Verdict

| Result | Action |
|--------|--------|
| **Readily available, < $2,000/year** | ✅ Insurable — add to cost model, recommend purchasing |
| **Available but expensive ($2,000-5,000)** | ⚠️ Include in revenue stress test — can revenue cover insurance cost? |
| **Very difficult to obtain** | ⚠️ Flag — product may need to be redesigned to become insurable |
| **Not available / uninsurable** | 🔴 Kill signal — if no carrier will insure it, the risk is unacceptable |

---

*This document covers legal risk assessment and scoring. For product architecture as a legal shield, positioning language, the 10-point protection checklist, and the legal verdict, see [07b_legal_shields.md](./07b_legal_shields.md).*
