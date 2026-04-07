# 13 — Anti-Fraud Monitoring

> Real-time monitoring system that detects fraudulent patterns, unauthorized sharing, refund abuse, and content piracy across all products. Integrates with delivery defense (Doc 12) and payment infrastructure (Doc 14).

---

## Monitoring Architecture

```
FRAUD DETECTION FLOW
═════════════════════

                  ┌──────────────┐
                  │  Event Stream │   ← login, download, refund, access events
                  └──────┬───────┘
                         │
              ┌──────────▼──────────┐
              │   Pattern Analyzer   │
              │                      │
              │  ┌────────────────┐  │
              │  │ Access Patterns│  │  → bulk download detection
              │  │ Refund Patterns│  │  → serial refunder identification
              │  │ Share Patterns │  │  → multiple-IP login detection
              │  │ Revenue Leaks  │  │  → chargeback pattern detection
              │  └────────────────┘  │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   Alert Engine       │
              │                      │
              │  Level 1: Log only   │
              │  Level 2: Email alert│
              │  Level 3: Auto-block │
              └─────────────────────┘
```

---

## Detection Rules

### Rule 1: Bulk Download Detection

**Trigger:** Buyer downloads more than 5 assets within 30 minutes

```
RULE: BULK_DOWNLOAD
═══════════════════

Condition:
  download_count > 5 AND time_window < 30 minutes

Action by severity:
  5-10 downloads/30min → Level 1: Log + flag for review
  10-20 downloads/30min → Level 2: Email alert + temporary rate limit
  20+ downloads/30min → Level 3: Auto-suspend download access + email alert

False positive check:
  → Is this a new buyer in first 24 hours? (legitimate exploration)
  → Is this a bundle product? (expected to download multiple files)
  → Is this an upgrade tier? (accessing newly unlocked content)
```

### Rule 2: Suspicious Login Pattern

**Trigger:** Same account accessed from 3+ different IPs within 24 hours

```
RULE: MULTI_IP_LOGIN
════════════════════

Condition:
  unique_ips >= 3 AND time_window < 24 hours

Exceptions (do NOT flag):
  → VPN rotation (same /16 subnet)
  → Mobile + desktop (2 IPs acceptable)
  → Known VPN service IPs (maintain whitelist)

Action:
  3-5 unique IPs → Level 1: Log + monitor
  5-10 unique IPs → Level 2: Alert + force re-authentication
  10+ unique IPs → Level 3: Account suspended pending review
```

### Rule 3: Serial Refunder

**Trigger:** Buyer has requested 2+ refunds across any products within 12 months

```
RULE: SERIAL_REFUNDER
═════════════════════

Condition:
  refund_count >= 2 AND time_window < 12 months

Action:
  2nd refund → Level 2: Flag + manual review before processing
  3rd refund → Level 3: Auto-decline + offer store credit instead
  4th+ refund → Permanent flag, all future purchases monitored

Data to check:
  → Email variations (john@gmail.com vs j.ohn@gmail.com)
  → Same payment method across refunds
  → Content access percentage before refund request
```

### Rule 4: Content Piracy Detection

**Trigger:** Product content found on unauthorized sites

```
RULE: PIRACY_DETECTION
══════════════════════

Monitoring frequency: Weekly

Methods:
  1. Google Alerts for product titles + unique phrases
  2. DMCA service (e.g., LegalForce) for automated scanning
  3. Buyer report mechanism (incentivize reporting)
  4. Watermark extraction from found copies (if watermarked)

Action:
  Found on sharing site → DMCA takedown + identify source buyer
  Found on competitor site → Legal escalation
  Found on social media → DMCA + revoke source account
```

### Rule 5: Chargeback Pattern

**Trigger:** Buyer files payment dispute instead of requesting refund

