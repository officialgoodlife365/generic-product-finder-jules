const AntiFraudEngine = require('../../src/services/defense/AntiFraudEngine');
const db = require('../../src/db');
const logger = require('../../src/utils/logger');

jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

describe('AntiFraudEngine', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBulkDownload', () => {
    it('ignores new buyers or bundles', async () => {
      const res = await AntiFraudEngine.checkBulkDownload('test@test.com', 50, true, false);
      expect(res.flagged).toBe(false);
    });

    it('flags rate_limited on 11 downloads', async () => {
      const res = await AntiFraudEngine.checkBulkDownload('test@test.com', 11);
      expect(res.flagged).toBe(true);
      expect(res.alertLevel).toBe(2);
      expect(res.autoAction).toBe('rate_limited');
      expect(db.query).toHaveBeenCalled();
    });

    it('flags suspended on > 20 downloads', async () => {
      const res = await AntiFraudEngine.checkBulkDownload('test@test.com', 21);
      expect(res.flagged).toBe(true);
      expect(res.alertLevel).toBe(3);
      expect(res.autoAction).toBe('suspended');
    });
  });

  describe('checkSuspiciousLogins', () => {
    it('flags Level 3 for 10+ IPs', async () => {
      const res = await AntiFraudEngine.checkSuspiciousLogins('test@test.com', 12);
      expect(res.flagged).toBe(true);
      expect(res.alertLevel).toBe(3);
      expect(res.autoAction).toBe('suspended');
    });
  });

  describe('checkSerialRefunder', () => {
    it('flags Level 2 for exactly 2 refunds', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ refund_count: '2' }] });
      const res = await AntiFraudEngine.checkSerialRefunder('test@test.com');
      expect(res.flagged).toBe(true);
      expect(res.alertLevel).toBe(2);
      expect(res.autoAction).toBe('flagged');
    });

    it('flags Level 3 for 3+ refunds', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ refund_count: '4' }] });
      const res = await AntiFraudEngine.checkSerialRefunder('test@test.com');
      expect(res.flagged).toBe(true);
      expect(res.alertLevel).toBe(3);
      expect(res.autoAction).toBe('blocked');
    });

    it('ignores 1 refund', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ refund_count: '1' }] });
      const res = await AntiFraudEngine.checkSerialRefunder('test@test.com');
      expect(res.flagged).toBe(false);
    });
  });

  describe('handleChargeback', () => {
    it('suspends account on chargeback', async () => {
      const res = await AntiFraudEngine.handleChargeback('test@test.com', 'txn_123');
      expect(res.flagged).toBe(true);
      expect(res.alertLevel).toBe(3);
      expect(res.autoAction).toBe('suspended');
      expect(db.query).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('t***t@test.com'));
    });
  });

  describe('logFraudEvent', () => {
    it('sanitizes PII in details object before saving', async () => {
      const details = {
        buyerEmail: 'sensitive@example.com',
        count: 5
      };
      await AntiFraudEngine.logFraudEvent('user@example.com', 'test_event', 1, 'none', details);

      const lastQueryArgs = db.query.mock.calls[0][1];
      const savedDetails = JSON.parse(lastQueryArgs[4]);

      expect(savedDetails.buyerEmail).toBe('s***e@example.com');
      expect(savedDetails.count).toBe(5);
    });
  });

});
