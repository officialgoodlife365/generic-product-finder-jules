# Iteration 7 Design Document: Validation Framework & Legal Risk Engine

## Overview
Iteration 7 implements Phase 3 of the Discovery Engine lifecycle: Deep Validation and Legal Risk Assessment. This phase takes the top 5-8 scored opportunities and subjects them to rigorous programmatic scrutiny. The goal is to output a definitive verdict (`Advance`, `Conditional`, or `Kill`) based on competitive moats, negative signals, estimated acquisition costs, and legal liability tiers.

## Deliverables Checklist
- [ ] Deep competitive analysis module (assessing gaps in pricing, format, updates).
- [ ] Moat assessment calculator (brand + content depth + update frequency + distribution + niche).
- [ ] Negative signal mining module (searching for "scam", "refund", "not worth it").
- [ ] CAC (Customer Acquisition Cost) estimation and LTV:CAC viability check.
- [ ] Legal risk scoring engine (1-5 scale mapped to auto-disqualify rules).
- [ ] Precedent scanning logic for lawsuits/FTC actions.
- [ ] Disclaimer tier classification (A-D) with auto-disqualify for Tier D.
- [ ] Post-Validation Re-Scoring mechanism updating the `opportunities` table with a `validated_score`.
- [ ] Tests for competitive analysis, scoring boundaries, and legal classifications.

## Architecture Review
Based on `06_validation_framework.md`, `07a_legal_risk_engine.md`, and `07b_legal_shields.md`:

### 1. Validation Framework (Doc 06)
-   **Moat Assessment:** Rated on 5 dimensions (Brand, Content, Updates, Distribution, Niche Specificity), each scored 0-3. Max 15. Scores < 4 suggest a commodity (potential kill).
-   **Negative Signal Mining:** Must actively scan for reasons people don't buy (refunds, scams, lawsuits).
-   **CAC Estimation:** Estimates acquisition costs across channels (SEO: $0-5, Reddit: $0-2, Ads: $10-50). Validates if LTV:CAC >= 3:1.
-   **Post-Validation Re-Score:** Updates the original 15 criteria based on new data, outputs `validated_score` and `score_delta`. Verdict is `Advance` (>= 65), `Conditional` (55-64 and delta >= -5), or `Kill` (< 55 or delta < -5).

### 2. Legal Risk Engine (Docs 07a & 07b)
-   **Legal Risk Score (0-5):** 0 = Extreme Liability (Direct Advice), 5 = Near-zero Liability (Organizational tools). Scores <= 1 result in an auto-kill.
-   **Precedent Scanning:** Simulates searching for FTC actions or lawsuits related to the product type.
-   **Disclaimer Tiers:**
    -   Tier A (Tools/Templates) -> Advance
    -   Tier B (Educational) -> Advance
    -   Tier C (Calculators for regulated info) -> Conditional
    -   Tier D (Provides direct advice) -> Kill
-   **Insurance Viability:** Checks if E&O insurance is readily available. If uninsurable, it's a kill signal.
-   **Verdict Output:** CLEAR, GUARDED, HIGH RISK, or KILL.

## Implementation Strategy

### 1. `src/services/validation/ValidationService.js`
*   Responsible for orchestrating Phase 3 Deep Validation.
*   **`validateOpportunity(opportunityId, validationData)`**:
    *   Executes `MoatCalculator`.
    *   Executes `CACEstimator`.
    *   Calls `LegalRiskEngine.assess()`.
    *   Triggers `ReScorer` to calculate the final `validated_score`.
    *   Persists the final verdict, delta, and updated phase (`validated` or `killed`) to the `opportunities` table.

### 2. `src/services/validation/LegalRiskEngine.js`
*   A standalone engine focused purely on liability.
*   **`assess(productData)`**:
    *   Determines Legal Risk Score (0-5) based on product category mapping (simulated for MVP).
    *   Assigns Disclaimer Tier (A-D).
    *   Determines Insurance Viability.
    *   Simulates Precedent Scanning (returns 'clean' or 'flagged').
    *   Returns the aggregated Legal Verdict (CLEAR, GUARDED, HIGH RISK, KILL).

### 3. `src/services/validation/Calculators.js`
*   Helper functions for specific math.
*   **`calculateMoatScore(dimensions)`**: Sums the 5 dimensions, returns score and interpretation.
*   **`calculateCACViability(ltv, cac)`**: Calculates LTV:CAC ratio and returns boolean for viability.

### 4. Testing Strategy
*   `tests/validation/ValidationService.test.js`: Mock DB interactions and test the orchestration and re-scoring logic. Ensure `score_delta` is correctly calculated and verdicts (Advance vs Kill) are correctly applied based on the 55-point threshold.
*   `tests/validation/LegalRiskEngine.test.js`: Test the matrix logic. For instance, asserting that a Tier D disclaimer immediately yields a KILL verdict regardless of other scores. Assert that Legal Risk <= 1 triggers a KILL. Test that the engine assigns 'CLEAR' when conditions are optimal.

## Summary
Iteration 7 shifts the focus from finding and prioritizing problems to vigorously stress-testing them before any money or time is spent building a solution. By programmatically codifying legal liabilities and competitive moats, the application serves as an automated risk-mitigation analyst, ensuring solo founders only pursue safe, defensible, and highly profitable product architectures.