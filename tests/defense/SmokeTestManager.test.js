const SmokeTestManager = require('../../src/services/defense/SmokeTestManager');
const db = require('../../src/db');

jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

describe('SmokeTestManager', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null if email or type missing', async () => {
    expect(await SmokeTestManager.processSmokeTestInteraction()).toBeNull();
  });

  it('upgrades lead to warm for poll votes', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await SmokeTestManager.processSmokeTestInteraction('test@test.com', 'poll_vote');
    expect(res.success).toBe(true);
    expect(res.newTemperature).toBe('warm');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE warm_leads'),
      ['warm', 'poll_vote', 'test@test.com']
    );
  });

  it('upgrades lead to hot for pre orders', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await SmokeTestManager.processSmokeTestInteraction('test@test.com', 'pre_order');
    expect(res.success).toBe(true);
    expect(res.newTemperature).toBe('hot');
  });

  it('returns false if lead not found', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await SmokeTestManager.processSmokeTestInteraction('notfound@test.com', 'waitlist_signup');
    expect(res.success).toBe(false);
    expect(res.reason).toBe('Lead not found');
  });

});
