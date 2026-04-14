# Iteration 4 Design Document: Discovery Engine & Triangulation

## Overview
Iteration 4 focuses on implementing the core `DiscoveryEngine` service responsible for orchestrating Phase 1A (Broad Sweep) and Phase 1B (Deep Extraction). It bridges the gap between the raw `SignalResult` outputs from the Source Modules (built in Iterations 2 & 3) and the structured `opportunities` and `warm_leads` database tables.

## Deliverables Checklist
- [ ] Phase 1A Orchestration: Trigger `SourceModuleManager`, aggregate raw signals.
- [ ] Signal Deduplication: Group signals by `problem_fingerprint` or cosine similarity.
- [ ] Triangulation Logic: Verify signals appear in 2+ independent source categories.
- [ ] Freshness & Velocity Weighting: Apply decay based on age, boost score for recurring signals.
- [ ] Maturity Classification: Rules engine to classify as Emerging, Growing, Mature, or Declining.
- [ ] Database Persistence: Write triangulated/corroborated problems to `opportunities` and associated users to `warm_leads`. Write run summaries to `discovery_runs`.
- [ ] Integration Tests: End-to-end pipeline from source ingestion to database records using mocks.

## Architecture Review
Based on `03_discovery_engine.md`:
1.  **Phase 1A (Broad Sweep):** Execute all Tier 1 modules (and Tier 2 if needed). Pool all `SignalResult` objects.
2.  **Deduplication:** Group signals by a hash/fingerprint of the niche + problem description. Merge URLs and engagement scores. If a signal spans `community_voice` and `search_data`, it is "triangulated".
3.  **Phase 1B (Deep Extraction & Triangulation):** Filter the deduped pool. Prioritize signals hitting 2+ categories, or with engagement > 50, or tied to regulatory urgency.
4.  **Transformation:**
    - Calculate base `raw_score` from aggregated engagement and freshness.
    - Set `maturity_stage` based on signal volume and age.
    - Persist the finalized problem into the `opportunities` table.
5.  **Warm Leads:** Any signal containing a `username` gets persisted into the `warm_leads` table, linked to the parent `opportunity_id`.
6.  **Run Logging:** Generate a summary of the run and persist it to the `discovery_runs` table.

## Implementation Strategy

### 1. `src/services/discovery/DiscoveryEngine.js`
The primary service class orchestrating the flow.
*   **`runPhase1A(niches, keywords)`**:
    *   Calls `SourceModuleManager.runDiscoveryPhase1A()`.
    *   Executes `deduplicateSignals(signals)`.
*   **`deduplicateSignals(signals)`**:
    *   Groups `SignalResult` objects using `problem_fingerprint`.
    *   Aggregates `source_categories` into a Set to determine `triangulation_status` (`watch_list`, `triangulated`, `corroborated`).
    *   Aggregates `source_urls`, `engagement_score`, and extracts the max `freshness_weight`.
*   **`runPhase1B(dedupedSignals)`**:
    *   Filters the top 40-50 signals based on priority rules.
    *   Calculates `maturity_stage`.
    *   Determines `signal_velocity` (comparing against previous runs in the DB).
*   **`persistResults(processedSignals)`**:
    *   For each finalized signal, INSERT into `opportunities` (if it doesn't exist) or UPDATE (if velocity/corroboration increased).
    *   Extract usernames from the raw signals forming the opportunity and INSERT into `warm_leads`.
    *   Record run metrics into `discovery_runs`.

### 2. Helper Modules
*   **`src/services/discovery/utils.js`**:
    *   Contains the business logic for calculating `maturity_stage` (Emerging, Growing, Mature, Declining) based on source counts and signal age.
    *   Contains the logic for assigning `triangulation_status` based on the length of the `source_categories` set.

### 3. Testing Strategy
*   Create `tests/discovery/DiscoveryEngine.test.js`.
*   Mock `SourceModuleManager.runDiscoveryPhase1A` to return a predefined set of `SignalResult` objects spanning multiple categories (e.g., 2 Reddit posts, 1 Google Trends result matching the same fingerprint).
*   Verify that `deduplicateSignals` correctly merges them, identifies that 2 categories were hit, and sets `triangulation_status` to `triangulated`.
*   Mock `db.query` to ensure the final output correctly calls `INSERT INTO opportunities`, `INSERT INTO warm_leads`, and `INSERT INTO discovery_runs`.

## Summary
The Discovery Engine acts as the central brain of the ingestion phase. It filters the noise from the source modules into high-confidence `opportunities` ready for scoring. By implementing strict deduplication and triangulation, we ensure that only validated, multi-source pain points enter the database, fulfilling the core value proposition of the system.
