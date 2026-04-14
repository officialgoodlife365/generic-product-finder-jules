# Iteration 8 Design Document: Revenue Funnels & Payment Infrastructure

## Overview
Iteration 8 introduces the Revenue Optimizer layer and the Payment Infrastructure scaffolding. This module calculates strategic pricing (price anchoring), proposes product formats (format multiplication), estimates customer lifetime value (LTV modeling), assesses recurring revenue, and scaffolds the backend tables and stubbed webhook handlers required for processing payments via Stripe, Gumroad, or Lemon Squeezy.

## Deliverables Checklist
- [ ] Database Schema Additions: Add `orders` and `subscriptions` tables via a new database migration.
- [ ] Price Anchoring Calculator: Sets a front-end price based on 10-20% of professional alternative pricing.
- [ ] Format Multiplication Engine: Identifies potential product formats (PDF, Templates, Video, Tool, Community) to scale up revenue.
- [ ] Passive Income Ratio Calculator: Evaluates what percentage of the revenue requires ongoing founder time.
- [ ] LTV Modeling Module: Predicts Lifetime Value based on estimated bump, upsell, and subscription conversion rates.
- [ ] Revenue Funnel Architect: Generates a hybrid funnel structure (Starter -> Bump -> Core -> Subscription).
- [ ] Payment Webhook Scaffold: Creates Express routes (`/api/payments/webhooks/stripe`, etc.) to handle `payment.completed`, `payment.failed`, and subscription lifecycle events.

## Architecture Review
Based on `08a_revenue_pricing.md`, `08b_revenue_funnels.md`, and `14_payment_infrastructure.md`:

### 1. Revenue Optimization (Doc 08a & 08b)
-   **Price Anchoring:** Calculates front-end pricing strictly between 10% and 20% of the professional anchor price found during Discovery.
-   **Format Multiplication:** Outlines the sequence from Quick Win (Templates) to Core (Guide) to Scale (Video/SaaS) to Recurring (Subscription/Community).
-   **Passive Income Ratio:** Assesses the weight of active vs. passive time (e.g., templates = 100% passive, coaching = 0% passive).
-   **LTV Modeling:** Standardizes the math for projecting the value of 100 buyers through a multi-step funnel (FE -> Bump -> OTO1 -> OTO2 -> Sub).
-   **Stress Testing:** Calculates monthly NET revenue against conservative, base, and optimistic traffic/conversion scenarios.

### 2. Payment Infrastructure (Doc 14)
-   **Database Additions:** Introduces `orders` (tracking specific product tiers) and `subscriptions` (tracking recurring billing lifecycles).
-   **Webhook Handlers:** Defines the security requirements (signature verification, idempotency) and business logic for events like `payment.completed`, `payment.failed` (dunning), `refund.completed`, and `subscription.canceled`.
-   **MoR Strategy:** Recognizes that while Stripe handles payments directly, Merchant of Record (MoR) providers like Lemon Squeezy or Gumroad handle global tax compliance. The database schema must be agnostic to the specific `processor`.

## Implementation Strategy

### 1. Database Migration
*   Create `src/db/migrations/002_payment_infrastructure.sql`.
*   Include `CREATE TABLE` and `CREATE INDEX` statements for `orders` and `subscriptions` using PostgreSQL dialect (`SERIAL PRIMARY KEY`, `TIMESTAMP`, `DECIMAL`).

### 2. `src/services/revenue/RevenueOptimizer.js`
*   Create a new service module responsible for all pricing and funnel math.
*   **`calculatePriceAnchor(professionalPrice)`**: Returns min (10%), max (20%), and a suggested psychological price point (e.g., ending in 7).
*   **`generateFunnelArchitecture(niche, priceAnchor)`**: Constructs the Hybrid Funnel model array (Lead Magnet, Starter, Bump, Core, Upsell, Sub).
*   **`calculatePassiveIncomeRatio(formats)`**: Maps product formats to passive percentages and calculates an overall weighted ratio.
*   **`calculateLTV(frontEndPrice, conversionRates)`**: Applies the LTV formula from Doc 08b to output 12-month expected value per buyer.

### 3. `src/routes/payments.js`
*   Implement webhook scaffolding.
*   Create a generic webhook receiver `POST /api/payments/webhook` that parses standard payloads.
*   Include TODOs for HMAC signature verification (since we don't have active keys in the sandbox).
*   Implement switch-case logic mapping to `payment.completed`, `payment.failed`, `refund.completed`, etc.
*   Connect route to `src/routes/index.js`.

### 4. Testing Strategy (`tests/revenue/` & `tests/payments/`)
*   `tests/revenue/RevenueOptimizer.test.js`: Assert that `calculatePriceAnchor` returns the correct 10-20% range and applies psychological pricing. Assert that LTV math equals the worked examples provided in the architecture docs.
*   `tests/payments/webhooks.test.js`: Use `supertest` to fire mock webhook JSON payloads at the Express route and assert it returns a 200 OK after simulating database insertions into `orders` or `subscriptions`.

## Summary
Iteration 8 transforms the validated opportunity into a structured business model. By algorithmically assigning pricing, funnels, and LTV projections, the system ensures the solo founder knows exactly how to monetize the problem before writing a single line of copy. The addition of the payment infrastructure scaffolding prepares the application for actual launch mechanics.