# Iteration 6 Design Document: Scoring Engine & Warm Lead Pipeline

## Overview
Iteration 6 focuses on implementing the Scoring Engine and refining the Warm Lead CRM. The Scoring Engine evaluates opportunities discovered in Phase 1 against 15 specific criteria, calculates a weighted score, checks for kill signals, and stores an auditable evidence chain. Concurrently, the Warm Lead pipeline captures users associated with these signals and assigns a temperature score and outreach priority.

## Deliverables Checklist
- [ ] 15-criteria scoring engine implementation
- [ ] Configurable weights (with the 5 core criteria weighted at 2x)
- [ ] Automatic disqualification (kill signal) detection
- [ ] Buyer intent decomposition scoring (Willingness to Pay: 2A, 2B, 2C, 2D)
- [ ] Evidence chain linking and database persistence
- [ ] Warm lead CRM state machine: Temperature scoring (Cold -> Warm -> Hot -> Converted)
- [ ] Lead capture extraction from `SourceModuleManager` outputs
- [ ] Lead score calculation (engagement + influence + recency + pain)
- [ ] Unit tests for scoring math accuracy and lead classification

## Architecture Review
Based on `04_warm_lead_pipeline.md`, `05a_scoring_criteria.md`, and `05b_scoring_evidence.md`:
1.  **Scoring Engine Math:**
    -   15 criteria, each scored 0-5.
    -   Core Criteria (2x weight): Pain Intensity, Willingness to Pay, Urgency/Deadline, Solo Founder Feasibility, Revenue Velocity.
    -   Willingness to Pay is an average of 4 sub-signals.
    -   Maturity Bonus: +3 (growing), +1 (emerging), +0 (mature).
2.  **Kill Signals:**
    -   Auto-kill if: Legal Risk <= 1, Solo Feasibility <= 1, Content Buildability <= 1, WTP == 0, Market Size <= 1, Competition Quality == 0, Audience Accessibility <= 1, Passive Income Ratio <= 1, Maturity Stage == 'declining'.
3.  **Evidence Chains:**
    -   Scores >= 3 require an evidence entry in the `evidence_chains` table linking the score to a source URL or quote.
4.  **Warm Leads Pipeline:**
    -   Every signal with a username generates a lead.
    -   **Temperature:** Cold (default), Warm (engaged), Hot (intent), Converted (purchased). No downgrades.
    -   **Influence Tier:** normal, active, influencer, moderator.
    -   **Lead Score:** (Engagement * 0.3) + (Influence * 0.3) + (Recency * 0.2) + (Pain Intensity * 0.2). Max 100.

## Implementation Strategy

### 1. `src/services/scoring/ScoringEngine.js`
*   Create a class to process an `Opportunity` object containing raw signals.
*   **`calculateScore(opportunity, evidenceData)`**:
    *   Accepts the opportunity and an array of extracted evidence data.
    *   Iterates through the 15 criteria, applying the 0-5 rubric logic (simulated/NLP mapped for MVP).
    *   Applies the 2x multiplier for the 5 core criteria.
    *   Adds the Maturity Bonus based on `opportunity.maturity_stage`.
    *   Returns the `raw_score`, `weighted_score`, and an array of `EvidenceChain` objects.
*   **`checkKillSignals(scores, maturity)`**:
    *   Runs the disqualification thresholds. Returns a `kill_reason` if any fail.
*   **`persistScores(opportunityId, scoringResults)`**:
    *   Updates the `opportunities` table with the new scores, phase ('scored' or 'killed'), and `kill_reason`.
    *   Inserts into the `evidence_chains` table.

### 2. `src/services/leads/LeadPipeline.js`
*   Create a class to manage the CRM logic.
*   **`captureLeads(opportunityId, rawSignals)`**:
    *   Iterates through raw signals, deduplicating by `username` + `platform`.
    *   Calculates initial `lead_score`.
    *   Inserts new records into `warm_leads` with default temperature 'cold'.
*   **`calculateLeadScore(engagement, influence, datePosted, painIntensity)`**:
    *   Implements the algorithm defined in Doc 04.
*   **`updateTemperature(leadId, interactionType)`**:
    *   State machine: transitions lead based on interaction (e.g., 'replied' -> 'warm', 'signed_up' -> 'hot').

### 3. Testing Strategy (`tests/scoring/` & `tests/leads/`)
*   `ScoringEngine.test.js`: Test the weighted math precisely. Provide mock criteria scores and ensure the final `weighted_score` equals the expected mathematical output. Test that kill signals correctly flag an opportunity.
*   `LeadPipeline.test.js`: Test the `Lead Score` algorithm for accuracy. Test the state machine to ensure temperatures only go up and never downgrade. Test DB insertion logic via mocks.

## Summary
Iteration 6 transitions the application from simply finding problems to evaluating their worth. By implementing a strict mathematical rubric and linking it to actionable human leads, the system fulfills its promise of generating a prioritized, ready-to-contact marketing asset.