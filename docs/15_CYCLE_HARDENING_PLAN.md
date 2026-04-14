# Post-MVP Hardening: 15-Cycle Automated Fuzzing & Bug Resolution Plan

Now that the core Generic Product Finder application has passed the 10-Iteration macro audit and a 5-cycle preliminary hardening sweep, the system is ready for the ultimate robustness check.

This document outlines a 15-Cycle Automated Testing Plan designed to run iteratively. An AI Agent or CI/CD runner should execute these cycles sequentially, documenting the bugs found, the resolution implemented, and asserting 100% test pass rates before proceeding to the next cycle.

---

## The 15 Cycles

### Cycle 1-3: Deep Semantic Ingestion Fuzzing
*   **Cycle 1 (Encoding & Languages):** Feed `SourceModuleManager` raw data streams containing mixed encodings (UTF-8, UTF-16, ISO-8859-1), right-to-left languages (Arabic/Hebrew), and massive continuous strings (10MB+) without spaces to stress the regex tokenizers and DB text constraints.
*   **Cycle 2 (Pagination & Rate Limits):** Mock external APIs (Reddit/HackerNews) to return simulated `429 Too Many Requests` or `503 Service Unavailable` errors mid-pagination. Verify the engine pauses, backs off exponentially, and resumes without losing previously ingested memory signals.
*   **Cycle 3 (Poisoned Semantic Footprints):** Inject identical `pain_quotes` with radically different sentiment (sarcasm, negation, double negatives). Test if `DiscoveryEngine`'s semantic matching inaccurately clusters distinct problems.

### Cycle 4-6: Advanced Database Concurrency & Deadlocks
*   **Cycle 4 (Massive Concurrent Inserts):** Simulate 1,000 asynchronous webhooks hitting `/api/payments/webhook` simultaneously. Check the PostgreSQL pool for connection exhaustion or `ON CONFLICT` duplicate key violations in the `orders` table.
*   **Cycle 5 (Race Condition Deletions):** Trigger an Opportunity `Kill` sequence (which cascades to `warm_leads`) at the exact millisecond a new `warm_lead` is being inserted via a separate smoke test interaction. Ensure the database transaction rolls back safely without orphaned keys.
*   **Cycle 6 (Vacuum & Bloat):** Run 100,000 dummy opportunity creations and immediate soft-deletes. Monitor query planner performance on `SELECT` queries traversing the bloated indices. Implement `pg_cron` vacuuming if necessary.

### Cycle 7-9: Financial Infrastructure Exploits
*   **Cycle 7 (Webhook Spoofing):** Send structurally perfect Stripe/LemonSqueezy webhooks but with an invalid HMAC signature or missing `Stripe-Signature` header. Ensure the application securely drops the payload with a 401/403 and does not process the internal logic.
*   **Cycle 8 (Negative & Fractional Pennies):** Fire webhook events with negative `amount_total` values or non-integer fractional cents. Verify `RevenueOptimizer` and SQL `DECIMAL(10,2)` constraints reject or safely floor/ceiling the values without throwing `NaN` calculation crashes in the `BlueprintGenerator`.
*   **Cycle 9 (Subscription State Bleeding):** Simulate a user whose `subscription` goes into `past_due`, then `canceled`, and then immediately triggers a `payment.completed` recovery. Verify the state machine correctly prioritizes the recovery and restores `DeliveryService` access.

### Cycle 10-12: The Anti-Fraud Engine Fuzzing
*   **Cycle 10 (IP Spoofing & IPv6):** Feed the `AntiFraudEngine` rapid login events alternating between IPv4, IPv6, and localized subnet variations (e.g., `192.168.1.1` vs `192.168.1.50`). Ensure the rule accurately distinguishes true VPN rotation from localized DHCP changes to prevent false-positive account suspensions.
*   **Cycle 11 (Rapid Refund-Chargeback Flapping):** Simulate a user triggering a `refund.completed` event immediately followed by a `dispute.created` event on the same transaction ID. Ensure the `fraud_events` table does not double-penalize the account or crash due to duplicate logging.
*   **Cycle 12 (Watermark Buffer Overflows):** Inject massive strings (10,000+ characters) into the buyer's email or transaction ID fields. Verify `DeliveryService.generateWatermarkStamp` slices, truncates, or sanitizes the string to prevent memory buffer overflows during PDF stamping.

### Cycle 13-15: Architectural Degredation & LTV Boundaries
*   **Cycle 13 (Missing LTV Data Models):** Strip the `BlueprintGenerator` of all historical conversion metrics (set `expected_conv` to `null`). Verify the architecture falls back gracefully to hardcoded industry baselines (e.g., 10% OTO1) without crashing the final JSON payload.
*   **Cycle 14 (Extreme Legal Matrix Combos):** Force the `ValidationService` to parse contradictory legal matrix data (e.g., `health_financial: true` but `disclaimer_tier: A`). Verify the safety net always defaults to the highest liability constraint (Tier D / KILL).
*   **Cycle 15 (Zero-Day Node Updates):** Execute the entire 100+ test suite using a nightly unstable build of Node.js and upgrading all `package.json` dependencies to `latest` ignoring semantic versioning rules. Resolve all resulting deprecation warnings or breaking changes to ensure absolute forward compatibility.

---

## Execution Directives for AI Agents
1. When assigned a Cycle, read the objective, create a test file mapping strictly to the edge case (e.g., `tests/fuzzing/cycle_1.test.js`), and execute the fuzzing.
2. The application *will* break. Read the stack trace.
3. Modify the `src/` logic to defensively patch the vulnerability.
4. Run `npm test`. Ensure the new fuzzing test passes, and the prior 98+ tests remain unaffected.
5. Advance to the next Cycle.