```
RULE: CHARGEBACK_DETECTION
═══════════════════════════

Condition:
  payment_dispute_filed = true

Immediate actions:
  1. Revoke all product access
  2. Document buyer's content access history
  3. Prepare dispute evidence package:
     → Receipt + payment confirmation
     → Login history showing product was accessed
     → Download history with timestamps
     → ToS acceptance record
  4. Submit dispute response within 3 business days

Prevention:
  → Clear refund policy on sales page
  → Easy refund process (make it easier to refund than chargeback)
  → Pre-sale clarity about what the product IS and ISN'T
```

---

## Alert Configuration

### Notification Channels

| Alert Level | Email | Dashboard | SMS | Auto-Action |
|------------|-------|-----------|-----|-------------|
| Level 1 (Log) | ❌ | ✅ Log entry | ❌ | None |
| Level 2 (Warning) | ✅ | ✅ Highlighted | ❌ | Rate limit / flag |
| Level 3 (Critical) | ✅ | ✅ Red alert | ✅ (optional) | Auto-suspend |

### Escalation Timeline

```
INCIDENT RESPONSE
═════════════════

T+0     Alert fires
T+15min Level 2 alerts reviewed (during business hours)
T+1hr   Level 3 alerts reviewed and actioned
T+24hr  Incident documented in fraud log
T+48hr  Root cause analysis for Level 3 incidents
T+7d    Policy update if new pattern identified
```

---

## Fraud Metrics Dashboard

### Key Performance Indicators

| Metric | Target | Red Flag | Action |
|--------|--------|----------|--------|
| **Refund rate** | < 5% | > 10% | Review product quality / positioning |
| **Chargeback rate** | < 0.5% | > 1% | Urgent — risk of payment processor ban |
| **Piracy incidents / month** | < 2 | > 5 | Strengthen watermarking / access controls |
| **Multi-IP login rate** | < 3% of accounts | > 8% | Tighten access controls |
| **Average downloads per buyer** | 2-5 | > 15 | Investigate potential scraping |

### Monthly Review Template

```
MONTHLY FRAUD REVIEW
═════════════════════

Period: [Month/Year]

Refund Summary:
  Total refunds requested: [N]
  Refund rate: [%]
  Serial refunders identified: [N]
  Refunds declined (fraud): [N]

Chargeback Summary:
  Total chargebacks: [N]
  Chargebacks won: [N]
  Chargebacks lost: [N]
  Win rate: [%]

Access Anomalies:
  Bulk download alerts: [N]
  Multi-IP alerts: [N]
  Accounts suspended: [N]

Piracy:
  Content found on unauthorized sites: [N]
  DMCA takedowns filed: [N]
  Source accounts identified: [N]

Revenue Impact:
  Revenue lost to refund fraud: $[X]
  Revenue protected (declined fraud): $[X]
  Chargeback fees paid: $[X]
```

---

## Database Tables

```sql
-- Fraud events log
CREATE TABLE IF NOT EXISTS fraud_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_email     TEXT NOT NULL,
    event_type      TEXT NOT NULL,  -- 'bulk_download', 'multi_ip', 'serial_refund', 'chargeback', 'piracy'
    alert_level     INTEGER DEFAULT 1,  -- 1, 2, or 3
    details         TEXT,  -- JSON blob with event-specific data
    auto_action     TEXT,  -- 'none', 'rate_limited', 'suspended', 'blocked'
    resolved        INTEGER DEFAULT 0,
    resolved_at     TEXT,
    resolved_by     TEXT,
    notes           TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_fraud_email ON fraud_events(buyer_email);
CREATE INDEX idx_fraud_type ON fraud_events(event_type);
CREATE INDEX idx_fraud_level ON fraud_events(alert_level);
CREATE INDEX idx_fraud_resolved ON fraud_events(resolved);
```

---

*This document defines the anti-fraud monitoring system. For delivery defense mechanisms, see [12_delivery_and_fraud_defense.md](./12_delivery_and_fraud_defense.md). For payment infrastructure, see [14_payment_infrastructure.md](./14_payment_infrastructure.md).*
