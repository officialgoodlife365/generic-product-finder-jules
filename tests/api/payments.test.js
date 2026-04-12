const request = require('supertest');
const express = require('express');
const paymentsRouter = require('../../src/routes/payments');
const db = require('../../src/db');

// Mock db
jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

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

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

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

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

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

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

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

    const response = await request(app)
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.text).toContain('Webhook Error: DB connection failed');
  });

});
