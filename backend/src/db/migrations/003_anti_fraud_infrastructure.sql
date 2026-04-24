-- Fraud events log table
CREATE TABLE IF NOT EXISTS fraud_events (
    id              SERIAL PRIMARY KEY,
    buyer_email     TEXT NOT NULL,
    event_type      TEXT NOT NULL,  -- 'bulk_download', 'multi_ip', 'serial_refund', 'chargeback', 'piracy'
    alert_level     INTEGER DEFAULT 1,  -- 1, 2, or 3
    details         JSONB,  -- JSON blob with event-specific data (e.g. IPs, download counts)
    auto_action     TEXT,  -- 'none', 'rate_limited', 'suspended', 'blocked'
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMP,
    resolved_by     TEXT,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fraud_email ON fraud_events(buyer_email);
CREATE INDEX IF NOT EXISTS idx_fraud_type ON fraud_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fraud_level ON fraud_events(alert_level);
CREATE INDEX IF NOT EXISTS idx_fraud_resolved ON fraud_events(resolved);
