-- Orders / transactions table
CREATE TABLE IF NOT EXISTS orders (
    id                  SERIAL PRIMARY KEY,
    buyer_email         TEXT NOT NULL,
    opportunity_id      INTEGER REFERENCES opportunities(id),
    product_name        TEXT NOT NULL,
    product_tier        TEXT DEFAULT 'FE',  -- 'FE', 'bump', 'OTO1', 'OTO2', 'subscription'
    amount              DECIMAL(10,2) NOT NULL,
    currency            TEXT DEFAULT 'USD',
    processor           TEXT NOT NULL,  -- 'stripe', 'gumroad', 'lemon_squeezy', 'paypal'
    processor_txn_id    TEXT,
    status              TEXT DEFAULT 'completed',  -- 'completed', 'refunded', 'disputed'
    refunded            BOOLEAN DEFAULT FALSE,
    refund_reason       TEXT,
    refund_date         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_name);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  SERIAL PRIMARY KEY,
    buyer_email         TEXT NOT NULL,
    product_name        TEXT NOT NULL,
    plan_name           TEXT,
    monthly_amount      DECIMAL(10,2) NOT NULL,
    status              TEXT DEFAULT 'active',  -- 'active', 'past_due', 'canceled', 'expired'
    processor           TEXT NOT NULL,
    processor_sub_id    TEXT,
    started_at          TIMESTAMP NOT NULL,
    current_period_end  TIMESTAMP,
    canceled_at         TIMESTAMP,
    cancel_reason       TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subs_email ON subscriptions(buyer_email);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
