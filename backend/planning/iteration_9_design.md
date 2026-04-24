# Iteration 9 Technical Design Document: Delivery Defense, Anti-Fraud & Blueprints

## 1. Overview
Iteration 9 focuses on protecting intellectual property and finalizing the go-to-market strategy. It implements product delivery controls, forensic watermarking, real-time anti-fraud monitoring, and the overarching Blueprint Generator which compiles research, scoring, and funnel architecture into an actionable execution plan.

## 2. Deliverables & Features

### 2.1 Blueprint Generator (Doc 10)
- **Goal**: Synthesize data from all previous pipelines into a single comprehensive launch blueprint.
- **Components**:
  - `BlueprintService.js`: Compiles the opportunity data.
  - Sections generated:
    1. Opportunity Summary
    2. Target Persona Profile
    3. Problem & Solution Mapping
    4. Product Matrix (Formats + Pricing)
    5. Revenue Stress Test (Conservative/Base/Optimistic)
    6. Monetization Architecture (Funnels & CAC:LTV)
    7. Distribution Strategy
    8. Day 1 Launch Plan (using Warm Leads)
    9. Legal & Risk Assessment
    10. Build Plan & Timeline
- **Selection Algorithm**: Rank multiple blueprints based on Validated Score (30%), Revenue Velocity (25%), Warm Leads (20%), Passive Income Ratio (15%), and Legal Simplicity (10%).

### 2.2 Anti-Fraud Monitoring (Doc 13)
- **Goal**: Detect and alert on fraudulent behavior using rule-based pattern matching.
- **Core Rules Engine (`AntiFraudEngine.js`)**:
  - Rule 1: **Bulk Download Detection** (>5 downloads in 30 mins)
  - Rule 2: **Suspicious Login Pattern** (3+ unique IPs in 24 hours)
  - Rule 3: **Serial Refunder** (2+ refunds in 12 months)
  - Rule 4: **Chargeback Detection** (Auto-revoke access)
- **Database Schema**: Implement `003_anti_fraud_infrastructure.sql` for the `fraud_events` table tracking `event_type`, `alert_level`, `auto_action`, and resolution status.

### 2.3 Delivery Defense (Doc 12)
- **Goal**: Layered DRM and strategic product access.
- **Components (`DeliveryService.js`)**:
  - **Gated Access**: Verify purchase state and tier (`FE`, `OTO1`, `Sub`) before granting URL/file access.
  - **Progressive Drip**: Logic to calculate access windows (Day 0 Core, Day 3 Bonus, etc).
  - **Watermarking**: Integration hook (or mock for now since we aren't using heavy python `reportlab` logic in this iteration, we will implement a Node-based mock or text-stamp utility to simulate forensic watermarking injection).

### 2.4 Smoke Testing Strategy (Doc 09)
- **Goal**: Validate demand before full build.
- **Components**:
  - Provide helper methods in `SmokeTestManager.js` to track `conversion_type` (e.g., `waitlist_signup`, `pre_order`) and upgrade warm leads to `hot`.

## 3. Implementation Plan

### Step 1: Database Setup
- Create `src/db/migrations/003_anti_fraud_infrastructure.sql` defining `fraud_events`.

### Step 2: The Logic Services
- `src/services/blueprints/BlueprintGenerator.js`
- `src/services/defense/AntiFraudEngine.js`
- `src/services/defense/DeliveryService.js`
- `src/services/defense/SmokeTestManager.js`

### Step 3: Webhooks Integration Update
- Connect `payment.failed` and `dispute.created` webhooks in `src/routes/payments.js` to the `AntiFraudEngine` to log chargeback events and revoke access.
- Update `refund.completed` to trigger `AntiFraudEngine.checkSerialRefunder()`.

### Step 4: Testing Suite
- Create `tests/defense/AntiFraudEngine.test.js` covering the 4 core rules.
- Create `tests/defense/DeliveryService.test.js` for tier-based access and dripping.
- Create `tests/blueprints/BlueprintGenerator.test.js` ensuring accurate data assembly.