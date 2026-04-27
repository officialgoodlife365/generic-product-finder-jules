const request = require('supertest');
const express = require('express');
const paymentsRouter = require('../../src/routes/payments');
const db = require('../../src/db');
const crypto = require('crypto');

// Mock db
jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

const WEBHOOK_SECRET = 'test_secret';
process.env.WEBHOOK_SECRET = WEBHOOK_SECRET;

function generateStripeSignature(payloadStr) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payloadStr}`;
  const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

function generateLSSignature(payloadStr) {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadStr).digest('hex');
}

const app = express();
app.use('/payments', paymentsRouter);

describe('Payments API Webhooks', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles payment.completed successfully', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const payload = {
      type: 'payment.completed',
      data: {
        object: {
          customer_email: 'buyer@example.com',
          amount_total: 9700,
          id: 'txn_123',
          metadata: {
            product_name: 'Super Course',
            product_tier: 'FE'
          }
        }
      }
    };

    const payloadStr = JSON.stringify(payload);
    const signature = generateStripeSignature(payloadStr);

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payloadStr);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO orders'),
      ['buyer@example.com', 'Super Course', 'FE', 97, 'generic_processor', 'txn_123']
    );
  });

  it('handles subscription.canceled successfully', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const payload = {
      type: 'subscription.canceled',
      data: {
        object: {
          id: 'sub_456'
        }
      }
    };

    const payloadStr = JSON.stringify(payload);
    const signature = generateLSSignature(payloadStr);

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-signature', signature)
      .send(payloadStr);

    expect(response.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE subscriptions SET status = \'canceled\''),
      [expect.any(String), 'sub_456']
    );
  });

  it('handles refund.completed successfully', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const payload = {
      type: 'refund.completed',
      data: {
        object: {
          payment_intent: 'txn_123'
        }
      }
    };

    const payloadStr = JSON.stringify(payload);
    const signature = generateStripeSignature(payloadStr);

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payloadStr);

    expect(response.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE orders SET status = \'refunded\''),
      ['txn_123']
    );
  });

  it('returns 400 on malformed JSON payload', async () => {
    // Need to test a scenario where processing fails, but since the raw parser is used, malformed body usually crashes earlier or hits catch block.
    // We can simulate an error during db query.
    db.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const payload = {
      type: 'payment.completed',
      data: {
        object: {
          customer_email: 'buyer@example.com'
        }
      }
    };

    const payloadStr = JSON.stringify(payload);
    const signature = generateStripeSignature(payloadStr);

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payloadStr);

    expect(response.status).toBe(400);
    expect(response.text).toContain('Webhook Error: DB connection failed');
  });

  describe('Testing Cycle 3: Fuzzing Webhook Endpoints', () => {
    it('returns 401 on missing signature when secret is configured', async () => {
      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(401);
    });

    it('gracefully handles completely empty payloads', async () => {
      const payloadStr = JSON.stringify({});
      const signature = generateStripeSignature(payloadStr);

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', signature)
        .send(payloadStr);

      // Should return 200, but hit the "Unhandled event type" log branch.
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
    });

    it('gracefully handles missing data objects', async () => {
      // payload missing 'data.object' structure
      const payload = { type: 'payment.completed' };

      const payloadStr = JSON.stringify(payload);
      const signature = generateStripeSignature(payloadStr);

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', signature)
        .send(payloadStr);

      // Should hit catch block or safely handle undefined chains without crashing express app
      // Because `handlePaymentCompleted` expects `event.data`, it will read undefined
      // and amount will equal NaN, triggering an SQL fail, or crashing.
      expect(response.status).toBe(400); // DB failure or TypeError caught safely
    });

    it('gracefully handles malformed string payloads via raw body buffer parsing', async () => {
      const payloadStr = '{"invalid_json": true';
      const signature = generateStripeSignature(payloadStr);

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', signature)
        .send(payloadStr); // Malformed JSON string

      expect(response.status).toBe(400);
    });
  });

});
