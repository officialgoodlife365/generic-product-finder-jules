# Iteration 3 Design Document: Source Module — Data Ingestion

## Overview
Iteration 3 focuses on implementing the "Data & Marketplace" source ingestion layer, which encompasses quantitative search signals, trend analysis, regulatory calendars, and marketplace proof. These modules complement the "Community Voice" modules implemented in Iteration 2, setting the stage for the full Discovery Engine triangulation (Iteration 4).

## Deliverables Checklist
- [ ] Google Trends adapter (`search_data`)
- [ ] Exploding Topics adapter (`search_data`)
- [ ] Government/Regulatory adapter (`search_data`) - populates `regulatory_calendar` table
- [ ] G2/ProductHunt review adapter (`marketplace_proof`)
- [ ] Amazon/Udemy review adapter (`marketplace_proof`)
- [ ] Upwork/Fiverr adapter (`marketplace_proof`)
- [ ] Data normalization pipeline: Map outputs to unified `SignalResult` format compatible with `SourceModuleManager`
- [ ] Tests for each adapter utilizing mocked HTTP responses

## Architecture Review
Based on `02b_source_modules_data.md`:
1.  **Categories:** The source modules fall into two new categories: `search_data` and `marketplace_proof`.
2.  **`SignalResult` Schema:** We continue utilizing the `SignalResult` schema defined in `src/services/source_modules/types.js`. Data modules map their findings (trends, ratings, prices) into this structure (e.g., trend direction mapped to `metadata.trend_direction`).
3.  **Special Handling (`gov_regulatory`):** The Government/Regulatory module is unique. Besides outputting `SignalResult` objects, it discovers future effective dates for regulations, which must be inserted into the `regulatory_calendar` database table to drive proactive alerts.
4.  **Special Handling (Marketplace Prices):** Modules like Upwork and Amazon extract professional price anchors which will be stored in `metadata.price_anchor` to later feed the Revenue Engine (Iteration 8).
5.  **Integration:** All modules will extend the `BaseSourceModule` created in Iteration 2 and register themselves with the existing `SourceModuleManager`.

## Implementation Strategy

### 1. Adapter Implementations (`src/services/source_modules/adapters/`)
For the MVP, we will implement these modules using `axios` and `cheerio` to fetch and parse public search pages or mock APIs, simulating data retrieval without requiring paid API keys.

*   **`google_trends.js`**:
    *   Simulates fetching trend data for a keyword.
    *   Extracts `trend_direction` (rising, flat, declining) and sets `engagement_score` based on relative interest.
*   **`exploding_topics.js`**:
    *   Scrapes/simulates early-mover trend topics.
    *   Focuses on topics with high recent growth in business/tech categories.
*   **`gov_regulatory.js`**:
    *   Scans federal register/compliance sites for new rules.
    *   Maps to `SignalResult`.
    *   *Crucial Addition:* Needs a mechanism (or hook in the manager) to save identified upcoming regulations directly to the `regulatory_calendar` DB table.
*   **`producthunt_g2.js`**:
    *   Scans software reviews for feature gaps or pricing complaints.
    *   Extracts low ratings (1-3 stars) as pain signals.
*   **`amazon_reviews.js` & `upwork_fiverr.js`**:
    *   Scans for negative reviews or high-priced gig services.
    *   Extracts professional pricing as a `metadata.price_anchor`.

### 2. Updating the `SourceModuleManager`
The `SourceModuleManager` (from Iteration 2) already dynamically loads modules from the `source_registry` DB.
-   We will append the new adapter classes to the `this.adapters` map.
-   We need to ensure that the manager can handle special side-effects, such as the `gov_regulatory` module returning specific calendar events that need DB insertion, or we can handle that insertion directly within the `gov_regulatory.js` adapter. Handling it inside the adapter keeps the `SourceModuleManager` strictly focused on `SignalResult` aggregation.

### 3. Testing Strategy
-   Extend the Jest suite in `tests/source_modules/` with files for `google_trends.test.js`, `gov_regulatory.test.js`, and `marketplace.test.js`.
-   Use `axios-mock-adapter` to stub HTML/JSON responses for trend charts, review pages, and government sites.
-   Verify that `gov_regulatory` correctly attempts to write to the `regulatory_calendar` table (by spying on `db.query`).
-   Ensure all outputs conform precisely to the `SignalResult` typescript definitions.

## Summary
Iteration 3 expands the ingestion funnel to include quantitative and marketplace evidence. By the end of the Build phase, the system will have a diverse array of 10+ mocked/functional source modules running in parallel, standardizing drastically different web data into a single, cohesive `SignalResult` array ready for Iteration 4's Discovery Engine.
