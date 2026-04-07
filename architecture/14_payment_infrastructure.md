# 14 — Payment Infrastructure

> Complete payment processing architecture for the Generic Product Finder. Covers payment processor selection, checkout flow, pricing tiers, upsell mechanics, subscription management, tax compliance, and financial reporting.

---

## Payment Processor Selection

### Recommended Stack by Product Revenue Stage

| Revenue Stage | Primary Processor | Why | Monthly Cost |
|--------------|-------------------|-----|-------------|
| **$0 – $5K/mo** | Gumroad | Zero setup, handles tax, simple | 10% fee |
| **$5K – $25K/mo** | Stripe + Lemon Squeezy | Lower fees, more control | 2.9% + $0.30 |
| **$25K+/mo** | Stripe + custom checkout | Full control, lowest fees | 2.9% + $0.30 |

### Processor Feature Comparison

| Feature | Gumroad | Stripe | Lemon Squeezy | PayPal |
|---------|---------|--------|---------------|--------|
| **Checkout UX** | Built-in | Custom build | Built-in | Redirect |
| **Subscription support** | ✅ | ✅ | ✅ | ✅ |
| **Tax compliance (global)** | ✅ Auto | ❌ Need Stripe Tax | ✅ Auto | ❌ Manual |
| **Webhook support** | ✅ | ✅ | ✅ | ✅ |
| **Payout frequency** | Weekly | 2-day rolling | Bi-weekly | Instant |
| **Chargeback handling** | ✅ Auto | ✅ Manual | ✅ Auto | ✅ Auto |
| **Multi-currency** | ✅ | ✅ | ✅ | ✅ |
| **Affiliate tracking** | Basic | ❌ Need 3rd party | ✅ Built-in | ❌ |

---

## Checkout Flow Architecture

```
CHECKOUT FLOW
══════════════

Step 1: Product page / sales page
  → Clear pricing, feature comparison
  → Multiple payment options visible
  │
  ▼
Step 2: Checkout form
  → Email + payment details
  → Order bump / quick-add offer ($17-$47 add-on)
  → Coupon/discount code field
  │
  ▼
Step 3: Payment processing
  → Stripe/processor handles payment
  → Webhook fires on success
  │
  ▼
Step 4: Post-purchase (immediate)
  → Thank-you page with access instructions
  → OTO 1: One-Time Offer #1 (30-second countdown)
  │  → If accepted → add to order
  │  → If declined → show downsell variant
  │
  ▼
Step 5: Email delivery
  → Receipt + login credentials
  → Access link to membership portal
  → Welcome sequence begins (3-email series)
```

### Order Bump Strategy

The order bump appears on the checkout page as a checkbox add-on:

```
ORDER BUMP TEMPLATE
═══════════════════

□ YES! Add the [Quick-Start Template Pack] for just $17 (normally $47)

  ✓ 12 plug-and-play templates
  ✓ Fill-in-the-blank worksheets  
  ✓ Saves 5+ hours of setup time

This is a ONE-TIME offer at this price. Not available after checkout.
```

**Target conversion rate:** 30-45% of buyers add the order bump.

---

## Pricing Architecture

### Price Tier Framework

| Tier | Name | Price Range | Includes |
|------|------|-------------|----------|
| **FE** | Front-End / Core | $27 – $97 | Main product |
| **Bump** | Order Bump | $17 – $47 | Add-on (templates, shortcuts) |
| **OTO1** | Upsell 1 | $47 – $197 | Advanced version / premium content |
| **OTO2** | Upsell 2 | $27 – $97 | Related product / complementary tool |
| **Sub** | Subscription | $9.97 – $47/month | Updates, community, ongoing content |

### Revenue Projection Per 100 Buyers

```
REVENUE MATH (per 100 front-end buyers)
════════════════════════════════════════

FE purchase: 100 × $47          = $4,700
Order bump:   40 × $17 (40%)    = $  680
OTO1:         15 × $97 (15%)    = $1,455
OTO2:         10 × $47 (10%)    = $  470
Subscription:  8 × $27/mo (8%)  = $  216/month recurring

Day 1 revenue:     $7,305
Monthly recurring:  $216
12-month value:    $9,897 from 100 front-end buyers

Revenue per buyer:  $73.05 (Day 1) → $98.97 (12-month)
```

---

## Subscription Management

### Subscription Lifecycle

```
SUBSCRIPTION STATES
═══════════════════

ACTIVE → PAST_DUE → CANCELED → EXPIRED

ACTIVE:
  → Payment collected successfully
  → Full content access

PAST_DUE:
  → Payment failed (card expired, insufficient funds)
  → Grace period: 7 days
  → 3 retry attempts (Day 1, Day 3, Day 7)
  → Access maintained during grace period
  → Email notifications sent:
      Day 0: "Payment failed, please update card"
      Day 3: "Second attempt failed, 4 days remaining"
      Day 6: "Final notice — access suspended tomorrow"

CANCELED:
  → Buyer canceled or payment exhausted retries
  → Access continues until end of current billing period
  → Win-back email at Day 7, 14, 30 post-cancellation:
      Day 7:  "We miss you — here's what you missed"
      Day 14: "Come back for 50% off first month"
      Day 30: "Last chance — $1 for your first month back"

EXPIRED:
  → Access fully revoked
  → Account preserved (can reactivate any time)
```

### Dunning Email Templates

