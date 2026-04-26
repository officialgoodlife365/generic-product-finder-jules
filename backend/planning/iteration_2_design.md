# Iteration 2 Design Document: Source Module — Community Ingestion

## Overview
Iteration 2 focuses on building the "Community Voice" source ingestion layer. This involves creating a plugin-based architecture for scanning community data sources where users express pain points. The deliverable requires implementing adapter modules for Reddit, Hacker News, YouTube, Quora, and generic forums, all outputting a unified `SourceResult` (or `SignalResult` as per `02a`). These modules will be driven by the core `SourceModuleManager`.

## Deliverables Checklist
- [ ] Unified `SignalResult` data model implementation
- [ ] Source adapter interface / base class
- [ ] Reddit adapter module (API integration/scraping)
- [ ] Hacker News adapter module
- [ ] YouTube comment adapter module
- [ ] Quora adapter module
- [ ] Generic niche forum adapter (configurable URL + CSS selectors)
- [ ] `SourceModuleManager` to load and execute adapters based on the DB registry
- [ ] Tests for each adapter using mocked API responses

## Architecture Review
Based on `02a_source_modules_community.md`:
1.  **Standardized Interface:** All modules must implement a common interface accepting an input configuration (niches, keywords, date range, limits) and outputting an array of `SignalResult` objects.
2.  **`SignalResult` Schema:** Needs to capture `signal_id`, `source_module`, `source_category` ("community_voice"), `source_url`, `problem_name`, `signal_type`, `raw_quote`, `username`, `engagement_metrics`, and `niche`/`sub_niche`.
3.  **Error Handling:** Adapters must handle rate limits, auth expiration, and timeouts gracefully, returning partial results and structured error statuses.
4.  **Specific Modules:**
    -   **Reddit:** Tier 1. Searches target subreddits using specific queries (e.g., "nightmare OR frustrated"). Requires capturing engagement (upvotes/comments) and handling rate limits.
    -   **Hacker News:** Tier 1. Scans "Ask HN" and keyword searches on `news.ycombinator.com`.
    -   **X/Twitter (Placeholder):** Tier 2, though mentioned in architecture, the deliverable specifies YouTube, Quora, and a Generic adapter.
    -   **YouTube Comments:** Tier 2. Scans comments on tutorial videos for unmet needs.
    -   **Quora & Generic Forum:** Need configurable scraping/API calls.

## Implementation Details

### 1. Data Models and Interfaces
-   **`src/services/source_modules/types.js`**: Define the `SignalResult` JSDoc types and schemas to enforce consistency across all modules.
-   **`src/services/source_modules/BaseSourceModule.js`**: An abstract base class that defines the required methods:
    -   `constructor(config)`
    -   `async scan(niches, keywords, dateRange, options)` -> returns `Array<SignalResult>`
    -   `handleError(error)` -> standardizes error formatting.

### 2. Module Implementations
Create a separate file for each module under `src/services/source_modules/adapters/`:
-   **`reddit.js`**: Use `axios` to hit the open Reddit JSON API (e.g., `https://www.reddit.com/r/subreddit/search.json?q=query`).
-   **`hackernews.js`**: Use the official Algolia Hacker News Search API (`https://hn.algolia.com/api/v1/search`).
-   **`youtube.js`**: Will likely require Google API keys or a fallback scraping mechanism to retrieve comments on top tutorial videos.
-   **`quora.js`**: Due to strict scraping protections, this will utilize a basic web search fallback (e.g., using a search engine API restricting `site:quora.com`) or simple HTML scraping of public pages.
-   **`generic_forum.js`**: Accepts a configuration object specifying the base URL and CSS selectors for posts, authors, and engagement metrics. Uses `cheerio` or `axios` to fetch and parse HTML.

### 3. Source Module Manager
-   **`src/services/source_modules/SourceModuleManager.js`**:
    -   Connects to the `source_registry` database table.
    -   Loads enabled modules sorted by priority.
    -   Orchestrates the `scan` calls, injecting keywords and niches.
    -   Aggregates the standard `SignalResult` outputs.

### 4. Testing Strategy
-   Create a folder `tests/source_modules/`.
-   Use `jest` and `nock` (or `axios-mock-adapter`) to mock HTTP responses for each specific platform.
-   Write unit tests for the `SourceModuleManager` to verify it correctly reads from the mock DB, instantiates the proper adapters, and aggregates results.
-   Write unit tests for each adapter to verify mapping from external API payloads to the unified `SignalResult` schema and to verify error handling (rate limit backoffs).

## Summary
The "Build" phase for Iteration 2 will focus purely on retrieving raw, unstructured data from external communities and unifying it into the clean `SignalResult` format. Triangulation and deep extraction belong to Iteration 4 (Discovery Engine). The primary challenge will be robust error handling and API mocking for the test suite.