| Email | Timing | Subject Line | Conversion Target |
|-------|--------|-------------|-------------------|
| Payment retry 1 | Day 0 | "Action needed: payment failed" | 40% auto-resolve |
| Payment retry 2 | Day 3 | "Your access is at risk" | 25% update card |
| Final notice | Day 6 | "Last chance to keep your access" | 15% save |
| Win-back 1 | Day 7 post-cancel | "Here's what you missed this week" | 5% return |
| Win-back 2 | Day 14 post-cancel | "50% off — welcome back offer" | 8% return |
| Win-back 3 | Day 30 post-cancel | "$1 trial — last chance" | 3% return |

---

## Tax Compliance

### Sales Tax / VAT Handling

| Scenario | Solution | Tool |
|----------|----------|------|
| **US sales tax** | Automatic collection based on buyer state | Gumroad (auto) or Stripe Tax |
| **EU VAT** | Collect and remit based on buyer country | Lemon Squeezy (auto) or Paddle |
| **UK VAT** | 20% on digital goods to UK buyers | Processor handles if MoR |
| **Australia GST** | 10% on digital goods | Processor handles if MoR |
| **No nexus / threshold** | No collection required | Monitor thresholds |

**Recommendation:** Use a **Merchant of Record (MoR)** platform like Gumroad, Lemon Squeezy, or Paddle for the first $100K in revenue. They handle ALL tax collection, remittance, and compliance. After $100K, consider Stripe + custom tax management for lower fees.

### Tax Reporting

```
ANNUAL TAX REQUIREMENTS (US seller)
════════════════════════════════════

1. Report all income on Schedule C (IRS Form 1040)
2. Deduct business expenses:
   → Hosting costs
   → Software subscriptions (tools, processors)
   → Content creation costs
   → Marketing / ads
   → Home office (if applicable)
3. Quarterly estimated tax payments (Form 1040-ES)
4. 1099-K received from processor if > $600 in payments
5. State sales tax filing (varies by state)
```

---

## Webhook Integration

### Critical Webhooks

| Event | Webhook | Action |
|-------|---------|--------|
| **Purchase complete** | `payment.completed` | Create portal account, send access email |
| **Subscription renewed** | `subscription.renewed` | Log payment, extend access |
| **Payment failed** | `payment.failed` | Start dunning sequence |
| **Refund issued** | `refund.completed` | Revoke access, log reason |
| **Chargeback filed** | `dispute.created` | Revoke access, prepare evidence |
| **Subscription canceled** | `subscription.canceled` | Start win-back sequence |

### Webhook Security

```
WEBHOOK VERIFICATION
════════════════════

1. Verify webhook signature (HMAC-SHA256)
   → Every webhook includes a signature header
   → Compute expected signature using your webhook secret
   → Compare: if mismatch → reject (potential attack)

2. Validate event timestamp
   → Reject events older than 5 minutes (replay attack prevention)

3. Idempotency
   → Store webhook event IDs
   → If already processed → skip (prevent double processing)
```

---

## Financial Reporting

### Daily Revenue Dashboard

| Metric | Description |
|--------|-------------|
| **Gross revenue** | Total collected before fees |
| **Net revenue** | After processor fees + tax |
| **Average order value (AOV)** | Total rev / number of orders |
| **Refund amount** | Total refunds processed |
| **Net new subscribers** | New signups – cancellations |
| **Monthly recurring revenue (MRR)** | Total active subscription revenue |

### SQL Query: Revenue Summary

```sql
-- Daily revenue summary (requires orders/transactions table)
SELECT 
    date(created_at) AS day,
    COUNT(*) AS total_orders,
    SUM(amount) AS gross_revenue,
    SUM(CASE WHEN refunded = 1 THEN amount ELSE 0 END) AS refund_total,
    SUM(amount) - SUM(CASE WHEN refunded = 1 THEN amount ELSE 0 END) AS net_revenue,
    AVG(amount) AS avg_order_value
FROM orders
GROUP BY date(created_at)
ORDER BY day DESC;
```

---

## Database Tables

```sql
-- Orders / transactions
CREATE TABLE IF NOT EXISTS orders (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_email         TEXT NOT NULL,
    opportunity_id      INTEGER REFERENCES opportunities(id),
    product_name        TEXT NOT NULL,
    product_tier        TEXT DEFAULT 'FE',  -- 'FE', 'bump', 'OTO1', 'OTO2', 'subscription'
    amount              REAL NOT NULL,
    currency            TEXT DEFAULT 'USD',
    processor           TEXT NOT NULL,  -- 'stripe', 'gumroad', 'lemon_squeezy', 'paypal'
    processor_txn_id    TEXT,
    status              TEXT DEFAULT 'completed',  -- 'completed', 'refunded', 'disputed'
    refunded            INTEGER DEFAULT 0,
    refund_reason       TEXT,
    refund_date         TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_email         TEXT NOT NULL,
    product_name        TEXT NOT NULL,
    plan_name           TEXT,
    monthly_amount      REAL NOT NULL,
    status              TEXT DEFAULT 'active',  -- 'active', 'past_due', 'canceled', 'expired'
    processor           TEXT NOT NULL,
    processor_sub_id    TEXT,
    started_at          TEXT NOT NULL,
    current_period_end  TEXT,
    canceled_at         TEXT,
    cancel_reason       TEXT,
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_email ON orders(buyer_email);
CREATE INDEX idx_orders_product ON orders(product_name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_subs_email ON subscriptions(buyer_email);
CREATE INDEX idx_subs_status ON subscriptions(status);
```

---

*This document defines payment infrastructure for the Generic Product Finder. For delivery defense, see [12_delivery_and_fraud_defense.md](./12_delivery_and_fraud_defense.md). For anti-fraud monitoring, see [13_anti_fraud_monitoring.md](./13_anti_fraud_monitoring.md).*
